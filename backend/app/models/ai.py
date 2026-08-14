from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class SalesForecast(Base):
    __tablename__ = "sales_forecasts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    target_date = Column(String(20), nullable=False)
    predicted_revenue = Column(Float, nullable=False)
    lower_bound = Column(Float, nullable=True)
    upper_bound = Column(Float, nullable=True)
    model_used = Column(String(100), default="Prophet")
    created_at = Column(DateTime, default=datetime.utcnow)

class AnomalyAlert(Base):
    __tablename__ = "anomaly_alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    reference_type = Column(String(50), nullable=False)  # INVOICE, PRODUCT, DATE
    reference_id = Column(String(50), nullable=False)    # e.g., '536414', '85123A'
    alert_type = Column(String(100), nullable=False)    # PRICE_ZERO, HIGH_RETURN, LARGE_ORDER, REVENUE_SPIKE
    description = Column(String(255), nullable=True)
    severity_score = Column(Float, default=5.0)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"), nullable=False)
    recommended_stock_code = Column(String(50), ForeignKey("products.stock_code"), nullable=False)
    confidence_score = Column(Float, nullable=False)
    recommendation_type = Column(String(50), default="Cross-sell")  # Cross-sell, Upsell, Frequently Bought Together
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="recommendations")
    product = relationship("Product", back_populates="recommendations")
