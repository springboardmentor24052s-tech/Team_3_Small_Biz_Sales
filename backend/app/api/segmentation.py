from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.segmentation_service import SegmentationService
from app.schemas.segmentation import (
    SegmentationSummaryResponse,
    SegmentSummaryItem,
    CustomerListResponse,
    ClusterQualityMetricsResponse,
    TrainSegmentationResponse,
    CustomerPredictRequest,
    CustomerPredictResponse,
    CustomerDetailResponse,
)

router = APIRouter(prefix="/segmentation", tags=["Customer Segmentation & AI Clustering"])

@router.post("/train", response_model=TrainSegmentationResponse)
def train_segmentation_model(
    min_k: int = Query(2, ge=2, le=8, description="Minimum number of clusters to test"),
    max_k: int = Query(8, ge=2, le=8, description="Maximum number of clusters to test"),
    db: Session = Depends(get_db)
):
    """
    Triggers unsupervised K-Means clustering pipeline on all customer transactions.
    Evaluates Silhouette Score & Inertia for K=min_k..max_k, selects optimal K,
    generates business segment names, persists model with joblib, and updates DB.
    """
    try:
        result = SegmentationService.train_and_persist(db, min_k=min_k, max_k=max_k)
        return TrainSegmentationResponse(
            status="success",
            message=f"Segmentation model successfully trained with optimal K={result['selected_k']} (Silhouette: {result['silhouette_score']})",
            selected_k=result["selected_k"],
            silhouette_score=result["silhouette_score"],
            inertia=result["inertia"],
            total_customers=result["total_customers"],
            total_segments=result["total_segments"],
            total_revenue=result["total_revenue"],
            highest_value_segment=result["highest_value_segment"],
            feature_names=result["feature_names"],
            elbow_curve=result["elbow_curve"],
            segments=result["segments"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Segmentation training failed: {str(e)}"
        )

@router.get("/summary", response_model=SegmentationSummaryResponse)
def get_segmentation_summary(db: Session = Depends(get_db)):
    """
    Returns platform-wide customer clustering summary KPIs.
    """
    try:
        return SegmentationService.get_summary(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch segmentation summary: {str(e)}"
        )

@router.get("/clusters", response_model=List[SegmentSummaryItem])
def get_segment_clusters(db: Session = Depends(get_db)):
    """
    Returns breakdown of all behavioral segments with statistics, descriptions, and colors.
    """
    try:
        return SegmentationService.get_clusters(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch segment clusters: {str(e)}"
        )

@router.get("/customers", response_model=CustomerListResponse)
def get_segmented_customers(
    segment: Optional[str] = Query(None, description="Filter by segment name or cluster ID"),
    search: Optional[str] = Query(None, description="Search customer ID or country"),
    sort_by: Optional[str] = Query("total_spend", description="Column to sort by"),
    sort_order: Optional[str] = Query("desc", description="asc or desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    Returns search/filterable and sorted list of customer segmentation records.
    """
    try:
        return SegmentationService.get_customers(
            db=db,
            segment=segment,
            search=search,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch segmented customers: {str(e)}"
        )

@router.get("/metrics", response_model=ClusterQualityMetricsResponse)
def get_cluster_quality_metrics(db: Session = Depends(get_db)):
    """
    Returns cluster quality metrics, selected optimal K, silhouette score, and elbow curve (K=2..8).
    """
    try:
        return SegmentationService.get_metrics(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch cluster metrics: {str(e)}"
        )

@router.get("/customers/{customer_id}", response_model=CustomerDetailResponse)
def get_customer_segment_detail(customer_id: int, db: Session = Depends(get_db)):
    """
    Returns detailed segmentation breakdown for a single customer.
    """
    profile = SegmentationService.get_customer_profile(db, customer_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer #{customer_id} not found."
        )
    return profile

@router.post("/predict", response_model=CustomerPredictResponse)
def predict_customer_segment(payload: CustomerPredictRequest):
    """
    Predicts customer segment based on input behavioral features using the trained model and scaler.
    """
    try:
        features = payload.model_dump()
        return SegmentationService.predict_segment(features)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Prediction failed: {str(e)}"
        )
