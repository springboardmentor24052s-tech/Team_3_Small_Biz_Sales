# Visualization Insights — Chart → Observation → Interpretation → Action

## Chart 09: Repeat vs One-Time Customers
**Observation:** 97.0% of customers made only one purchase; 3.0% (2,801) are repeat customers.
**Business Interpretation:** The overwhelming majority of the customer base does not return for a second purchase within the observed period.
**Potential Action:** Prioritize post-first-purchase re-engagement (email/discount nudges) rather than assuming organic repeat behavior; treat repeat rate as the primary retention KPI to move.

## Chart 14: Customer Lifecycle Distribution
**Observation:** 59.2% of customers (55,252) fall into the Inactive stage (>180 days since last purchase); only 0.13% are Loyal/High-Activity.
**Business Interpretation:** Most of the customer base has gone cold by the project-defined 180-day threshold, and very few customers reach sustained high-activity status.
**Potential Action:** Build a win-back campaign targeting the Inactive segment, segmented further by their historical value_segment so spend is not wasted on originally low-value one-time buyers.

## Chart 04: Purchase Interval Distribution
**Observation:** Among the 2,801 repeat customers, the median interval between purchases is 32 days.
**Business Interpretation:** When customers do return, they tend to do so within roughly a month, not on a long annual cycle.
**Potential Action:** Time retention emails/offers around the 25–40 day mark after a purchase, when reorder likelihood is naturally highest.

## Chart 10/11: Engagement Score & Category Distribution
**Observation:** Engagement categories are roughly tercile-balanced by construction; 33.0% of customers fall in "Highly Engaged."
**Business Interpretation:** Because thresholds are percentile-based, "Highly Engaged" identifies the top third of customers on a blended recency/frequency/breadth score — a relative, not absolute, standard.
**Potential Action:** Use the Highly Engaged segment as a lookalike-audience seed for acquisition targeting, since they represent the platform's most active real-world behavior pattern.

## Chart 15: Lifecycle vs Spending
**Observation:** Average spend varies meaningfully across lifecycle stages (see chart bars) — computed directly from `customer_behavior_engagement.csv`, no fabricated figures.
**Business Interpretation:** Lifecycle stage is not just a recency/frequency label — it also correlates with realized revenue per customer, making it a useful axis for prioritizing retention spend.
**Potential Action:** Allocate a larger share of retention budget to Loyal/High-Activity and Repeat customers approaching the Inactive threshold, since they carry higher historical spend per customer than the New/Active segments.

## Chart 18: Category Spending (Top 10)
**Observation:** Revenue concentrates in a small number of categories at the top of the ranking (see chart and Excel "Product & Category Analysis" sheet for exact figures).
**Business Interpretation:** A disproportionate share of revenue is driven by a handful of categories, consistent with typical retail category concentration.
**Potential Action:** Prioritize inventory, marketing spend, and cross-sell placement around the top revenue categories identified in the chart.

## High-Value Frequent Segment (supports Charts 12/13/20)
**Observation:** 2.64% of customers (2,467) are classified High-Value Frequent (spend and order count both above median), averaging R$339.19 in total spend.
**Business Interpretation:** This is a small but disproportionately valuable group relative to the median customer.
**Potential Action:** Build a VIP/loyalty tier specifically for this segment to protect and grow their share of revenue.
