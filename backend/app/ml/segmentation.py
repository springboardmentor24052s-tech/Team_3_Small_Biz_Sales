import os
import math
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import joblib

MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
DEFAULT_MODEL_PATH = os.path.join(MODEL_DIR, "kmeans_segmentation.joblib")

# Predefined curated colors for business segments
SEGMENT_PALETTE = {
    "VIP Customers": {"color": "#6366f1", "badge": "primary"},
    "Loyal Customers": {"color": "#10b981", "badge": "success"},
    "High-Value Occasional Customers": {"color": "#f59e0b", "badge": "warning"},
    "Frequent Budget Customers": {"color": "#8b5cf6", "badge": "info"},
    "Potential Loyalists": {"color": "#0ea5e9", "badge": "info"},
    "New Customers": {"color": "#38bdf8", "badge": "info"},
    "At-Risk Customers": {"color": "#f43f5e", "badge": "danger"},
    "Low-Engagement Customers": {"color": "#94a3b8", "badge": "neutral"},
    "Hibernating Customers": {"color": "#64748b", "badge": "neutral"},
}

FALLBACK_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#0ea5e9", "#ec4899", "#94a3b8"]


def engineer_customer_features(
    invoices_data: List[Dict[str, Any]],
    customers_data: Optional[List[Dict[str, Any]]] = None,
    reference_date: Optional[pd.Timestamp] = None
) -> pd.DataFrame:
    """
    Aggregates invoice/transaction data into customer-level feature records.
    Calculates total_spend, total_orders, purchase_frequency, average_order_value,
    recency (days_since_last_purchase), customer_activity, active_days, total_quantity.
    """
    if not invoices_data:
        # Fallback to customer table if invoices are missing
        if customers_data:
            df_cust = pd.DataFrame(customers_data)
            df_features = pd.DataFrame({
                "customer_id": df_cust["customer_id"],
                "country": df_cust.get("country", "United Kingdom"),
                "total_spend": df_cust.get("lifetime_value", 500.0),
                "total_orders": 5,
                "purchase_frequency": 5.0,
                "average_order_value": df_cust.get("lifetime_value", 500.0) / 5,
                "total_quantity": 25,
                "recency": 30,
                "days_since_last_purchase": 30,
                "active_days": 3,
                "customer_activity": 60.0,
                "first_purchase": "2011-01-10",
                "last_purchase": "2011-12-01",
            })
            return df_features
        return pd.DataFrame()

    df_inv = pd.DataFrame(invoices_data)

    # Filter out missing customer IDs
    df_inv = df_inv.dropna(subset=["customer_id"])
    df_inv["customer_id"] = df_inv["customer_id"].astype(int)

    # Ensure invoice_date is datetime
    df_inv["invoice_date"] = pd.to_datetime(df_inv["invoice_date"])
    df_inv["total_amount"] = pd.to_numeric(df_inv["total_amount"], errors="coerce").fillna(0.0)
    df_inv["item_count"] = pd.to_numeric(df_inv.get("item_count", 1), errors="coerce").fillna(1).astype(int)
    df_inv["is_return"] = df_inv.get("is_return", False).astype(bool)

    if reference_date is None:
        reference_date = df_inv["invoice_date"].max() + pd.Timedelta(days=1)

    customer_map = {}
    if customers_data:
        for c in customers_data:
            customer_map[int(c["customer_id"])] = c

    features_list = []
    grouped = df_inv.groupby("customer_id")

    for cust_id, group in grouped:
        non_return = group[~group["is_return"]]
        returns = group[group["is_return"]]

        # Spend calculations
        gross_spend = non_return["total_amount"].sum()
        return_spend = abs(returns["total_amount"].sum())
        total_spend = max(0.0, gross_spend - return_spend)

        # Order counts
        total_orders = max(1, len(non_return))
        total_quantity = max(1, non_return["item_count"].sum())

        # Dates & Recency
        first_purchase = group["invoice_date"].min()
        last_purchase = group["invoice_date"].max()
        days_since_last = max(0, (reference_date - last_purchase).days)
        lifespan_days = max(1, (last_purchase - first_purchase).days)

        # Unique active days
        active_days = group["invoice_date"].dt.date.nunique()

        # Average Order Value
        average_order_value = total_spend / total_orders if total_orders > 0 else 0.0

        # Purchase frequency (normalized by months active or total orders)
        active_months = max(1.0, lifespan_days / 30.0)
        purchase_frequency = round(total_orders / active_months, 2)

        # Customer Activity score (0 to 100)
        # Combines order frequency, consistency, and penalizes high recency (inactivity)
        recency_penalty = 1.0 / (1.0 + (days_since_last / 30.0))
        frequency_boost = min(5.0, total_orders / 2.0)
        activity_raw = (frequency_boost * 15.0 + (active_days * 5.0)) * recency_penalty
        customer_activity = round(min(100.0, max(5.0, activity_raw)), 1)

        # Country metadata
        country = "United Kingdom"
        if cust_id in customer_map and customer_map[cust_id].get("country"):
            country = customer_map[cust_id]["country"]
        elif "country" in group.columns and not group["country"].empty:
            country = group["country"].iloc[0]

        features_list.append({
            "customer_id": int(cust_id),
            "country": country,
            "total_spend": round(float(total_spend), 2),
            "total_orders": int(total_orders),
            "purchase_frequency": float(purchase_frequency),
            "average_order_value": round(float(average_order_value), 2),
            "total_quantity": int(total_quantity),
            "days_since_last_purchase": int(days_since_last),
            "recency": int(days_since_last),
            "active_days": int(active_days),
            "customer_activity": float(customer_activity),
            "first_purchase": first_purchase.strftime("%Y-%m-%d"),
            "last_purchase": last_purchase.strftime("%Y-%m-%d"),
        })

    # Include customers without invoices if present in customers_data
    existing_ids = {f["customer_id"] for f in features_list}
    if customers_data:
        for c in customers_data:
            cid = int(c["customer_id"])
            if cid not in existing_ids:
                ltv = float(c.get("lifetime_value", 0.0))
                features_list.append({
                    "customer_id": cid,
                    "country": c.get("country", "United Kingdom"),
                    "total_spend": round(ltv, 2),
                    "total_orders": 1,
                    "purchase_frequency": 1.0,
                    "average_order_value": round(ltv, 2),
                    "total_quantity": 1,
                    "days_since_last_purchase": 60,
                    "recency": 60,
                    "active_days": 1,
                    "customer_activity": 20.0,
                    "first_purchase": str(c.get("first_purchase", "2011-01-01"))[:10],
                    "last_purchase": str(c.get("last_purchase", "2011-10-01"))[:10],
                })

    df_features = pd.DataFrame(features_list)
    return df_features


def clean_and_winsorize_features(df: pd.DataFrame, feature_cols: List[str]) -> pd.DataFrame:
    """
    Cleans missing values and applies 99th percentile capping (winsorization)
    to prevent extreme outliers from distorting K-Means cluster centers.
    """
    df_clean = df.copy()
    for col in feature_cols:
        if col in df_clean.columns:
            # Fill missing or infinite
            df_clean[col] = pd.to_numeric(df_clean[col], errors="coerce").fillna(0.0)
            df_clean[col] = df_clean[col].replace([np.inf, -np.inf], 0.0)
            # Winsorize upper 1%
            p99 = df_clean[col].quantile(0.99)
            if p99 > 0:
                df_clean[col] = np.clip(df_clean[col], a_min=0.0, a_max=p99)
    return df_clean


def evaluate_kmeans_clusters(
    X_scaled: np.ndarray,
    min_k: int = 2,
    max_k: int = 8,
    random_state: int = 42
) -> Tuple[int, float, float, List[Dict[str, Any]], Dict[int, KMeans]]:
    """
    Evaluates KMeans clustering across K from min_k to max_k.
    Computes Inertia and Silhouette Score for each K.
    Selects optimal K with the highest valid Silhouette Score.
    """
    n_samples = X_scaled.shape[0]
    effective_max_k = min(max_k, n_samples - 1)
    if effective_max_k < min_k:
        effective_max_k = min_k

    elbow_data = []
    models = {}
    best_k = min_k
    best_silhouette = -1.0
    best_inertia = 0.0

    for k in range(min_k, effective_max_k + 1):
        kmeans = KMeans(
            n_clusters=k,
            init="k-means++",
            n_init=10,
            max_iter=300,
            random_state=random_state
        )
        labels = kmeans.fit_predict(X_scaled)
        inertia = float(kmeans.inertia_)
        models[k] = kmeans

        # Silhouette score requires at least 2 distinct clusters with > 1 sample each
        unique_labels = len(np.unique(labels))
        if unique_labels > 1 and unique_labels < n_samples:
            try:
                sil_score = float(silhouette_score(X_scaled, labels))
            except Exception:
                sil_score = 0.0
        else:
            sil_score = 0.0

        elbow_data.append({
            "k": k,
            "inertia": round(inertia, 2),
            "silhouette_score": round(sil_score, 4)
        })

        if sil_score > best_silhouette:
            best_silhouette = sil_score
            best_k = k
            best_inertia = inertia

    # If all silhouette scores are <= 0, default to k=3 or best available
    if best_k not in models:
        best_k = min_k
        best_inertia = elbow_data[0]["inertia"] if elbow_data else 0.0
        best_silhouette = elbow_data[0]["silhouette_score"] if elbow_data else 0.0

    return best_k, round(best_silhouette, 4), round(best_inertia, 2), elbow_data, models


def assign_dynamic_segment_names(
    cluster_stats: List[Dict[str, Any]],
    overall_means: Dict[str, float]
) -> List[Dict[str, Any]]:
    """
    Analyzes cluster characteristics (mean spend, frequency, recency, activity)
    and dynamically assigns meaningful business segment names.
    """
    n_clusters = len(cluster_stats)
    if n_clusters == 0:
        return []

    # Sort clusters by a composite value score (spend * 0.5 + frequency * 0.3 + activity * 0.2)
    ranked_clusters = []
    for c in cluster_stats:
        spend = c["average_spend"]
        freq = c["average_frequency"]
        recency = c["average_recency"]
        activity = c["average_activity"]
        aov = c["average_order_value"]

        spend_ratio = spend / max(1.0, overall_means.get("spend", 1.0))
        freq_ratio = freq / max(0.1, overall_means.get("frequency", 1.0))
        recency_ratio = recency / max(1.0, overall_means.get("recency", 1.0))
        activity_ratio = activity / max(1.0, overall_means.get("activity", 1.0))
        aov_ratio = aov / max(1.0, overall_means.get("aov", 1.0))

        ranked_clusters.append({
            "data": c,
            "spend_ratio": spend_ratio,
            "freq_ratio": freq_ratio,
            "recency_ratio": recency_ratio,
            "activity_ratio": activity_ratio,
            "aov_ratio": aov_ratio
        })

    # Sort from highest value to lowest value
    ranked_clusters.sort(
        key=lambda x: (x["spend_ratio"] * 0.45 + x["freq_ratio"] * 0.3 + x["activity_ratio"] * 0.25 - x["recency_ratio"] * 0.2),
        reverse=True
    )

    used_names = set()
    enriched_clusters = []

    for rank_idx, item in enumerate(ranked_clusters):
        c = item["data"]
        s_r = item["spend_ratio"]
        f_r = item["freq_ratio"]
        r_r = item["recency_ratio"]
        act_r = item["activity_ratio"]
        aov_r = item["aov_ratio"]

        # Classification decision hierarchy
        if rank_idx == 0 and s_r >= 1.15 and (f_r >= 0.9 or act_r >= 0.9):
            candidate = "VIP Customers"
            desc = "Highest lifetime spend, superior order frequency, and peak engagement."
            strategy = "Exclusive VIP perks, early product access, dedicated support & executive loyalty rewards."
        elif f_r >= 1.05 and s_r >= 0.75 and r_r <= 1.25:
            candidate = "Loyal Customers"
            desc = "Consistent purchase rhythm and steady spend with high brand loyalty."
            strategy = "Tiered reward milestones, referral bonuses, and subscription/replenishment incentives."
        elif s_r >= 1.05 and aov_r >= 1.1 and f_r < 1.0:
            candidate = "High-Value Occasional Customers"
            desc = "Substantial basket sizes with lower purchase frequency."
            strategy = "Curated bundle recommendations, event-driven promotions, and cross-sell campaigns."
        elif f_r >= 0.95 and s_r < 0.85:
            candidate = "Frequent Budget Customers"
            desc = "High transaction frequency with modest basket values."
            strategy = "Volume discounts, minimum spend thresholds for free shipping, and cross-sell add-ons."
        elif r_r >= 1.25 and (s_r >= 0.65 or f_r >= 0.65):
            candidate = "At-Risk Customers"
            desc = "Historically valuable customers whose purchasing frequency has sharply declined."
            strategy = "Win-back email sequences, targeted reactivations with limited-time discounts, and feedback surveys."
        elif r_r <= 0.85 and f_r <= 0.85 and c["average_orders"] <= 2.5:
            candidate = "New Customers"
            desc = "Recently acquired customers with initial purchases."
            strategy = "Onboarding sequences, welcome back promotions, and product discovery guides."
        elif r_r >= 1.15 and act_r < 0.75:
            candidate = "Low-Engagement Customers"
            desc = "Infrequent orders, low basket totals, and extended dormancy."
            strategy = "Automated low-cost re-engagement prompts and seasonal clearance alerts."
        else:
            candidate = "Potential Loyalists"
            desc = "Promising recent buyers with expanding purchase volume."
            strategy = "Membership rewards, personalized product suggestions, and upsell journeys."

        # Guarantee unique segment names
        final_name = candidate
        counter = 2
        while final_name in used_names:
            if candidate == "VIP Customers":
                final_name = "Champions"
            elif candidate == "Loyal Customers":
                final_name = "Core Repeat Buyers"
            elif candidate == "At-Risk Customers":
                final_name = "Declining Engagement"
            elif candidate == "Low-Engagement Customers":
                final_name = "Hibernating Customers"
            elif candidate == "Potential Loyalists":
                final_name = "Promising Growth"
            else:
                final_name = f"{candidate} ({counter})"
                counter += 1

        used_names.add(final_name)

        palette = SEGMENT_PALETTE.get(
            final_name,
            {"color": FALLBACK_COLORS[c["cluster_id"] % len(FALLBACK_COLORS)], "badge": "neutral"}
        )

        c["segment_name"] = final_name
        c["color"] = palette["color"]
        c["badge"] = palette["badge"]
        c["description"] = desc
        c["strategy"] = strategy
        enriched_clusters.append(c)

    # Re-sort back by original cluster_id for stability
    enriched_clusters.sort(key=lambda x: x["cluster_id"])
    return enriched_clusters


def run_full_clustering_pipeline(
    invoices_data: List[Dict[str, Any]],
    customers_data: Optional[List[Dict[str, Any]]] = None,
    min_k: int = 2,
    max_k: int = 8,
    random_state: int = 42,
    save_path: Optional[str] = None
) -> Dict[str, Any]:
    """
    Complete end-to-end unsupervised learning segmentation pipeline:
    1. Extracts customer features from transaction history.
    2. Winsorizes and cleans feature distributions.
    3. Fits StandardScaler.
    4. Evaluates K=2..8 with Silhouette Score & Inertia.
    5. Fits optimal KMeans model.
    6. Profiles cluster statistics and assigns dynamic business segment names.
    7. Persists model and returns full training metrics and customer assignments.
    """
    # 1. Feature Engineering
    df_features = engineer_customer_features(invoices_data, customers_data)
    if df_features.empty or len(df_features) < 2:
        raise ValueError("Insufficient customer transaction records to perform clustering.")

    # 2. Select primary clustering features
    feature_cols = [
        "purchase_frequency",
        "total_spend",
        "recency",
        "average_order_value",
        "customer_activity"
    ]

    df_clean = clean_and_winsorize_features(df_features, feature_cols)
    X = df_clean[feature_cols].values

    # 3. Preprocessing with StandardScaler
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # 4. K-Means Evaluation & Optimal K Selection
    best_k, sil_score, inertia, elbow_data, models = evaluate_kmeans_clusters(
        X_scaled, min_k=min_k, max_k=max_k, random_state=random_state
    )

    final_model = models[best_k]
    labels = final_model.labels_
    df_clean["cluster_id"] = labels

    # 5. Profile Clusters
    total_customers = len(df_clean)
    total_platform_revenue = float(df_clean["total_spend"].sum())

    overall_means = {
        "spend": float(df_clean["total_spend"].mean()),
        "frequency": float(df_clean["purchase_frequency"].mean()),
        "recency": float(df_clean["recency"].mean()),
        "activity": float(df_clean["customer_activity"].mean()),
        "aov": float(df_clean["average_order_value"].mean()),
    }

    cluster_stats = []
    for c_id in range(best_k):
        sub = df_clean[df_clean["cluster_id"] == c_id]
        c_count = len(sub)
        pct = round((c_count / total_customers) * 100.0, 1) if total_customers > 0 else 0.0
        rev = float(sub["total_spend"].sum())
        rev_pct = round((rev / total_platform_revenue) * 100.0, 1) if total_platform_revenue > 0 else 0.0

        cluster_stats.append({
            "cluster_id": int(c_id),
            "segment_id": int(c_id),
            "customer_count": int(c_count),
            "percentage_of_customers": float(pct),
            "total_revenue": round(rev, 2),
            "revenue_percentage": float(rev_pct),
            "average_spend": round(float(sub["total_spend"].mean()), 2) if c_count > 0 else 0.0,
            "average_order_value": round(float(sub["average_order_value"].mean()), 2) if c_count > 0 else 0.0,
            "average_frequency": round(float(sub["purchase_frequency"].mean()), 2) if c_count > 0 else 0.0,
            "average_recency": round(float(sub["recency"].mean()), 1) if c_count > 0 else 0.0,
            "average_activity": round(float(sub["customer_activity"].mean()), 1) if c_count > 0 else 0.0,
            "average_orders": round(float(sub["total_orders"].mean()), 1) if c_count > 0 else 0.0,
        })

    # 6. Dynamic Segment Naming
    enriched_clusters = assign_dynamic_segment_names(cluster_stats, overall_means)
    cluster_to_name = {c["cluster_id"]: c["segment_name"] for c in enriched_clusters}
    cluster_to_color = {c["cluster_id"]: c["color"] for c in enriched_clusters}

    df_clean["segment_name"] = df_clean["cluster_id"].map(cluster_to_name)
    df_clean["color"] = df_clean["cluster_id"].map(cluster_to_color)

    # 7. Customer list formatting
    customers_result = []
    for _, row in df_clean.iterrows():
        customers_result.append({
            "customer_id": int(row["customer_id"]),
            "country": str(row["country"]),
            "segment_id": int(row["cluster_id"]),
            "segment_name": str(row["segment_name"]),
            "color": str(row["color"]),
            "total_spend": round(float(row["total_spend"]), 2),
            "total_orders": int(row["total_orders"]),
            "purchase_frequency": round(float(row["purchase_frequency"]), 2),
            "average_order_value": round(float(row["average_order_value"]), 2),
            "recency": int(row["recency"]),
            "activity": round(float(row["customer_activity"]), 1),
            "first_purchase": str(row["first_purchase"]),
            "last_purchase": str(row["last_purchase"]),
        })

    # Highest value segment
    highest_value_segment = max(enriched_clusters, key=lambda x: x["average_spend"])["segment_name"]

    # 8. Model Persistence
    save_target = save_path or DEFAULT_MODEL_PATH
    os.makedirs(os.path.dirname(save_target), exist_ok=True)

    artifact = {
        "model": final_model,
        "scaler": scaler,
        "feature_cols": feature_cols,
        "optimal_k": best_k,
        "silhouette_score": sil_score,
        "inertia": inertia,
        "elbow_curve": elbow_data,
        "segments": enriched_clusters,
        "overall_means": overall_means,
        "total_customers": total_customers,
        "total_revenue": round(total_platform_revenue, 2),
        "highest_value_segment": highest_value_segment,
    }
    joblib.dump(artifact, save_target)

    return {
        "status": "success",
        "selected_k": best_k,
        "silhouette_score": sil_score,
        "inertia": inertia,
        "total_customers": total_customers,
        "total_segments": best_k,
        "total_revenue": round(total_platform_revenue, 2),
        "highest_value_segment": highest_value_segment,
        "feature_names": feature_cols,
        "elbow_curve": elbow_data,
        "segments": enriched_clusters,
        "customers": customers_result,
    }


def load_cached_segmentation_artifact(model_path: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Loads saved model artifact from disk if available.
    """
    target = model_path or DEFAULT_MODEL_PATH
    if os.path.exists(target):
        try:
            return joblib.load(target)
        except Exception as e:
            print(f"[MarketMind ML] Warning: could not load cached model: {e}")
            return None
    return None
