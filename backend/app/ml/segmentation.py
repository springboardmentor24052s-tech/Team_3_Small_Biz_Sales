from typing import Dict, Any, List

def calculate_rfm_score(recency_days: int, frequency_count: int, monetary_value: float) -> Dict[str, Any]:
    """
    Calculates 1-5 scores for Recency, Frequency, and Monetary dimensions
    and maps the customer into one of 9 RFM segments.
    """
    r_score = 5 if recency_days <= 7 else (4 if recency_days <= 30 else (3 if recency_days <= 60 else (2 if recency_days <= 90 else 1)))
    f_score = 5 if frequency_count >= 35 else (4 if frequency_count >= 25 else (3 if frequency_count >= 15 else (2 if frequency_count >= 8 else 1)))
    m_score = 5 if monetary_value >= 3500 else (4 if monetary_value >= 2500 else (3 if monetary_value >= 1500 else (2 if monetary_value >= 800 else 1)))

    score_str = f"{r_score}-{f_score}-{m_score}"

    if r_score >= 4 and f_score >= 4 and m_score >= 4:
        segment = "Champions"
    elif f_score >= 4 and m_score >= 3:
        segment = "Loyal Customers"
    elif r_score >= 4 and f_score <= 3:
        segment = "Potential Loyalists"
    elif r_score == 5 and f_score == 1:
        segment = "New Customers"
    elif r_score <= 2 and f_score >= 3:
        segment = "At Risk"
    elif r_score == 3 and f_score >= 2:
        segment = "Need Attention"
    elif r_score == 2 and f_score <= 2:
        segment = "About to Sleep"
    elif r_score == 1 and f_score >= 2:
        segment = "Hibernating"
    else:
        segment = "Lost"

    return {
        "rfm_score": score_str,
        "segment": segment,
        "scores": {"r": r_score, "f": f_score, "m": m_score}
    }
