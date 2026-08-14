from typing import List, Optional
from pydantic import BaseModel

class InvoiceItemResponse(BaseModel):
    item_id: int
    invoice_no: str
    stock_code: str
    quantity: int
    unit_price: float
    line_total: float

    class Config:
        from_attributes = True

class InvoiceResponse(BaseModel):
    invoice_no: str
    customer_id: Optional[int]
    invoice_date: str
    total_amount: float
    item_count: int
    country: str
    is_return: bool
    status: str

    class Config:
        from_attributes = True

class SalesKPISummary(BaseModel):
    totalRevenue: float
    totalRevenueChange: float
    avgOrderValue: float
    avgOrderValueChange: float
    growthRate: float
    itemsPerOrder: float

class RevenueTrendItem(BaseModel):
    month: str
    revenue: float
    orders: int

class CountrySalesItem(BaseModel):
    country: str
    revenue: float
    orders: int
    percentage: float

class HourlySalesItem(BaseModel):
    hour: str
    orders: int
