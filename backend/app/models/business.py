from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(Integer, primary_key=True, index=True)  # Maps to UCI Customer ID
    country = Column(String(100), nullable=False, default="United Kingdom")
    first_purchase = Column(DateTime, nullable=True)
    last_purchase = Column(DateTime, nullable=True)
    lifetime_value = Column(Float, default=0.0)
    segment = Column(String(50), default="New Customers")
    rfm_score = Column(String(20), default="1-1-1")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    invoices = relationship("Invoice", back_populates="customer")
    recommendations = relationship("Recommendation", back_populates="customer")

class Product(Base):
    __tablename__ = "products"

    stock_code = Column(String(50), primary_key=True, index=True)  # Maps to UCI StockCode
    description = Column(String(255), nullable=True)
    derived_category = Column(String(100), default="Other")
    current_price = Column(Float, default=0.0)
    units_sold = Column(Integer, default=0)
    units_returned = Column(Integer, default=0)
    revenue = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    invoice_items = relationship("InvoiceItem", back_populates="product")
    recommendations = relationship("Recommendation", back_populates="product")

class Invoice(Base):
    __tablename__ = "invoices"

    invoice_no = Column(String(50), primary_key=True, index=True)  # Maps to UCI Invoice
    customer_id = Column(Integer, ForeignKey("customers.customer_id"), nullable=True)
    invoice_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    total_amount = Column(Float, nullable=False, default=0.0)
    item_count = Column(Integer, default=1)
    country = Column(String(100), default="United Kingdom")
    is_return = Column(Boolean, default=False)
    status = Column(String(50), default="completed")
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")

class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    item_id = Column(Integer, primary_key=True, autoincrement=True)
    invoice_no = Column(String(50), ForeignKey("invoices.invoice_no"), nullable=False)
    stock_code = Column(String(50), ForeignKey("products.stock_code"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    line_total = Column(Float, nullable=False)

    invoice = relationship("Invoice", back_populates="items")
    product = relationship("Product", back_populates="invoice_items")
