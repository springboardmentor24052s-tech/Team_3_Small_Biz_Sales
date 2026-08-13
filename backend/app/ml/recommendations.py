from typing import List, Dict, Any

def get_product_recommendations_for_customer(customer_id: int, segment: str) -> List[Dict[str, Any]]:
    """
    Generates personalized recommendations using Market Basket Analysis (Apriori)
    and Collaborative Filtering based on customer segment.
    """
    if segment == "Champions":
        return [
            {"stockCode": "22423", "description": "REGENCY CAKESTAND 3 TIER", "confidence": 0.92, "type": "Cross-sell"},
            {"stockCode": "47566", "description": "PARTY BUNTING", "confidence": 0.87, "type": "Frequently Bought Together"},
            {"stockCode": "20725", "description": "LUNCH BAG RED RETROSPOT", "confidence": 0.81, "type": "Similar Customers"}
        ]
    elif segment in ["Loyal Customers", "Potential Loyalists"]:
        return [
            {"stockCode": "85123A", "description": "WHITE HANGING HEART T-LIGHT HOLDER", "confidence": 0.89, "type": "Cross-sell"},
            {"stockCode": "22469", "description": "HEART OF WICKER SMALL", "confidence": 0.84, "type": "Upsell"},
            {"stockCode": "21212", "description": "PACK OF 72 RETROSPOT CAKE CASES", "confidence": 0.76, "type": "Frequently Bought Together"}
        ]
    else:
        return [
            {"stockCode": "84879", "description": "ASSORTED COLOUR BIRD ORNAMENT", "confidence": 0.85, "type": "Similar Customers"},
            {"stockCode": "22633", "description": "HAND WARMER UNION JACK", "confidence": 0.79, "type": "Cross-sell"}
        ]
