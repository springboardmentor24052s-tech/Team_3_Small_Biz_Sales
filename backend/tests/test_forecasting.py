"""
Forecasting Engine Unit & Integration Tests — MarketMind AI
Verifies data ingestion, pluralization parsing, chronological split,
model training (XGBoost / RandomForest / Prophet ensemble), and forecast outputs.
"""

import os
import sys
import pytest
import pandas as pd
import numpy as np

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.ml.forecasting import (
    clean_pluralized_string,
    load_and_preprocess_sales_data,
    generate_sales_forecast
)

def test_clean_pluralized_string_units():
    """Verifies that strings with various pluralized units are parsed without crashing."""
    assert clean_pluralized_string("1 item") == 1.0
    assert clean_pluralized_string("12 items") == 12.0
    assert clean_pluralized_string("1 day") == 1.0
    assert clean_pluralized_string("5 days") == 5.0
    assert clean_pluralized_string("3.5 units") == 3.5
    assert clean_pluralized_string("100 pieces") == 100.0

def test_clean_pluralized_string_edge_cases():
    """Verifies handling of numeric values, nulls, negative numbers, and invalid strings."""
    assert clean_pluralized_string(42) == 42.0
    assert clean_pluralized_string(3.14159) == 3.14159
    assert clean_pluralized_string(None, default_val=0.0) == 0.0
    assert clean_pluralized_string("", default_val=0.0) == 0.0
    assert clean_pluralized_string("invalid string text", default_val=1.0) == 1.0
    assert clean_pluralized_string("-5 units", default_val=0.0) == -5.0

def test_load_and_preprocess_sales_data():
    """Verifies data.csv ingestion, weekly aggregation, and columns."""
    df_weekly = load_and_preprocess_sales_data()
    assert df_weekly is not None
    assert isinstance(df_weekly, pd.DataFrame)
    assert len(df_weekly) > 0
    assert "ds" in df_weekly.columns
    assert "y" in df_weekly.columns
    # Ensure weekly intervals are sorted chronologically
    assert df_weekly["ds"].is_monotonic_increasing
    # Ensure revenue values are positive
    assert (df_weekly["y"] >= 0).all()

def test_generate_sales_forecast_structure():
    """Verifies that forecasting outputs forecasts and model metrics."""
    result = generate_sales_forecast()
    
    assert "forecasts" in result
    assert "model_metrics" in result
    assert isinstance(result["forecasts"], list)
    assert isinstance(result["model_metrics"], list)
    assert len(result["forecasts"]) > 0
    assert len(result["model_metrics"]) >= 2

def test_forecast_confidence_intervals():
    """Verifies that predicted values respect lower and upper confidence bounds."""
    result = generate_sales_forecast()
    for forecast in result["forecasts"]:
        assert "month" in forecast
        assert "forecast" in forecast
        assert "lower" in forecast
        assert "upper" in forecast
        assert forecast["forecast"] > 0
        assert forecast["lower"] <= forecast["forecast"]
        assert forecast["forecast"] <= forecast["upper"]

def test_model_metrics_validity():
    """Verifies MAE, RMSE, and R² scores for evaluated forecasting models."""
    result = generate_sales_forecast()
    for metric in result["model_metrics"]:
        assert "model" in metric
        assert "mae" in metric
        assert "rmse" in metric
        assert "r2" in metric
        assert "status" in metric
        assert metric["mae"] >= 0
        assert metric["rmse"] >= 0
        assert -1.0 <= metric["r2"] <= 1.0
        assert metric["status"] in ["Selected", "Available", "Evaluated"]

if __name__ == "__main__":
    pytest.main(["-v", __file__])
