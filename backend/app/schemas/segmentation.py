from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class SegmentSummaryItem(BaseModel):
    segment_id: int
    cluster_id: int
    segment_name: str
    customer_count: int
    percentage_of_customers: float
    total_revenue: float
    revenue_percentage: float
    average_spend: float
    average_order_value: float
    average_frequency: float
    average_recency: float
    average_activity: float
    average_orders: float
    color: str
    badge: str
    description: str
    strategy: str

class ElbowPoint(BaseModel):
    k: int
    inertia: float
    silhouette_score: float

class SegmentationSummaryResponse(BaseModel):
    total_customers: int
    total_segments: int
    selected_k: int
    silhouette_score: float
    inertia: float
    highest_value_segment: str
    total_revenue: float
    average_spend: float
    average_order_value: float
    status: str

class SegmentedCustomerItem(BaseModel):
    customer_id: int
    country: str
    segment_id: int
    segment_name: str
    color: str
    total_spend: float
    total_orders: int
    purchase_frequency: float
    average_order_value: float
    recency: int
    activity: float
    first_purchase: Optional[str]
    last_purchase: Optional[str]

class CustomerListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    customers: List[SegmentedCustomerItem]

class ClusterQualityMetricsResponse(BaseModel):
    selected_k: int
    silhouette_score: float
    inertia: float
    feature_names: List[str]
    elbow_curve: List[ElbowPoint]
    overall_means: Dict[str, float]
    status: str

class TrainSegmentationResponse(BaseModel):
    status: str
    message: str
    selected_k: int
    silhouette_score: float
    inertia: float
    total_customers: int
    total_segments: int
    total_revenue: float
    highest_value_segment: str
    feature_names: List[str]
    elbow_curve: List[ElbowPoint]
    segments: List[SegmentSummaryItem]

class CustomerPredictRequest(BaseModel):
    purchase_frequency: float
    total_spend: float
    recency: int
    average_order_value: float
    customer_activity: float

class CustomerPredictResponse(BaseModel):
    segment_id: int
    segment_name: str
    color: str
    description: str
    strategy: str
    input_features: Dict[str, float]

class CustomerDetailResponse(BaseModel):
    customer_id: int
    country: str
    segment_id: int
    segment_name: str
    color: str
    badge: str
    description: str
    strategy: str
    total_spend: float
    total_orders: int
    purchase_frequency: float
    average_order_value: float
    recency: int
    activity: float
    first_purchase: Optional[str]
    last_purchase: Optional[str]
    segment_averages: Dict[str, float]
