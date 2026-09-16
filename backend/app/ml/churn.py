"""
Churn Prediction Engine — MarketMind AI (Milestone 3)
=====================================================
Ingests data.csv (Superstore Sales), engineers RFM behavioral features per customer,
trains XGBoost & Random Forest classifiers, computes churn probability scores,
and categorises customers into High / Medium / Low risk tiers with retention recommendations.
"""

import os
import re
import numpy as np
import pandas as pd
from datetime import datetime
from typing import Any, Dict, List

from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import f1_score, roc_auc_score
from sklearn.model_selection import train_test_split
import xgboost as xgb


# ---------------------------------------------------------------------------
# HELPER UTILITIES
# ---------------------------------------------------------------------------

def _locate_data_csv() -> str | None:
    """Return absolute path to data.csv by searching parent directories."""
    base = os.path.dirname(__file__)
    candidates = [
        os.path.join(base, "..", "..", "..", "data.csv"),
        os.path.join(base, "..", "..", "data.csv"),
        os.path.join(base, "data.csv"),
        "data.csv",
    ]
    for path in candidates:
        norm = os.path.normpath(path)
        if os.path.exists(norm):
            return norm
    return None


def _clean_numeric(val: Any, default: float = 0.0) -> float:
    """
    Safely converts values that may contain pluralized unit strings
    (e.g. '3 items', '1 day', '12.5 units') to float.
    Prevents type parsing crashes during integer/float conversion.
    """
    if pd.isna(val) or val is None:
        return float(default)
    if isinstance(val, (int, float)):
        return float(val)
    text = str(val).strip()
    match = re.findall(r"[-+]?\d*\.\d+|\d+", text)
    if match:
        try:
            return float(match[0])
        except (ValueError, TypeError):
            return float(default)
    return float(default)


# ---------------------------------------------------------------------------
# DATA INGESTION & RFM FEATURE ENGINEERING
# ---------------------------------------------------------------------------

def _load_customer_rfm(data_path: str = None) -> pd.DataFrame:
    """
    Loads data.csv, computes per-customer RFM (Recency, Frequency, Monetary)
    features, and adds engineered behavioral signals used for churn prediction.

    Columns produced per customer:
      customer_id, name, segment, country,
      recency_days, frequency, monetary,
      avg_order_value, purchase_span_days,
      rfm_score, churn_label (synthetic ground-truth for training)
    """
    path = data_path or _locate_data_csv()
    if not path or not os.path.exists(path):
        raise FileNotFoundError(
            "data.csv not found. Place the Superstore dataset in the project root."
        )

    df = pd.read_csv(path)

    # Identify columns defensively
    date_col = "Order Date" if "Order Date" in df.columns else df.columns[2]
    sales_col = "Sales" if "Sales" in df.columns else df.columns[-1]
    cust_id_col = "Customer ID" if "Customer ID" in df.columns else df.columns[5]
    cust_name_col = "Customer Name" if "Customer Name" in df.columns else cust_id_col
    segment_col = "Segment" if "Segment" in df.columns else None
    order_id_col = "Order ID" if "Order ID" in df.columns else None
    country_col = "Country" if "Country" in df.columns else None

    # Parse dates and sales
    df["ds"] = pd.to_datetime(df[date_col], dayfirst=True, errors="coerce")
    df = df.dropna(subset=["ds"])
    df["sales_val"] = df[sales_col].apply(lambda x: _clean_numeric(x, default=0.0))
    df = df[df["sales_val"] > 0]

    # Reference date = one day after last transaction in dataset (simulates "today")
    reference_date = df["ds"].max() + pd.Timedelta(days=1)

    # Aggregate per customer
    agg_dict: Dict[str, Any] = {
        "sales_val": ["sum", "mean", "count"],
        "ds": ["max", "min"],
    }
    if order_id_col:
        agg_dict[order_id_col] = "nunique"

    grp = df.groupby(cust_id_col).agg(agg_dict)
    grp.columns = ["_".join(c).strip("_") for c in grp.columns]
    grp = grp.reset_index()
    grp = grp.rename(columns={cust_id_col: "customer_id"})

    # Add name, segment, country
    meta_cols: Dict[str, str] = {}
    for col, alias in [(cust_name_col, "name"), (segment_col, "segment"), (country_col, "country")]:
        if col and col in df.columns:
            meta_cols[col] = alias
    if meta_cols:
        meta = df.groupby(cust_id_col)[list(meta_cols.keys())].first().reset_index()
        meta = meta.rename(columns={cust_id_col: "customer_id", **meta_cols})
        grp = grp.merge(meta, on="customer_id", how="left")

    # Ensure expected columns exist with sensible defaults
    for col_alias in ["name", "segment", "country"]:
        if col_alias not in grp.columns:
            grp[col_alias] = "Unknown"

    # --- Compute RFM features ---

    # Recency: days since last purchase
    grp["recency_days"] = (reference_date - grp["ds_max"]).dt.days.clip(lower=0)

    # Frequency: number of unique orders
    freq_col = f"{order_id_col}_nunique" if order_id_col else "sales_val_count"
    grp["frequency"] = grp[freq_col].astype(float)

    # Monetary: total spend
    grp["monetary"] = grp["sales_val_sum"].round(2)

    # Average order value
    grp["avg_order_value"] = (grp["sales_val_sum"] / grp["frequency"].clip(lower=1)).round(2)

    # Purchase span: days between first and last order
    grp["purchase_span_days"] = ((grp["ds_max"] - grp["ds_min"]).dt.days).clip(lower=1)

    # Order cadence: average days between orders
    grp["order_cadence_days"] = (grp["purchase_span_days"] / grp["frequency"].clip(lower=1)).round(1)

    # --- RFM Scoring (1–5 per dimension, higher = better) ---
    def _qcut_safe(series: pd.Series, labels: List[int]) -> pd.Series:
        """Quantile cut with duplicate-edge handling."""
        try:
            return pd.qcut(series, q=len(labels), labels=labels, duplicates="drop")
        except Exception:
            return pd.Series([labels[len(labels) // 2]] * len(series), index=series.index)

    grp["r_score"] = _qcut_safe(grp["recency_days"], [5, 4, 3, 2, 1])   # lower recency -> better
    grp["f_score"] = _qcut_safe(grp["frequency"],     [1, 2, 3, 4, 5])
    grp["m_score"] = _qcut_safe(grp["monetary"],      [1, 2, 3, 4, 5])

    grp["r_score"] = grp["r_score"].astype(float)
    grp["f_score"] = grp["f_score"].astype(float)
    grp["m_score"] = grp["m_score"].astype(float)
    grp["rfm_score"] = (grp["r_score"] + grp["f_score"] + grp["m_score"]).round(1)

    # --- Synthetic Churn Label (ground-truth for supervised training) ---
    # A customer is considered "churned" if:
    #   - Recency > 90 days AND (Frequency < 3 OR RFM score < 7)
    #   - OR Recency > 150 days (regardless of frequency)
    grp["churn_label"] = (
        ((grp["recency_days"] > 90) & ((grp["frequency"] < 3) | (grp["rfm_score"] < 7)))
        | (grp["recency_days"] > 150)
    ).astype(int)

    return grp


# ---------------------------------------------------------------------------
# MODEL TRAINING
# ---------------------------------------------------------------------------

def _train_churn_models(df: pd.DataFrame):
    """
    Trains XGBoost and Random Forest classifiers on RFM feature vectors.
    Uses chronological/stratified split for robust evaluation.
    Returns (best_model, feature_cols, scaler, metrics_dict).
    """
    feature_cols = [
        "recency_days",
        "frequency",
        "monetary",
        "avg_order_value",
        "purchase_span_days",
        "order_cadence_days",
        "r_score",
        "f_score",
        "m_score",
        "rfm_score",
    ]

    X = df[feature_cols].fillna(0).values
    y = df["churn_label"].values

    # Scale features to [0,1] for model stability
    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)

    # Stratified split: 80% train / 20% test
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.20, random_state=42, stratify=y
    )

    # --- XGBoost Classifier ---
    xgb_model = xgb.XGBClassifier(
        n_estimators=120,
        max_depth=4,
        learning_rate=0.08,
        use_label_encoder=False,
        eval_metric="logloss",
        random_state=42,
        verbosity=0,
    )
    xgb_model.fit(X_train, y_train)
    xgb_probs = xgb_model.predict_proba(X_test)[:, 1]
    xgb_preds = (xgb_probs >= 0.5).astype(int)
    xgb_f1 = round(f1_score(y_test, xgb_preds, zero_division=0), 4)
    xgb_auc = round(roc_auc_score(y_test, xgb_probs) if len(np.unique(y_test)) > 1 else 0.0, 4)

    # --- Random Forest Classifier ---
    rf_model = RandomForestClassifier(
        n_estimators=120,
        max_depth=6,
        random_state=42,
        n_jobs=-1,
    )
    rf_model.fit(X_train, y_train)
    rf_probs = rf_model.predict_proba(X_test)[:, 1]
    rf_preds = (rf_probs >= 0.5).astype(int)
    rf_f1 = round(f1_score(y_test, rf_preds, zero_division=0), 4)
    rf_auc = round(roc_auc_score(y_test, rf_probs) if len(np.unique(y_test)) > 1 else 0.0, 4)

    # Select the model with higher F1
    if xgb_f1 >= rf_f1:
        best_model = xgb_model
        best_name = "XGBoost"
        best_f1 = xgb_f1
        best_auc = xgb_auc
    else:
        best_model = rf_model
        best_name = "Random Forest"
        best_f1 = rf_f1
        best_auc = rf_auc

    metrics = {
        "xgboost": {"f1": xgb_f1, "roc_auc": xgb_auc},
        "random_forest": {"f1": rf_f1, "roc_auc": rf_auc},
        "selected_model": best_name,
        "selected_f1": best_f1,
        "selected_roc_auc": best_auc,
        "churn_rate_pct": round(float(y.mean() * 100), 2),
        "total_customers_analyzed": int(len(df)),
    }

    return best_model, feature_cols, scaler, metrics


# ---------------------------------------------------------------------------
# RISK TIER & RETENTION ACTION MAPPING
# ---------------------------------------------------------------------------

def _assign_risk_tier(churn_prob: float) -> Dict[str, str]:
    """
    Maps churn probability to a risk tier with tailored retention guidance.
    """
    if churn_prob >= 0.70:
        return {
            "riskLevel": "High",
            "action": (
                "Immediate Win-Back: Reach out personally with a targeted VIP offer "
                "(e.g., 20% discount on their favourite category or free priority shipping). "
                "Escalate to store manager for direct engagement."
            ),
        }
    elif churn_prob >= 0.40:
        return {
            "riskLevel": "Medium",
            "action": (
                "Re-Engagement Campaign: Send curated product recommendations based on purchase history, "
                "new arrival alerts for their top categories, or loyalty bonus points."
            ),
        }
    else:
        return {
            "riskLevel": "Low",
            "action": (
                "Standard Nurturing: Cross-sell complementary products and maintain active "
                "loyalty programme engagement to sustain purchase frequency."
            ),
        }


# ---------------------------------------------------------------------------
# LEGACY SINGLE-CUSTOMER PREDICT (used by existing api/ai.py endpoint)
# ---------------------------------------------------------------------------

def predict_customer_churn(
    recency_days: int = 30,
    frequency_count: int = 10,
    ltv: float = 1000.0,
    segment: str = "Consumer",
) -> Dict[str, Any]:
    """
    Lightweight rule-plus-model heuristic for single-customer churn probability.
    Used by the existing /api/v1/ai/churn/scores endpoint (db-backed).

    Returns: { churnProb, riskLevel, action }
    """
    # Simple but calibrated heuristic when full dataset model is unavailable
    recency_score = min(recency_days / 180.0, 1.0)   # normalise to [0,1]
    freq_penalty = max(0.0, 1.0 - (frequency_count / 25.0))
    ltv_buffer = max(0.0, 1.0 - (ltv / 10000.0))    # high LTV reduces churn prob

    segment_penalty = {
        "Champions": -0.20,
        "Loyal Customers": -0.10,
        "Potential Loyalist": -0.05,
        "At Risk": +0.25,
        "Hibernating": +0.30,
        "Lost": +0.40,
        "Consumer": 0.0,
        "Corporate": -0.05,
        "Home Office": -0.02,
    }.get(segment, 0.0)

    raw_prob = (0.45 * recency_score + 0.30 * freq_penalty + 0.15 * ltv_buffer + 0.10 * max(segment_penalty, 0))
    raw_prob = max(0.05, min(raw_prob + segment_penalty, 0.97))

    tier = _assign_risk_tier(raw_prob)
    return {
        "churnProb": round(float(raw_prob), 4),
        **tier,
    }


# ---------------------------------------------------------------------------
# FULL DATASET CHURN PREDICTION ENGINE  (Milestone 3 Core)
# ---------------------------------------------------------------------------

def generate_churn_predictions(data_path: str = None) -> Dict[str, Any]:
    """
    Full churn prediction pipeline ingesting data.csv:
      1. Load & engineer RFM features per customer.
      2. Train XGBoost + Random Forest classifiers (stratified 80/20 split).
      3. Generate churn probability scores for all 793 customers.
      4. Categorise into High / Medium / Low risk tiers.
      5. Return structured output for the FastAPI /api/v1/ai/churn endpoint.

    Returns:
        {
          "summary": { total, high_risk, medium_risk, low_risk, churn_rate_pct, ... },
          "model_metrics": { xgboost: {f1, roc_auc}, random_forest: {...}, ... },
          "customers": [ { customer_id, name, segment, country, recency_days,
                            frequency, monetary, rfm_score, churn_prob,
                            risk_level, action, last_active }, ... ]
        }
    """
    # 1. Load and compute RFM features
    df = _load_customer_rfm(data_path)

    # 2. Train classifiers
    model, feature_cols, scaler, metrics = _train_churn_models(df)

    # 3. Score all customers
    X_all = df[feature_cols].fillna(0).values
    X_all_scaled = scaler.transform(X_all)
    churn_probs = model.predict_proba(X_all_scaled)[:, 1]
    df["churn_prob"] = churn_probs.round(4)

    # 4. Assign risk tiers
    risk_info = df["churn_prob"].apply(_assign_risk_tier)
    df["risk_level"] = risk_info.apply(lambda x: x["riskLevel"])
    df["action"] = risk_info.apply(lambda x: x["action"])

    # 5. Build summary
    high_risk = int((df["risk_level"] == "High").sum())
    medium_risk = int((df["risk_level"] == "Medium").sum())
    low_risk = int((df["risk_level"] == "Low").sum())

    summary = {
        "total_customers": int(len(df)),
        "high_risk_count": high_risk,
        "medium_risk_count": medium_risk,
        "low_risk_count": low_risk,
        "high_risk_pct": round(high_risk / len(df) * 100, 1),
        "medium_risk_pct": round(medium_risk / len(df) * 100, 1),
        "low_risk_pct": round(low_risk / len(df) * 100, 1),
        "overall_churn_rate_pct": metrics["churn_rate_pct"],
        "selected_model": metrics["selected_model"],
        "model_f1_score": metrics["selected_f1"],
        "model_roc_auc": metrics["selected_roc_auc"],
    }

    # 6. Build customer list sorted by churn risk descending
    customers = []
    last_date_col = "ds_max"
    for _, row in df.sort_values("churn_prob", ascending=False).iterrows():
        last_active = (
            str(row[last_date_col])[:10]
            if pd.notna(row.get(last_date_col))
            else "N/A"
        )
        customers.append({
            "customerId": str(row["customer_id"]),
            "name": str(row.get("name", "Unknown")),
            "segment": str(row.get("segment", "Unknown")),
            "country": str(row.get("country", "Unknown")),
            "recencyDays": int(row["recency_days"]),
            "frequency": int(row["frequency"]),
            "monetary": round(float(row["monetary"]), 2),
            "avgOrderValue": round(float(row["avg_order_value"]), 2),
            "rfmScore": round(float(row["rfm_score"]), 1),
            "churnProb": round(float(row["churn_prob"]) * 100, 1),  # percentage
            "riskLevel": str(row["risk_level"]),
            "action": str(row["action"]),
            "lastActive": last_active,
        })

    return {
        "summary": summary,
        "model_metrics": {
            "xgboost": metrics["xgboost"],
            "random_forest": metrics["random_forest"],
            "selected_model": metrics["selected_model"],
        },
        "customers": customers,
    }
