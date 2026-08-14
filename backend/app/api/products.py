from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.business import Product
from app.schemas.products import ProductResponse, ReturnAlertResponse

router = APIRouter(prefix="/products", tags=["Products & Inventory"])

@router.get("/", response_model=List[ProductResponse])
def get_products(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if category and category != "all":
        query = query.filter(Product.derived_category == category)
    if search:
        query = query.filter(
            Product.stock_code.like(f"%{search}%") |
            Product.description.like(f"%{search}%")
        )

    products = query.all()
    res = []
    for p in products:
        ret_rate = (p.units_returned / p.units_sold * 100.0) if p.units_sold > 0 else 0.0
        res.append(ProductResponse(
            stock_code=p.stock_code,
            description=p.description,
            category=p.derived_category,
            current_price=p.current_price,
            units_sold=p.units_sold,
            units_returned=p.units_returned,
            return_rate=round(ret_rate, 1),
            revenue=p.revenue
        ))
    return res

@router.get("/alerts", response_model=List[ReturnAlertResponse])
def get_return_alerts(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    alerts = []
    for p in products:
        if p.units_sold > 0:
            rate = (p.units_returned / p.units_sold) * 100.0
            if rate >= 6.0:
                alerts.append(ReturnAlertResponse(
                    stock_code=p.stock_code,
                    description=p.description or "Product",
                    return_rate=round(rate, 1),
                    avg_return_rate=3.0,
                    severity="critical" if rate >= 12.0 else "warning",
                    units_sold=p.units_sold,
                    units_returned=p.units_returned
                ))
    return alerts
