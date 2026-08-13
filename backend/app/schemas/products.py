from typing import Optional
from pydantic import BaseModel

class ProductResponse(BaseModel):
    stock_code: str
    description: Optional[str]
    category: str
    current_price: float
    units_sold: int
    units_returned: int
    return_rate: float
    revenue: float

    class Config:
        from_attributes = True

class ReturnAlertResponse(BaseModel):
    stock_code: str
    description: str
    return_rate: float
    avg_return_rate: float
    severity: str
    units_sold: int
    units_returned: int
