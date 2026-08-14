from typing import List, Optional
from pydantic import BaseModel

class SalesForecastItem(BaseModel):
    month: str
    actual: Optional[float] = None
    forecast: Optional[float] = None
    lower: Optional[float] = None
    upper: Optional[float] = None

class ModelMetricItem(BaseModel):
    model: str
    mae: float
    rmse: float
    r2: float
    status: str

class ChurnRiskItem(BaseModel):
    customerId: int
    segment: str
    churnProb: float
    ltv: float
    lastActive: str
    country: str
    riskLevel: str
    action: str

class RecommendedProductItem(BaseModel):
    stockCode: str
    description: str
    confidence: float
    type: str

class CustomerRecommendationItem(BaseModel):
    customerId: int
    customerSegment: str
    recommendations: List[RecommendedProductItem]

class AnomalyAlertItem(BaseModel):
    id: int
    type: str
    referenceType: str
    referenceId: str
    description: str
    severity: float
    isResolved: bool
    detectedAt: str
