from typing import List
from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/reports", tags=["Reports & Export"])

@router.get("/")
def get_reports_summary():
    return {
        "categories": [
            {"id": "sales", "name": "Sales Report", "description": "Revenue analysis, order trends, country breakdown, and top products"},
            {"id": "inventory", "name": "Product Report", "description": "Product performance, return rates, stock movement analysis"},
            {"id": "customer", "name": "Customer Report", "description": "RFM segmentation, customer lifetime value, geographic distribution"},
            {"id": "forecast", "name": "Forecast Report", "description": "Revenue predictions, demand forecasts, model accuracy metrics"},
            {"id": "anomaly", "name": "Anomaly Report", "description": "Detected anomalies, suspicious transactions, outlier analysis"},
            {"id": "performance", "name": "Performance Report", "description": "Business KPIs, targets vs actuals, growth metrics"}
        ],
        "recent_reports": [
            {"id": 1, "name": "Monthly Sales Summary - December 2011", "type": "Sales Report", "generatedAt": "2011-12-01 09:30", "format": "PDF", "size": "2.4 MB"},
            {"id": 2, "name": "Product Return Analysis Q4 2011", "type": "Product Report", "generatedAt": "2011-11-28 14:15", "format": "CSV", "size": "856 KB"},
            {"id": 3, "name": "Customer Segmentation Report", "type": "Customer Report", "generatedAt": "2011-11-25 11:00", "format": "PDF", "size": "3.1 MB"}
        ]
    }

@router.get("/download/{report_type}")
def download_report(report_type: str):
    return JSONResponse(
        content={
            "status": "success",
            "message": f"Report '{report_type}' download link generated",
            "download_url": f"/exports/{report_type}_report.pdf"
        }
    )
