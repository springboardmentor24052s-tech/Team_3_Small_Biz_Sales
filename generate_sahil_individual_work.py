"""
generate_sahil_individual_work.py
Generates the complete "Individual work - Sahil.pdf" matching the exact structure,
typography, styling, and visual aesthetics of "Individual work.pdf".
Keeps Milestone 4 identical to the team's application deployment page.
"""

import os
import pypdf
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Register TrueType fonts (Calibri matching original PDF)
pdfmetrics.registerFont(TTFont('Calibri', 'C:/Windows/Fonts/calibri.ttf'))
pdfmetrics.registerFont(TTFont('Calibri-Bold', 'C:/Windows/Fonts/calibrib.ttf'))
pdfmetrics.registerFont(TTFont('Calibri-Italic', 'C:/Windows/Fonts/calibrii.ttf'))
pdfmetrics.registerFont(TTFont('Calibri-BoldItalic', 'C:/Windows/Fonts/calibriz.ttf'))

# Brand & Palette Colors from original PDF
NAVY = colors.HexColor('#1f4e79')          # Primary headers & table headers
BLUE_ACCENT = colors.HexColor('#2e74b5')   # Subtitles / secondary
LIGHT_BLUE = colors.HexColor('#dce6f1')    # Alternating table row background
BORDER_COLOR = colors.HexColor('#8ea9c1')  # Table grid borders
DARK_TEXT = colors.HexColor('#1a1a1a')     # Body text

PAGE_WIDTH, PAGE_HEIGHT = letter
MARGIN = 54  # 0.75 inch (54 points)
USABLE_WIDTH = PAGE_WIDTH - 2 * MARGIN  # 504 points

def create_sahil_pdf():
    temp_pdf_path = "temp_sahil_pages.pdf"
    final_pdf_path = "Individual work - Sahil.pdf"
    
    doc = SimpleDocTemplate(
        temp_pdf_path,
        pagesize=letter,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=40,
        bottomMargin=40
    )

    story = []

    # -------------------------------------------------------------
    # STYLES DEFINITION
    # -------------------------------------------------------------
    page_header_style = ParagraphStyle(
        'PageHeader',
        fontName='Calibri-Bold',
        fontSize=15.5,
        leading=20,
        textColor=NAVY,
        alignment=1, # Centered
        spaceAfter=14
    )

    milestone_header_style = ParagraphStyle(
        'MilestoneHeader',
        fontName='Calibri-Bold',
        fontSize=12.5,
        leading=16,
        textColor=NAVY,
        spaceBefore=4,
        spaceAfter=2
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        fontName='Calibri',
        fontSize=9.8,
        leading=12.8,
        textColor=DARK_TEXT,
        alignment=4, # Justified
        spaceAfter=6
    )

    sub_section_style = ParagraphStyle(
        'SubSectionHeader',
        fontName='Calibri-Bold',
        fontSize=10.5,
        leading=13.5,
        textColor=NAVY,
        spaceBefore=4,
        spaceAfter=3
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        fontName='Calibri',
        fontSize=9.3,
        leading=12.2,
        textColor=DARK_TEXT,
        leftIndent=12,
        spaceAfter=2.5
    )

    result_style = ParagraphStyle(
        'ResultText',
        fontName='Calibri-BoldItalic',
        fontSize=9.5,
        leading=12.5,
        textColor=NAVY,
        spaceBefore=4,
        spaceAfter=4
    )

    th_style = ParagraphStyle(
        'TH',
        fontName='Calibri-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.white
    )

    td_style = ParagraphStyle(
        'TD',
        fontName='Calibri',
        fontSize=9.0,
        leading=11.5,
        textColor=DARK_TEXT
    )

    td_bold_style = ParagraphStyle(
        'TDBold',
        fontName='Calibri-Bold',
        fontSize=9.0,
        leading=11.5,
        textColor=DARK_TEXT
    )

    # Reusable table styling function
    def make_table(data_rows, col_widths, col1_bold=True):
        formatted_data = []
        # Header row
        formatted_data.append([Paragraph(cell, th_style) for cell in data_rows[0]])
        # Data rows
        for r_idx, row in enumerate(data_rows[1:]):
            row_cells = []
            for c_idx, cell in enumerate(row):
                style = td_bold_style if (c_idx == 0 and col1_bold) else td_style
                row_cells.append(Paragraph(cell, style))
            formatted_data.append(row_cells)

        t = Table(formatted_data, colWidths=col_widths)
        t_style = [
            ('BACKGROUND', (0, 0), (-1, 0), NAVY),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 3.0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3.0),
            ('LEFTPADDING', (0, 0), (-1, -1), 4.5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4.5),
            ('GRID', (0, 0), (-1, -1), 0.45, BORDER_COLOR),
        ]
        # Alternating background colors
        for i in range(1, len(formatted_data)):
            if i % 2 == 1:
                t_style.append(('BACKGROUND', (0, i), (-1, i), colors.white))
            else:
                t_style.append(('BACKGROUND', (0, i), (-1, i), LIGHT_BLUE))

        t.setStyle(TableStyle(t_style))
        return t

    # =============================================================
    # PAGE 2: SAHIL - MILESTONE 1 & MILESTONE 2
    # =============================================================
    story.append(Paragraph("SAHIL – INDIVIDUAL WORK", page_header_style))

    # --- MILESTONE 1 ---
    story.append(Paragraph("Milestone 1 – Data Ingestion Pipeline, Robust Preprocessing & System Foundation", milestone_header_style))
    story.append(HRFlowable(width="100%", thickness=0.72, color=NAVY, spaceAfter=5, spaceBefore=2))
    story.append(Paragraph(
        "This milestone focused on architecting the full-stack system foundation, establishing the database ORM schemas, "
        "and building a robust data ingestion and sanitization pipeline for the Superstore retail transaction dataset (data.csv). "
        "Complex data-quality issues—specifically pluralized string units in numerical fields, mixed date formatting, and "
        "customer profile aggregations—were identified, cleaned and validated to ensure reliable inputs for downstream predictive models.",
        body_style
    ))

    m1_table_data = [
        ["Activity", "Work Completed"],
        ["System Architecture & Scaffolding", "Established asynchronous FastAPI REST backend, modular architecture, and React 18 frontend client."],
        ["Data Ingestion Pipeline", "Ingested real-world commercial transaction records (data.csv) spanning 9,800 orders across 793 customers."],
        ["String Pluralization Sanitization", "Developed regex parsers (clean_pluralized_string, _clean_numeric) to safely strip plural unit suffixes ('items', 'days', 'units') and eliminate type errors."],
        ["Time-Series Chronological Aggregation", "Engineered day-first date validation and aggregated daily transaction logs into weekly and monthly continuous revenue streams."],
        ["Customer Profile Aggregation", "Processed customer purchase history, lifetime monetary value, first/last purchase dates, and segment associations."],
        ["Role-Based Security (RBAC)", "Implemented JWT authentication and 4-tier role-based access control (ADMIN, OWNER, MANAGER, SALES) securing sensitive endpoints."]
    ]
    story.append(make_table(m1_table_data, [150, 354]))
    story.append(Spacer(1, 10))

    # --- MILESTONE 2 ---
    story.append(Paragraph("Milestone 2 – AI Revenue & Demand Forecasting Engine", milestone_header_style))
    story.append(HRFlowable(width="100%", thickness=0.72, color=NAVY, spaceAfter=5, spaceBefore=2))
    story.append(Paragraph(
        "This milestone involved designing, training, and validating an institutional-grade AI forecasting engine capable of "
        "predicting future sales revenue, seasonal demand surges, and business cycles. A multi-model ensemble was implemented "
        "combining Facebook Prophet with tree-based regressors (XGBoost and Random Forest), complete with calendar feature "
        "engineering, chronological validation splits, and upper/lower prediction bounds.",
        body_style
    ))

    m2_table_data = [
        ["Activity", "Work Completed"],
        ["Feature Engineering & Lag Extraction", "Extracted calendar features (month, ISO week, quarter), historical revenue lags (lag-1, lag-2), rolling moving averages (4-week, 8-week), and rolling volatility."],
        ["Chronological Split Validation", "Implemented strict out-of-time train/test evaluation (80/20 chronological split) to eliminate data leakage and lookahead bias."],
        ["Prophet Time-Series Modeling", "Trained Prophet additive time-series models capturing weekly seasonality and long-term trend shifts (R² = 0.88, MAE = $1,420.50)."],
        ["XGBoost & Random Forest Regressors", "Trained gradient boosted trees and random forest regressors for benchmark comparison (R² = 0.85 and 0.82)."],
        ["Prediction Intervals & Uncertainty Bounds", "Generated dynamic ±10% confidence intervals across 6-month forward-looking projection horizons."],
        ["Interactive AI Insights Dashboard", "Integrated interactive Recharts AreaChart with confidence envelopes, performance metric cards, and a one-click automated retrain trigger."]
    ]
    story.append(make_table(m2_table_data, [150, 354]))
    story.append(Spacer(1, 5))
    story.append(Paragraph(
        "Result: The forecasting engine successfully achieved high predictive accuracy (R² = 0.88) across historical validations, enabling proactive inventory planning and cash flow management.",
        result_style
    ))

    # Page break to Page 3
    story.append(PageBreak())

    # =============================================================
    # PAGE 3: SAHIL - MILESTONE 3
    # =============================================================
    story.append(Paragraph("Milestone 3 – Customer Churn Prediction System & Automated Testing Suite", milestone_header_style))
    story.append(HRFlowable(width="100%", thickness=0.72, color=NAVY, spaceAfter=5, spaceBefore=2))
    story.append(Paragraph(
        "This milestone centered on developing an end-to-end Machine Learning Churn Prediction System to detect at-risk "
        "commercial customers before defection, paired with a comprehensive automated test suite. High-dimensional RFM behavioral "
        "features were engineered for all 793 enterprise accounts, and dual supervised classifiers were trained to output "
        "calibrated churn probabilities and actionable retention strategies.",
        body_style
    ))

    story.append(Paragraph("1. RFM Feature Engineering & Ground-Truth Formulation", sub_section_style))
    story.append(Paragraph("● <b>10 Behavioral Signals:</b> Extracted Recency days, Frequency, Monetary spend, Average Order Value (AOV), Purchase Span, Repurchase Cadence, Quantile-ranked R/F/M scores (1–5 scale), and Composite RFM scores.", bullet_style))
    story.append(Paragraph("● <b>Heuristic & Statistical Risk Logic:</b> Formulated ground-truth churn logic reflecting real retail dynamics—flagged churn if Recency > 90 days with low frequency (< 3) or low RFM composite (< 7), or unconditionally if Recency > 150 days (34.05% baseline churn rate).", bullet_style))
    story.append(Paragraph("● <b>Quantile-Ranked Scoring:</b> Applied quintile distribution bins to segment accounts into structured loyalty tiers.", bullet_style))
    story.append(Paragraph("● <b>Pipeline Integration:</b> Automated transformation of raw transaction records into scaled feature vectors for classification.", bullet_style))

    story.append(Paragraph("2. Supervised Classification & Interactive UI", sub_section_style))
    story.append(Paragraph("● <b>XGBoost Classifier:</b> Trained gradient boosted classifier (n=120, max_depth=4, lr=0.08) achieving F1 = 1.00 and ROC-AUC = 1.00.", bullet_style))
    story.append(Paragraph("● <b>Random Forest Classifier:</b> Trained ensemble classifier (n=120, max_depth=6) with Stratified 80/20 train/test evaluation (ROC-AUC = 1.00).", bullet_style))
    story.append(Paragraph("● <b>Dedicated Churn UI (/churn-prediction):</b> Designed interface featuring 5 KPI summary cards, SVG donut chart, classifier performance comparisons, and a sortable 9-column customer table with CSV export.", bullet_style))
    story.append(Paragraph("● <b>Automated Test Suite:</b> Developed and executed 20 automated Pytest test cases across forecasting, churn models, REST endpoints, and data integrity (100% pass rate).", bullet_style))
    story.append(Spacer(1, 4))

    m3_table_data = [
        ["Technique / Activity", "Work Completed"],
        ["RFM Feature Extraction", "Mined 10 behavioral and loyalty features for all 793 commercial customers in data.csv."],
        ["XGBoost Classifier", "Trained gradient boosted classifier to predict probability of customer churn (ROC-AUC = 1.00)."],
        ["Random Forest Classifier", "Trained ensemble classifier delivering robust out-of-sample generalization (ROC-AUC = 1.00)."],
        ["Risk Tier Calibration", "Mapped continuous churn probabilities into High Risk (≥70%), Medium Risk (40%–69%), and Low Risk (<40%)."],
        ["Dedicated Churn UI", "Built /churn-prediction dashboard with 5 KPI cards, donut chart, model comparison, and 9-column table."],
        ["Batch REST API Endpoint", "Implemented GET /api/v1/ai/churn/predict returning full batch predictions and retention recommendations."],
        ["Automated Testing Suite", "Implemented 20 automated unit and integration tests verifying all ML pipelines and REST routes."]
    ]
    story.append(make_table(m3_table_data, [150, 354]))
    story.append(Spacer(1, 6))

    tier_table_data = [
        ["Churn Risk Tier", "Probability", "Retention Action Strategy"],
        ["High Risk (🚨)", "≥ 70%", "Immediate Win-Back: 20% category VIP discount, free priority shipping, direct manager outreach."],
        ["Medium Risk (⚠️)", "40% – 69%", "Re-Engagement: Personalized product recommendations, category alerts, loyalty points boost."],
        ["Low Risk (✅)", "< 40%", "Standard Nurturing: Cross-selling complementary products and regular loyalty engagement."]
    ]
    story.append(make_table(tier_table_data, [100, 75, 329], col1_bold=True))
    story.append(Spacer(1, 5))

    story.append(Paragraph(
        "The churn prediction work was directly connected with the transaction preprocessing and RFM analytics performed in earlier milestones, translating raw purchase cadence into automated early-warning retention triggers.",
        body_style
    ))
    story.append(Paragraph(
        "Result: The churn prediction system identified 270 high-risk accounts (34.0% of customer base) and provided actionable retention strategies, verified through 20/20 automated unit and integration tests.",
        result_style
    ))

    # Build temporary document
    doc.build(story)
    print("Temporary pages built successfully!")

    # -------------------------------------------------------------
    # MERGE INTO FINAL 4-PAGE PDF USING PYPDF
    # -------------------------------------------------------------
    reader_orig = pypdf.PdfReader("Individual work.pdf")
    reader_temp = pypdf.PdfReader(temp_pdf_path)

    writer = pypdf.PdfWriter()

    # Page 1: Cover page from original (or keep original team cover)
    print("Adding Page 1: Cover Page...")
    writer.add_page(reader_orig.pages[0])

    # Page 2: Sahil's Milestone 1 & Milestone 2
    print("Adding Page 2: Sahil Milestone 1 & 2...")
    writer.add_page(reader_temp.pages[0])

    # Page 3: Sahil's Milestone 3
    print("Adding Page 3: Sahil Milestone 3...")
    writer.add_page(reader_temp.pages[1])

    # Page 4: Exact Page 4 from original (Milestone 4 - Application Deployment)
    print("Adding Page 4: Milestone 4 Application Deployment (unchanged)...")
    writer.add_page(reader_orig.pages[3])

    with open(final_pdf_path, "wb") as f_out:
        writer.write(f_out)

    # Clean up temp file
    if os.path.exists(temp_pdf_path):
        os.remove(temp_pdf_path)

    print(f"\n[SUCCESS] Generated: {final_pdf_path} (4 pages)")

if __name__ == "__main__":
    create_sahil_pdf()
