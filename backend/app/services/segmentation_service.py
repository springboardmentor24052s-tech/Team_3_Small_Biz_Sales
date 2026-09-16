import os
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.business import Customer, Invoice
from app.ml.segmentation import (
    run_full_clustering_pipeline,
    load_cached_segmentation_artifact,
    DEFAULT_MODEL_PATH
)
import numpy as np

class SegmentationService:
    @staticmethod
    def _fetch_db_records(db: Session) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """Fetches raw invoices and customer objects from database."""
        invoices = [
            {
                "invoice_no": inv.invoice_no,
                "customer_id": inv.customer_id,
                "invoice_date": inv.invoice_date,
                "total_amount": inv.total_amount,
                "item_count": inv.item_count,
                "country": inv.country,
                "is_return": inv.is_return,
                "status": inv.status,
            }
            for inv in db.query(Invoice).all()
        ]

        customers = [
            {
                "customer_id": c.customer_id,
                "country": c.country,
                "first_purchase": c.first_purchase,
                "last_purchase": c.last_purchase,
                "lifetime_value": c.lifetime_value,
                "segment": c.segment,
                "rfm_score": c.rfm_score,
            }
            for c in db.query(Customer).all()
        ]
        return invoices, customers

    @classmethod
    def train_and_persist(cls, db: Session, min_k: int = 2, max_k: int = 8) -> Dict[str, Any]:
        """
        Executes full unsupervised K-Means clustering pipeline across K=2..8,
        selects optimal K by highest Silhouette Score, assigns dynamic business segments,
        persists model with joblib, and updates Customer records in database.
        """
        invoices, customers = cls._fetch_db_records(db)
        if not invoices and not customers:
            raise ValueError("No customer or transaction data found in database.")

        result = run_full_clustering_pipeline(
            invoices_data=invoices,
            customers_data=customers,
            min_k=min_k,
            max_k=max_k,
            save_path=DEFAULT_MODEL_PATH
        )

        # Update database customer segment and RFM assignments
        customer_lookup = {c["customer_id"]: c for c in result["customers"]}
        db_customers = db.query(Customer).all()
        for db_c in db_customers:
            if db_c.customer_id in customer_lookup:
                res_c = customer_lookup[db_c.customer_id]
                db_c.segment = res_c["segment_name"]
                db_c.lifetime_value = res_c["total_spend"]
                # Calculate RFM string
                r_val = 5 if res_c["recency"] <= 15 else (4 if res_c["recency"] <= 45 else (3 if res_c["recency"] <= 90 else (2 if res_c["recency"] <= 150 else 1)))
                f_val = 5 if res_c["total_orders"] >= 12 else (4 if res_c["total_orders"] >= 8 else (3 if res_c["total_orders"] >= 4 else (2 if res_c["total_orders"] >= 2 else 1)))
                m_val = 5 if res_c["total_spend"] >= 4000 else (4 if res_c["total_spend"] >= 2000 else (3 if res_c["total_spend"] >= 1000 else (2 if res_c["total_spend"] >= 400 else 1)))
                db_c.rfm_score = f"{r_val}-{f_val}-{m_val}"

        db.commit()
        return result

    @classmethod
    def get_or_create_pipeline_result(cls, db: Session) -> Dict[str, Any]:
        """
        Retrieves cached clustering result or trains if not yet existing on disk.
        """
        artifact = load_cached_segmentation_artifact(DEFAULT_MODEL_PATH)
        if not artifact:
            # Train and persist initial model
            return cls.train_and_persist(db)
        
        # Build live customer records with current data
        invoices, customers = cls._fetch_db_records(db)
        from app.ml.segmentation import engineer_customer_features, clean_and_winsorize_features
        df_features = engineer_customer_features(invoices, customers)
        feature_cols = artifact["feature_cols"]
        df_clean = clean_and_winsorize_features(df_features, feature_cols)
        X = df_clean[feature_cols].values
        X_scaled = artifact["scaler"].transform(X)
        labels = artifact["model"].predict(X_scaled)
        df_clean["cluster_id"] = labels

        cluster_to_name = {c["cluster_id"]: c["segment_name"] for c in artifact["segments"]}
        cluster_to_color = {c["cluster_id"]: c["color"] for c in artifact["segments"]}
        df_clean["segment_name"] = df_clean["cluster_id"].map(cluster_to_name)
        df_clean["color"] = df_clean["cluster_id"].map(cluster_to_color)

        customers_result = []
        for _, row in df_clean.iterrows():
            customers_result.append({
                "customer_id": int(row["customer_id"]),
                "country": str(row["country"]),
                "segment_id": int(row["cluster_id"]),
                "segment_name": str(row["segment_name"]),
                "color": str(row["color"]),
                "total_spend": round(float(row["total_spend"]), 2),
                "total_orders": int(row["total_orders"]),
                "purchase_frequency": round(float(row["purchase_frequency"]), 2),
                "average_order_value": round(float(row["average_order_value"]), 2),
                "recency": int(row["recency"]),
                "activity": round(float(row["customer_activity"]), 1),
                "first_purchase": str(row["first_purchase"]),
                "last_purchase": str(row["last_purchase"]),
            })

        return {
            "status": "success",
            "selected_k": artifact["optimal_k"],
            "silhouette_score": artifact["silhouette_score"],
            "inertia": artifact["inertia"],
            "total_customers": len(df_clean),
            "total_segments": artifact["optimal_k"],
            "total_revenue": round(float(df_clean["total_spend"].sum()), 2),
            "highest_value_segment": artifact["highest_value_segment"],
            "feature_names": feature_cols,
            "elbow_curve": artifact["elbow_curve"],
            "segments": artifact["segments"],
            "customers": customers_result,
            "overall_means": artifact.get("overall_means", {}),
        }

    @classmethod
    def get_summary(cls, db: Session) -> Dict[str, Any]:
        """Returns high-level summary KPIs for segmentation dashboard."""
        res = cls.get_or_create_pipeline_result(db)
        total_cust = res["total_customers"]
        total_rev = res["total_revenue"]
        avg_spend = round(total_rev / total_cust, 2) if total_cust > 0 else 0.0

        all_aov = [c["average_order_value"] for c in res["customers"]]
        avg_aov = round(sum(all_aov) / len(all_aov), 2) if all_aov else 0.0

        return {
            "total_customers": total_cust,
            "total_segments": res["total_segments"],
            "selected_k": res["selected_k"],
            "silhouette_score": res["silhouette_score"],
            "inertia": res["inertia"],
            "highest_value_segment": res["highest_value_segment"],
            "total_revenue": total_rev,
            "average_spend": avg_spend,
            "average_order_value": avg_aov,
            "status": "active"
        }

    @classmethod
    def get_clusters(cls, db: Session) -> List[Dict[str, Any]]:
        """Returns summary list of all segment clusters."""
        res = cls.get_or_create_pipeline_result(db)
        return res["segments"]

    @classmethod
    def get_customers(
        cls,
        db: Session,
        segment: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_order: Optional[str] = "desc",
        page: int = 1,
        page_size: int = 50
    ) -> Dict[str, Any]:
        """Returns filtered, sorted, paginated customer list."""
        res = cls.get_or_create_pipeline_result(db)
        customers = res["customers"]

        if segment and segment != "all":
            customers = [c for c in customers if c["segment_name"].lower() == segment.lower() or str(c["segment_id"]) == segment]

        if search:
            s = search.lower()
            customers = [
                c for c in customers
                if s in str(c["customer_id"]) or s in c["country"].lower() or s in c["segment_name"].lower()
            ]

        # Sorting
        if sort_by and sort_by in ["total_spend", "total_orders", "purchase_frequency", "recency", "activity", "average_order_value"]:
            reverse = (sort_order != "asc")
            customers.sort(key=lambda x: x.get(sort_by, 0), reverse=reverse)

        total = len(customers)
        total_pages = max(1, (total + page_size - 1) // page_size)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paged_customers = customers[start_idx:end_idx]

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "customers": paged_customers
        }

    @classmethod
    def get_metrics(cls, db: Session) -> Dict[str, Any]:
        """Returns cluster quality and elbow curve metrics."""
        res = cls.get_or_create_pipeline_result(db)
        return {
            "selected_k": res["selected_k"],
            "silhouette_score": res["silhouette_score"],
            "inertia": res["inertia"],
            "feature_names": res["feature_names"],
            "elbow_curve": res["elbow_curve"],
            "overall_means": res.get("overall_means", {}),
            "status": "ready"
        }

    @classmethod
    def get_customer_profile(cls, db: Session, customer_id: int) -> Optional[Dict[str, Any]]:
        """Returns detailed customer clustering profile and comparison with segment average."""
        res = cls.get_or_create_pipeline_result(db)
        match = next((c for c in res["customers"] if c["customer_id"] == customer_id), None)
        if not match:
            return None

        seg_info = next((s for s in res["segments"] if s["segment_id"] == match["segment_id"]), None)
        seg_averages = {
            "average_spend": seg_info["average_spend"] if seg_info else 0.0,
            "average_order_value": seg_info["average_order_value"] if seg_info else 0.0,
            "average_frequency": seg_info["average_frequency"] if seg_info else 0.0,
            "average_recency": seg_info["average_recency"] if seg_info else 0.0,
            "average_activity": seg_info["average_activity"] if seg_info else 0.0,
        }

        return {
            "customer_id": match["customer_id"],
            "country": match["country"],
            "segment_id": match["segment_id"],
            "segment_name": match["segment_name"],
            "color": match["color"],
            "badge": seg_info["badge"] if seg_info else "neutral",
            "description": seg_info["description"] if seg_info else "",
            "strategy": seg_info["strategy"] if seg_info else "",
            "total_spend": match["total_spend"],
            "total_orders": match["total_orders"],
            "purchase_frequency": match["purchase_frequency"],
            "average_order_value": match["average_order_value"],
            "recency": match["recency"],
            "activity": match["activity"],
            "first_purchase": match["first_purchase"],
            "last_purchase": match["last_purchase"],
            "segment_averages": seg_averages,
        }

    @classmethod
    def predict_segment(cls, features: Dict[str, float]) -> Dict[str, Any]:
        """Predicts segment for arbitrary customer features."""
        artifact = load_cached_segmentation_artifact(DEFAULT_MODEL_PATH)
        if not artifact:
            raise ValueError("Model artifact not found. Please train model first.")

        feature_cols = artifact["feature_cols"]
        row = [features.get(col, 0.0) for col in feature_cols]
        X = np.array([row])
        X_scaled = artifact["scaler"].transform(X)
        cluster_id = int(artifact["model"].predict(X_scaled)[0])

        seg = next((s for s in artifact["segments"] if s["cluster_id"] == cluster_id), None)
        seg_name = seg["segment_name"] if seg else f"Segment {cluster_id}"
        color = seg["color"] if seg else "#6366f1"
        desc = seg["description"] if seg else ""
        strat = seg["strategy"] if seg else ""

        return {
            "segment_id": cluster_id,
            "segment_name": seg_name,
            "color": color,
            "description": desc,
            "strategy": strat,
            "input_features": features,
        }
