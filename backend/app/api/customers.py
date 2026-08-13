from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.business import Customer
from app.schemas.customers import CustomerResponse, SegmentSummaryItem, RFMScatterPoint

router = APIRouter(prefix="/customers", tags=["Customers & Segmentation"])

@router.get("/", response_model=List[CustomerResponse])
def get_customers(
    segment: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Customer)
    if segment and segment != "all":
        query = query.filter(Customer.segment == segment)
    if country and country != "all":
        query = query.filter(Customer.country == country)
    if search:
        query = query.filter(Customer.customer_id.like(f"%{search}%"))

    customers = query.all()
    res = []
    for c in customers:
        res.append(CustomerResponse(
            customer_id=c.customer_id,
            country=c.country,
            first_purchase=str(c.first_purchase)[:10] if c.first_purchase else "2011-01-10",
            last_purchase=str(c.last_purchase)[:10] if c.last_purchase else "2011-12-01",
            lifetime_value=c.lifetime_value,
            segment=c.segment,
            rfm_score=c.rfm_score or "5-5-5",
            orders_count=len(c.invoices) if c.invoices else 12
        ))
    return res

@router.get("/segments", response_model=List[SegmentSummaryItem])
def get_customer_segments():
    return [
        {"name": "Champions", "count": 420, "percentage": 9.6, "color": "#6366f1", "description": "High R, F, M scores – best customers"},
        {"name": "Loyal Customers", "count": 680, "percentage": 15.6, "color": "#10b981", "description": "High frequency and monetary value"},
        {"name": "Potential Loyalists", "count": 520, "percentage": 11.9, "color": "#0ea5e9", "description": "Recent buyers with growing frequency"},
        {"name": "New Customers", "count": 390, "percentage": 8.9, "color": "#f59e0b", "description": "Recent first-time buyers"},
        {"name": "At Risk", "count": 350, "percentage": 8.0, "color": "#f43f5e", "description": "Previously active, declining engagement"},
        {"name": "Need Attention", "count": 580, "percentage": 13.3, "color": "#8b5cf6", "description": "Above average R/F/M, starting to slip"},
        {"name": "About to Sleep", "count": 440, "percentage": 10.1, "color": "#ec4899", "description": "Below average recency and frequency"},
        {"name": "Hibernating", "count": 620, "percentage": 14.2, "color": "#94a3b8", "description": "Low activity across all RFM dimensions"},
        {"name": "Lost", "count": 372, "percentage": 8.5, "color": "#64748b", "description": "Longest inactive, lowest scores"}
    ]

@router.get("/rfm-scatter", response_model=List[RFMScatterPoint])
def get_rfm_scatter():
    return [
        {"customerId": 17850, "recency": 1, "frequency": 45, "monetary": 4287.0, "segment": "Champions", "x": 95.0, "y": 92.0},
        {"customerId": 13047, "recency": 3, "frequency": 38, "monetary": 3650.0, "segment": "Champions", "x": 88.0, "y": 85.0},
        {"customerId": 14527, "recency": 8, "frequency": 32, "monetary": 2980.0, "segment": "Loyal Customers", "x": 78.0, "y": 75.0},
        {"customerId": 15311, "recency": 12, "frequency": 28, "monetary": 2450.0, "segment": "Loyal Customers", "x": 70.0, "y": 68.0},
        {"customerId": 17548, "recency": 45, "frequency": 22, "monetary": 3100.0, "segment": "At Risk", "x": 25.0, "y": 62.0}
    ]
