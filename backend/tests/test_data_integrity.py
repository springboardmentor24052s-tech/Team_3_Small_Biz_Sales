"""
Data Integrity Tests — MarketMind AI
Verifies that data.csv exists, has valid structure, schema, non-empty records,
and valid types for time-series forecasting and customer churn prediction.
"""

import os
import sys
import pytest
import pandas as pd

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

def find_data_csv():
    candidates = [
        os.path.join(os.path.dirname(__file__), "..", "..", "data.csv"),
        os.path.join(os.path.dirname(__file__), "..", "data.csv"),
        "data.csv"
    ]
    for c in candidates:
        if os.path.exists(c):
            return os.path.abspath(c)
    return None

def test_data_csv_exists():
    """Verifies that data.csv is present in the workspace."""
    path = find_data_csv()
    assert path is not None, "data.csv could not be found in workspace"
    assert os.path.exists(path)

def test_data_csv_schema_and_columns():
    """Verifies the column names and shape of data.csv."""
    path = find_data_csv()
    df = pd.read_csv(path)
    assert len(df) > 5000, f"Expected >5000 rows, got {len(df)}"
    
    required_columns = ["Order Date", "Sales", "Customer ID", "Segment", "Country"]
    for col in required_columns:
        assert col in df.columns, f"Required column '{col}' missing from data.csv"

def test_data_csv_dates_and_sales():
    """Verifies that Order Dates and Sales can be converted cleanly."""
    path = find_data_csv()
    df = pd.read_csv(path)
    
    dates = pd.to_datetime(df["Order Date"], dayfirst=True, errors="coerce")
    assert dates.notna().sum() > 0.95 * len(df), "Too many unparseable dates"
    
    # Ensure sales can be converted to float
    sales = pd.to_numeric(df["Sales"].astype(str).str.replace(r"[^\d.]", "", regex=True), errors="coerce")
    assert sales.notna().sum() > 0.95 * len(df), "Too many unparseable sales numbers"
    assert (sales > 0).sum() > 0, "No positive sales found"

if __name__ == "__main__":
    pytest.main(["-v", __file__])
