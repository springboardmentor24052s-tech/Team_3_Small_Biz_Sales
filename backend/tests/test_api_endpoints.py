"""
API Endpoints Integration Tests — MarketMind AI
Tests FastAPI endpoints for Revenue Forecasting, Churn Risk Predictions, and Model Retraining.
"""

import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

def test_api_root_status():
    """Verifies that API root responds with healthy status."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "online"

def test_get_revenue_forecast_endpoint():
    """Verifies GET /api/v1/ai/forecast/revenue endpoint response."""
    response = client.get("/api/v1/ai/forecast/revenue")
    assert response.status_code == 200
    data = response.json()
    assert "forecasts" in data
    assert "model_metrics" in data
    assert isinstance(data["forecasts"], list)
    assert len(data["forecasts"]) > 0

def test_get_churn_predictions_batch_endpoint():
    """Verifies GET /api/v1/ai/churn/predict batch prediction endpoint."""
    response = client.get("/api/v1/ai/churn/predict")
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "model_metrics" in data
    assert "customers" in data
    assert data["summary"]["total_customers"] == 793
    assert len(data["customers"]) == 793

def test_get_churn_scores_endpoint():
    """Verifies GET /api/v1/ai/churn/scores endpoint."""
    response = client.get("/api/v1/ai/churn/scores")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_post_retrain_endpoint():
    """Verifies POST /api/v1/ai/retrain endpoint."""
    response = client.post("/api/v1/ai/retrain")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "models_updated" in data
    assert any("XGBoost" in m for m in data["models_updated"])
    assert any("Prophet" in m for m in data["models_updated"])

if __name__ == "__main__":
    pytest.main(["-v", __file__])
