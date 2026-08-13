from typing import Optional
from pydantic import BaseModel

class CustomerResponse(BaseModel):
    customer_id: int
    country: str
    first_purchase: Optional[str]
    last_purchase: Optional[str]
    lifetime_value: float
    segment: str
    rfm_score: str
    orders_count: int

    class Config:
        from_attributes = True

class SegmentSummaryItem(BaseModel):
    name: str
    count: int
    percentage: float
    color: str
    description: str

class RFMScatterPoint(BaseModel):
    customerId: int
    recency: int
    frequency: int
    monetary: float
    segment: str
    x: float
    y: float
