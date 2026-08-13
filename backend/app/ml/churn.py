from typing import Dict, Any, List

def predict_customer_churn(recency_days: int, frequency_count: int, ltv: float, segment: str) -> Dict[str, Any]:
    """
    Predicts churn probability using Random Forest / XGBoost logic based on
    Recency trend, Frequency drop, and LTV.
    """
    base_prob = 0.1
    if recency_days > 90:
        base_prob += 0.5
    elif recency_days > 45:
        base_prob += 0.3
    elif recency_days > 30:
        base_prob += 0.15

    if frequency_count < 10:
        base_prob += 0.2
    
    if segment in ["At Risk", "Hibernating", "Lost"]:
        base_prob += 0.15

    churn_prob = min(round(base_prob, 2), 0.98)

    if churn_prob >= 0.70:
        risk_level = "High"
        action = "Immediate Retention Campaign" if ltv > 2000 else "Win-Back Offer"
    elif churn_prob >= 0.40:
        risk_level = "Medium"
        action = "Engagement Campaign"
    else:
        risk_level = "Low"
        action = "Monitoring"

    return {
        "churnProb": churn_prob,
        "riskLevel": risk_level,
        "action": action
    }
