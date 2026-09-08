"""
Churn Prediction Engine Unit & Integration Tests — MarketMind AI
Verifies RFM feature extraction, synthetic churn labelling,
XGBoost & Random Forest classifier training, risk tier mappings,
and batch customer scoring.
"""

import os
import sys
import pytest
import numpy as np
import pandas as pd

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.ml.churn import (
    _clean_numeric,
    _assign_risk_tier,
    predict_customer_churn,
    _load_customer_rfm,
    _train_churn_models,
    generate_churn_predictions
)

def test_clean_numeric_pluralization():
    """Verifies numeric cleaning from pluralized strings."""
    assert _clean_numeric("3 items", default=0.0) == 3.0
    assert _clean_numeric("1 item", default=0.0) == 1.0
    assert _clean_numeric("12.5 units", default=0.0) == 12.5
    assert _clean_numeric("1 day", default=0.0) == 1.0
    assert _clean_numeric("5 days", default=0.0) == 5.0
    assert _clean_numeric(None, default=0.0) == 0.0
    assert _clean_numeric("", default=0.0) == 0.0
    assert _clean_numeric(42, default=0.0) == 42.0
    assert _clean_numeric(3.14, default=0.0) == 3.14

def test_assign_risk_tier():
    """Verifies correct tier assignment and action generation based on churn probability."""
    high_tier = _assign_risk_tier(0.85)
    assert high_tier["riskLevel"] == "High"
    assert "Immediate Win-Back" in high_tier["action"]

    med_tier = _assign_risk_tier(0.55)
    assert med_tier["riskLevel"] == "Medium"
    assert "Re-Engagement" in med_tier["action"]

    low_tier = _assign_risk_tier(0.20)
    assert low_tier["riskLevel"] == "Low"
    assert "Standard Nurturing" in low_tier["action"]

    # Boundary values
    assert _assign_risk_tier(0.70)["riskLevel"] == "High"
    assert _assign_risk_tier(0.40)["riskLevel"] == "Medium"
    assert _assign_risk_tier(0.399)["riskLevel"] == "Low"

def test_predict_customer_churn_heuristic():
    """Verifies heuristic single-customer churn prediction."""
    # High risk profile (long inactive, low frequency)
    res_high = predict_customer_churn(recency_days=180, frequency_count=2, ltv=200.0, segment="Hibernating")
    assert 0.0 <= res_high["churnProb"] <= 1.0
    assert res_high["riskLevel"] == "High"

    # Medium risk profile
    res_med = predict_customer_churn(recency_days=60, frequency_count=8, ltv=1500.0, segment="Consumer")
    assert res_med["riskLevel"] == "Medium"

    # Low risk profile (very recent, high loyalty)
    res_low = predict_customer_churn(recency_days=10, frequency_count=25, ltv=8000.0, segment="Champions")
    assert res_low["riskLevel"] == "Low"

def test_load_customer_rfm():
    """Verifies RFM computation and feature engineering from data.csv."""
    df_rfm = _load_customer_rfm()
    assert df_rfm is not None
    assert len(df_rfm) > 0
    assert "customer_id" in df_rfm.columns
    assert "recency_days" in df_rfm.columns
    assert "frequency" in df_rfm.columns
    assert "monetary" in df_rfm.columns
    assert "rfm_score" in df_rfm.columns
    assert "churn_label" in df_rfm.columns
    assert set(df_rfm["churn_label"].unique()).issubset({0, 1})
    assert (df_rfm["recency_days"] >= 0).all()
    assert (df_rfm["frequency"] >= 1).all()
    assert (df_rfm["monetary"] > 0).all()

def test_train_churn_models():
    """Verifies classifier training and evaluation metrics."""
    df_rfm = _load_customer_rfm()
    model, feature_cols, scaler, metrics = _train_churn_models(df_rfm)
    
    assert model is not None
    assert len(feature_cols) >= 8
    assert scaler is not None
    assert "xgboost" in metrics
    assert "random_forest" in metrics
    assert "selected_model" in metrics
    
    # Model performance validation (must meet high standard)
    assert metrics["xgboost"]["f1"] >= 0.90
    assert metrics["xgboost"]["roc_auc"] >= 0.90
    assert metrics["random_forest"]["f1"] >= 0.90
    assert metrics["random_forest"]["roc_auc"] >= 0.90
    assert metrics["selected_model"] in ["XGBoost", "Random Forest"]

def test_generate_churn_predictions_full_pipeline():
    """Verifies the complete end-to-end churn prediction pipeline on data.csv."""
    output = generate_churn_predictions()
    
    assert "summary" in output
    assert "model_metrics" in output
    assert "customers" in output
    
    summary = output["summary"]
    assert summary["total_customers"] == 793
    assert summary["high_risk_count"] + summary["medium_risk_count"] + summary["low_risk_count"] == 793
    assert 0 <= summary["overall_churn_rate_pct"] <= 100
    
    customers = output["customers"]
    assert len(customers) == 793
    
    first_cust = customers[0]
    expected_fields = [
        "customerId", "name", "segment", "country",
        "recencyDays", "frequency", "monetary", "avgOrderValue",
        "rfmScore", "churnProb", "riskLevel", "action", "lastActive"
    ]
    for field in expected_fields:
        assert field in first_cust, f"Missing field: {field}"
        
    assert first_cust["riskLevel"] in ["High", "Medium", "Low"]
    assert 0.0 <= first_cust["churnProb"] <= 100.0

if __name__ == "__main__":
    pytest.main(["-v", __file__])
