import os
import shutil
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
pdf_dir = os.path.join(root_dir, "pdfs")
os.makedirs(pdf_dir, exist_ok=True)

styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    "DocTitle",
    parent=styles["Heading1"],
    fontName="Helvetica-Bold",
    fontSize=16,
    leading=20,
    textColor=colors.HexColor("#0f2b48"),
    spaceAfter=6
)

subtitle_style = ParagraphStyle(
    "DocSubtitle",
    parent=styles["Normal"],
    fontName="Helvetica-Oblique",
    fontSize=10,
    leading=13,
    textColor=colors.HexColor("#555555"),
    spaceAfter=12
)

heading2_style = ParagraphStyle(
    "SectionHeading",
    parent=styles["Heading2"],
    fontName="Helvetica-Bold",
    fontSize=12,
    leading=16,
    textColor=colors.HexColor("#0f2b48"),
    spaceBefore=10,
    spaceAfter=6
)

body_style = ParagraphStyle(
    "BodyTextCustom",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=9.5,
    leading=13.5,
    textColor=colors.HexColor("#222222"),
    spaceAfter=6
)

callout_style = ParagraphStyle(
    "CalloutText",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=9.5,
    leading=13.5,
    textColor=colors.HexColor("#856404"),
    backColor=colors.HexColor("#fff3cd"),
    borderColor=colors.HexColor("#ffeeba"),
    borderWidth=1,
    borderPadding=6,
    spaceBefore=6,
    spaceAfter=8
)

def create_banner(org_name, doc_title, doc_ref):
    data = [
        [Paragraph(f"<b>{org_name}</b><br/>DRILLING & EXPLORATION DIRECTORATE — UPPER ASSAM BASIN", ParagraphStyle('H1', parent=body_style, textColor=colors.white, fontSize=10.5, leading=13))],
        [Paragraph(f"<b>{doc_title}</b> | Ref: {doc_ref}", ParagraphStyle('H2', parent=body_style, textColor=colors.white, fontSize=8.5, leading=11))]
    ]
    t = Table(data, colWidths=[520])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#0f2b48")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ]))
    return t

# ---------------------------------------------------------
# 1. DUL-92 REPORT 1: QUICK SPOT KNOWLEDGE PACK
# ---------------------------------------------------------
def generate_dul92_report1():
    file_path = os.path.join(pdf_dir, "01_DUL92_Stuck_Pipe_Complete.pdf")
    doc = SimpleDocTemplate(file_path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story = []

    story.append(Paragraph("DUL-92 — Stuck Pipe Historical Knowledge Pack", title_style))
    story.append(Paragraph("Synthetic historical offset-well record for RAG, similarity matching, and hazard explanation", subtitle_style))
    story.append(Spacer(1, 4))

    story.append(Paragraph("WELL & EVENT SUMMARY", heading2_style))
    summary_data = [
        ["Field Metric", "Value", "Field Metric", "Value"],
        ["Well Name:", "Duliajan-92 (DUL-92)", "Field / Basin:", "Duliajan Field, Upper Assam Shelf"],
        ["Event Depth:", "2,210 – 2,214.5 m MD", "Formation Target:", "Barail Group Shale"],
        ["Primary Hazard:", "Reactive shale / mechanical pipe entrapment", "Rig Assigned:", "OIL Rig 14 (2000 HP)"],
        ["Spud Date:", "12-Oct-2022", "Target Depth:", "3,520 m (MD)"],
        ["Completion Date:", "18-Jan-2023", "Doc Type:", "REPORT 1: QUICK SPOT KNOWLEDGE PACK"]
    ]
    t = Table(summary_data, colWidths=[100, 160, 100, 160])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#f0f4f8")),
        ('BACKGROUND', (2,0), (2,-1), colors.HexColor("#f0f4f8")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cccccc")),
        ('PADDING', (0,0), (-1,-1), 4),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))

    story.append(Paragraph("INCIDENT NARRATIVE", heading2_style))
    story.append(Paragraph(
        "During a synthetic drilling scenario, the drill string became mechanically entrapped while pulling out of hole (POOH) at approximately 2,210 m in Barail Shale. "
        "Torque increased sharply and overpull was observed. The event is represented as a historical case that NWIS can retrieve when a current well enters a similar formation and shows a similar sensor signature.",
        body_style
    ))

    story.append(Paragraph("RECORDED PARAMETERS AT INCIDENT TIME", heading2_style))
    param_data = [
        ["Parameter", "Historical Observed Value", "Reference / Normal Baseline Context"],
        ["Depth Interval", "2,210 – 2,214.5 m MD", "Event interval in Barail Shale"],
        ["Mud Weight", "1.16 g/cc (Water-Based)", "1.24 g/cc EMW Synthetic Reference"],
        ["Gamma Ray (GR)", "118 API", "Reference 45 – 60 API"],
        ["Standpipe Pressure", "2,850 psi", "Reference ~2,100 psi (+750 psi Pack-off)"],
        ["Rotational Torque", "28.4 kN·m", "Reference ~11.5 kN·m (+16.9 kN·m Entrapment Spike)"],
        ["Smectite Clay Index", "42% Smectite Content", "Reference < 15% (Severe swelling hazard)"]
    ]
    t2 = Table(param_data, colWidths=[140, 180, 200])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f2b48")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#b0bec5")),
        ('PADDING', (0,0), (-1,-1), 4),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
    ]))
    story.append(t2)
    story.append(Spacer(1, 8))

    story.append(Paragraph("MITIGATION & OUTCOME RECIPE", heading2_style))
    story.append(Paragraph("<b>Step 1:</b> Spot 50 bbl Poly-Glycol / high-lubricity pill into annulus at 2,210 m depth.", body_style))
    story.append(Paragraph("<b>Step 2:</b> Soak for 4 hours while maintaining 10 tonnes tension and working jars in downward direction.", body_style))
    story.append(Paragraph("<b>Step 3:</b> Inhibited active mud system using KCl 8% and glycol 4% v/v treatment.", body_style))
    story.append(Paragraph("<b>Step 4:</b> Drill string freed successfully at approximately 09:15 hrs IST.", body_style))
    story.append(Paragraph("<b>Step 5:</b> Pump 30 bbl high-viscosity sweep and condition mud density to 1.25 g/cc.", body_style))

    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>NWIS Hackathon Knowledge Base — SYNTHETIC DEMONSTRATION RECORD FOR LIVE RAG MATCHING</b>", callout_style))

    doc.build(story)

# ---------------------------------------------------------
# 2. DUL-92 REPORT 2: WELL COMPLETION REPORT (WCR) DETAILED FILE
# ---------------------------------------------------------
def generate_dul92_report2():
    file_path = os.path.join(pdf_dir, "WCR_OIL_DUL92_Barail_Stuck_Pipe_Report.pdf")
    doc = SimpleDocTemplate(file_path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story = []

    story.append(create_banner("OIL INDIA LIMITED (DULIAJAN HEADQUARTERS)", "WELL COMPLETION REPORT — STUCK PIPE INCIDENT ANALYSIS", "WCR/OIL/2023/DUL-92"))
    story.append(Spacer(1, 10))

    story.append(Paragraph("WELL SUMMARY & GENERAL INFORMATION", heading2_style))
    summary_data = [
        ["Well Name:", "Duliajan-92 (DUL-92)", "Field / Block:", "Duliajan Field (Upper Assam Shelf)"],
        ["Coordinates:", "26.844° N, 95.328° E", "Spud Date:", "12-OCT-2022"],
        ["Target Depth:", "3,520 m (MD)", "Completion Date:", "18-JAN-2023"],
        ["Primary Reservoir:", "Barail Group Sandstone", "Rig Assigned:", "OIL Rig 14 (2000 HP)"]
    ]
    t = Table(summary_data, colWidths=[110, 150, 110, 150])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#f0f4f8")),
        ('BACKGROUND', (2,0), (2,-1), colors.HexColor("#f0f4f8")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cccccc")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

    story.append(Paragraph("INCIDENT CHRONOLOGY AT BARAIL GROUP SHALE (2,210 m)", heading2_style))
    story.append(Paragraph(
        "On 14-NOV-2022 at 04:30 hrs IST, while tripping out of hole (POOH) at depth 2,210m in the Barail Group Shale section, "
        "the drill string experienced sudden mechanical entrapment (Stuck Pipe). Top drive rotational torque spiked from 12 kN·m to 28 kN·m, "
        "and overpull reached the maximum allowable limit of 45 tonnes without drill string movement.",
        body_style
    ))

    story.append(Paragraph("<b>🚨 HAZARD CLASSIFICATION:</b> Reactive Smectite/Illite Shale Hydration & Mechanical Pipe Encrustation.", callout_style))

    story.append(Paragraph("GEOLOGICAL & DRILLING PARAMETERS AT INCIDENT TIME", heading2_style))
    param_data = [
        ["Parameter", "Observed Value", "Normal Baseline", "Anomaly Deviation"],
        ["Depth Interval", "2,210.00 m - 2,214.50 m", "2,150 m - 2,500 m", "Barail Shale Zone"],
        ["Mud Weight", "1.16 g/cc (Water-Based)", "1.24 g/cc EMW", "-0.08 g/cc Underbalance"],
        ["Gamma Ray (GR)", "118 API", "45 - 60 API", "High Shale Content"],
        ["Standpipe Pressure", "2,850 psi", "2,100 psi", "+750 psi (Pack-off signal)"],
        ["Rotational Torque", "28.4 kN·m", "11.5 kN·m", "+16.9 kN·m (Entrapment Spike)"],
        ["Shale Hydration Index", "High Smectite (42%)", "< 15%", "Severe swelling hazard"]
    ]
    t2 = Table(param_data, colWidths=[130, 130, 130, 130])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f2b48")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#b0bec5")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
    ]))
    story.append(t2)
    story.append(Spacer(1, 10))

    story.append(Paragraph("APPLIED MITIGATION RECIPE & RECOVERY PROCEDURE", heading2_style))
    story.append(Paragraph("<b>1. Glycol Spotting Pill:</b> Mixed and pumped a 50 bbl specialized Poly-Glycol / High-Lubricity Spotting Pill into the annulus at 2,210m to dehydrate swollen shales.", body_style))
    story.append(Paragraph("<b>2. Soak Duration:</b> Allowed spotting pill to soak around BHA for 4 hours while maintaining 10 tonnes tension and working jars in downward direction.", body_style))
    story.append(Paragraph("<b>3. Mud System Inhibitor Adjustment:</b> Inhibited active mud system by raising KCl concentration to 8% and adjusting glycol content to 4% v/v.", body_style))
    story.append(Paragraph("<b>4. String Recovery:</b> Drill string freed at 09:15 hrs. Swept hole with 30 bbl high-viscosity nut-plug sweep and conditioned mud density to 1.25 g/cc.", body_style))

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>TOTAL NON-PRODUCTIVE TIME (NPT):</b> 36.5 Hours | <b>ESTIMATED FINANCIAL IMPACT:</b> ₹45.6 Lakhs", callout_style))

    doc.build(story)

# ---------------------------------------------------------
# 3. DUL-88 REPORT 1: QUICK SPOT KNOWLEDGE PACK
# ---------------------------------------------------------
def generate_dul88_report1():
    file_path = os.path.join(pdf_dir, "02_DUL88_Gas_Kick_Complete.pdf")
    doc = SimpleDocTemplate(file_path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story = []

    story.append(Paragraph("DUL-88 — Kopili Gas Kick Historical Knowledge Pack", title_style))
    story.append(Paragraph("Synthetic historical offset-well record for RAG, similarity matching, and hazard explanation", subtitle_style))
    story.append(Spacer(1, 4))

    story.append(Paragraph("WELL & EVENT SUMMARY", heading2_style))
    summary_data = [
        ["Field Metric", "Value", "Field Metric", "Value"],
        ["Well Name:", "Duliajan-88 (DUL-88)", "Field / Basin:", "Duliajan Field, Upper Assam Shelf"],
        ["Event Depth:", "2,842.00 m MD", "Formation Target:", "Kopili Overpressured Formation"],
        ["Primary Hazard:", "High Pressure Gas Influx / Kick", "Rig Assigned:", "OIL Rig 14 (2000 HP)"],
        ["Spud Date:", "15-Aug-2022", "Target Depth:", "3,400 m (MD)"],
        ["Doc Type:", "REPORT 1: QUICK SPOT KNOWLEDGE PACK", "Status:", "Controlled & Stabilized"]
    ]
    t = Table(summary_data, colWidths=[100, 160, 100, 160])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#f0f4f8")),
        ('BACKGROUND', (2,0), (2,-1), colors.HexColor("#f0f4f8")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cccccc")),
        ('PADDING', (0,0), (-1,-1), 4),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))

    story.append(Paragraph("INCIDENT NARRATIVE", heading2_style))
    story.append(Paragraph(
        "While drilling 8.5-inch section at depth 2,842m in overpressured Kopili shale, active mud pit gain of 15.2 barrels was observed and total gas units spiked to 2,450 units. "
        "Driller shut in well on Annular BOP. SIDPP reached 240 psi and SICP reached 350 psi.",
        body_style
    ))

    story.append(Paragraph("RECORDED PARAMETERS AT INCIDENT TIME", heading2_style))
    pressure_data = [
        ["Pressure Metric", "Value Recorded", "Operational Context"],
        ["Shut-In Casing Pressure (SICP)", "350 psi", "1.34 g/cc EMW gas accumulation"],
        ["Shut-In Drill Pipe Pressure (SIDPP)", "240 psi", "1.32 g/cc EMW pore pressure measure"],
        ["Original Mud Weight", "1.24 g/cc", "Underbalanced by 0.08 g/cc"],
        ["Kill Mud Weight Required", "1.36 g/cc", "Includes 0.04 g/cc safety margin"],
        ["Mud Pit Gain", "15.2 bbl", "Gas influx volume into wellbore"],
        ["Peak Connection Gas", "2,450 Units", "Methane 82%, Ethane 11%, Propane 7%"]
    ]
    t2 = Table(pressure_data, colWidths=[170, 130, 220])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f2b48")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#b0bec5")),
        ('PADDING', (0,0), (-1,-1), 4),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
    ]))
    story.append(t2)
    story.append(Spacer(1, 8))

    story.append(Paragraph("MITIGATION & KILL PROCEDURE", heading2_style))
    story.append(Paragraph("<b>Step 1:</b> Added API Barite to active tanks to raise mud weight to 1.36 g/cc.", body_style))
    story.append(Paragraph("<b>Step 2:</b> Executed Wait & Weight method down drill string while maintaining constant drill pipe pressure.", body_style))
    story.append(Paragraph("<b>Step 3:</b> Flared 45,000 cu ft gas safely at degasser outlet.", body_style))
    story.append(Paragraph("<b>Step 4:</b> Zero SIDPP/SICP achieved after 1.5 circulation bottoms-up.", body_style))

    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>TOTAL NPT ELAPSED:</b> 22.0 Hours | <b>ZERO CASUALTIES / ZERO ENVIRONMENTAL RELEASE</b>", callout_style))

    doc.build(story)

# ---------------------------------------------------------
# 4. DUL-88 REPORT 2: WCR DETAILED FILE
# ---------------------------------------------------------
def generate_dul88_report2():
    file_path = os.path.join(pdf_dir, "WCR_OIL_DUL88_Kopili_Gas_Kick_Report.pdf")
    doc = SimpleDocTemplate(file_path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story = []

    story.append(create_banner("OIL INDIA LIMITED (DULIAJAN HEADQUARTERS)", "WELL COMPLETION REPORT — KOPILI GAS KICK INCIDENT", "WCR/OIL/2023/DUL-88"))
    story.append(Spacer(1, 10))

    story.append(Paragraph("WELL SUMMARY & OPERATIONAL SCOPE", heading2_style))
    summary_data = [
        ["Well Name:", "Duliajan-88 (DUL-88)", "Field / Basin:", "Duliajan Field (Upper Assam Shelf)"],
        ["Coordinates:", "26.851° N, 95.315° E", "Kick Depth:", "2,842 m (MD)"],
        ["Formation:", "Kopili Shale / Sand Transition", "Mud Type:", "Polymer Water-Based Mud"],
        ["Reservoir:", "Kopili Sandstone Gas Zone", "BOP Rating:", "10,000 psi Annular & Ram"]
    ]
    t = Table(summary_data, colWidths=[110, 150, 110, 150])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#f0f4f8")),
        ('BACKGROUND', (2,0), (2,-1), colors.HexColor("#f0f4f8")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cccccc")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

    story.append(Paragraph("INCIDENT DESCRIPTION: HIGH PRESSURE GAS INFLUX", heading2_style))
    story.append(Paragraph(
        "While drilling 8.5-inch section at depth 2,842m in the overpressured Kopili formation, the rig mud logger detected a sudden active pit gain of 15 barrels "
        "and total gas units spiked from 45 units to over 2,200 units (C1 to C4 hydrocarbons). "
        "Driller immediately shut in the well using the Annular Preventer as per OIL Standard Operating Procedure (SOP).",
        body_style
    ))

    story.append(Paragraph("<b>🚨 HAZARD CLASSIFICATION:</b> High-Pressure Gas Influx / Kick in Overpressured Kopili Shale-Sand Interface.", callout_style))

    story.append(Paragraph("WELL CONTROL & PRESSURE PARAMETERS RECORDED", heading2_style))
    pressure_data = [
        ["Pressure Metric", "Value Recorded", "EMW Equivalent", "Operational Context"],
        ["Shut-In Casing Pressure (SICP)", "350 psi", "1.34 g/cc EMW", "Annular gas column accumulation"],
        ["Shut-In Drill Pipe Pressure (SIDPP)", "240 psi", "1.32 g/cc EMW", "Formation pore pressure measure"],
        ["Original Mud Weight", "1.24 g/cc", "1.24 g/cc", "Underbalanced by 0.08 g/cc"],
        ["Kill Mud Weight Required", "1.36 g/cc", "1.36 g/cc", "Includes 0.04 g/cc safety margin"],
        ["Mud Pit Gain", "15.2 bbl", "-", "Gas influx volume into wellbore"],
        ["Peak Connection Gas", "2,450 Units", "-", "Methane 82%, Ethane 11%, Propane 7%"]
    ]
    t2 = Table(pressure_data, colWidths=[150, 110, 110, 150])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f2b48")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#b0bec5")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
    ]))
    story.append(t2)
    story.append(Spacer(1, 10))

    story.append(Paragraph("WELL CONTROL & KILL MITIGATION PROCEDURE", heading2_style))
    story.append(Paragraph("<b>1. Weighting Up Mud System:</b> Added API Barite to active tanks, raising mud weight from 1.24 g/cc to 1.36 g/cc kill mud.", body_style))
    story.append(Paragraph("<b>2. Engineer's Method (Wait & Weight):</b> Circulated kill mud down drill string while maintaining constant drill pipe pressure, venting gas influx safely through choke manifold and gas degasser.", body_style))
    story.append(Paragraph("<b>3. Gas Flare Igniter:</b> Flared off 45,000 cu ft of gas at poor-boy degasser outlet safely.", body_style))
    story.append(Paragraph("<b>4. Complete Well Stabilization:</b> Observed zero SIDPP/SICP after 1.5 circulation bottoms-up. Resumed normal drilling operations.", body_style))

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>TOTAL NPT ELAPSED:</b> 22.0 Hours | <b>ZERO CASUALTIES / ZERO ENVIRONMENTAL RELEASE</b>", callout_style))

    doc.build(story)

# ---------------------------------------------------------
# 5. DUL-99 REPORT 1: QUICK SPOT KNOWLEDGE PACK
# ---------------------------------------------------------
def generate_dul99_report1():
    file_path = os.path.join(pdf_dir, "03_DUL99_Lost_Circulation_Complete.pdf")
    doc = SimpleDocTemplate(file_path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story = []

    story.append(Paragraph("DUL-99 — Sylhet Lost Circulation Historical Knowledge Pack", title_style))
    story.append(Paragraph("Synthetic historical offset-well record for RAG, similarity matching, and hazard explanation", subtitle_style))
    story.append(Spacer(1, 4))

    story.append(Paragraph("WELL & EVENT SUMMARY", heading2_style))
    summary_data = [
        ["Field Metric", "Value", "Field Metric", "Value"],
        ["Well Name:", "Duliajan-99 (DUL-99)", "Field / Basin:", "Duliajan Field, Upper Assam Shelf"],
        ["Event Depth:", "3,180 – 3,210 m MD", "Formation Target:", "Sylhet Karst Limestone"],
        ["Primary Hazard:", "Severe Mud Loss / Fractured Vugs", "Rig Assigned:", "OIL Rig 14 (2000 HP)"],
        ["Doc Type:", "REPORT 1: QUICK SPOT KNOWLEDGE PACK", "Target Depth:", "3,550 m (MD)"]
    ]
    t = Table(summary_data, colWidths=[100, 160, 100, 160])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#f0f4f8")),
        ('BACKGROUND', (2,0), (2,-1), colors.HexColor("#f0f4f8")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cccccc")),
        ('PADDING', (0,0), (-1,-1), 4),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))

    story.append(Paragraph("INCIDENT NARRATIVE", heading2_style))
    story.append(Paragraph(
        "Bit penetrated a natural vuggy fracture network in Sylhet Limestone at 3,210m. Returns dropped to zero (100% total mud loss). "
        "Annular fluid level dropped by 120m rapidly threatening hydrostatic head loss.",
        body_style
    ))

    story.append(Paragraph("MITIGATION & RECOVERY EXECUTED", heading2_style))
    story.append(Paragraph("<b>Step 1:</b> Annular top-up with fresh water to maintain hydrostatic column.", body_style))
    story.append(Paragraph("<b>Step 2:</b> Pumped 60 bbl Coarse LCM pill (Nut Plug, Mica, Calcium Carbonate 25 lb/bbl).", body_style))
    story.append(Paragraph("<b>Step 3:</b> Placed 35 bbl Class-G thixotropic cement plug across 3,200m–3,210m interval.", body_style))
    story.append(Paragraph("<b>Step 4:</b> Drilled out cement plug after 12-hour set time with full returns restored at 1.22 g/cc mud weight.", body_style))

    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>TOTAL NPT ELAPSED:</b> 44.0 Hours | <b>LCM & CEMENT MATERIAL COST:</b> ₹18.5 Lakhs", callout_style))

    doc.build(story)

# ---------------------------------------------------------
# 6. DUL-99 REPORT 2: WCR DETAILED FILE
# ---------------------------------------------------------
def generate_dul99_report2():
    file_path = os.path.join(pdf_dir, "WCR_OIL_DUL99_Sylhet_Lost_Circulation_Report.pdf")
    doc = SimpleDocTemplate(file_path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story = []

    story.append(create_banner("OIL INDIA LIMITED (DULIAJAN HEADQUARTERS)", "WELL COMPLETION REPORT — SYLHET LIMESTONE MUD LOSS", "WCR/OIL/2023/DUL-99"))
    story.append(Spacer(1, 10))

    story.append(Paragraph("WELL IDENTIFICATION & LOCATION METRICS", heading2_style))
    summary_data = [
        ["Well Name:", "Duliajan-99 (DUL-99)", "Field:", "Duliajan Field"],
        ["Coordinates:", "26.832° N, 95.305° E", "Loss Depth:", "3,210 m (MD)"],
        ["Formation Target:", "Sylhet Karst Limestone", "Pre-Loss Mud Weight:", "1.32 g/cc"],
        ["Hole Size:", "8.5-inch section", "Bit Type:", "PDC 5-Blade Matrix"]
    ]
    t = Table(summary_data, colWidths=[110, 150, 110, 150])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#f0f4f8")),
        ('BACKGROUND', (2,0), (2,-1), colors.HexColor("#f0f4f8")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cccccc")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

    story.append(Paragraph("TOTAL MUD LOSS INCIDENT IN FRACTURED LIMESTONE", heading2_style))
    story.append(Paragraph(
        "At 3,210m depth, bit penetrated a natural vuggy fracture network within the Sylhet Limestone formation. "
        "Mud flow-rate return at shaker dropped to ZERO (100% total lost circulation). "
        "Fluid level in the annulus dropped rapidly by 120m, threatening well control by losing hydrostatic column.",
        body_style
    ))

    story.append(Paragraph("<b>🚨 HAZARD CLASSIFICATION:</b> Severe Lost Circulation in Karstified / Fractured Sylhet Limestone.", callout_style))

    story.append(Paragraph("MITIGATION & RECOVERY EXECUTED", heading2_style))
    story.append(Paragraph("<b>1. Annular Top-up:</b> Immediately filled annulus from top with fresh water to maintain hydrostatic pressure.", body_style))
    story.append(Paragraph("<b>2. Coarse LCM Pill:</b> Mixed and pumped 60 bbl Loss Circulation Material (LCM) pill containing Nut Plug (Coarse), Mica (Medium), and Calcium Carbonate (25 lb/bbl).", body_style))
    story.append(Paragraph("<b>3. Cement Squeeze Plug:</b> Pumping 35 bbl Class-G thixotropic cement plug across 3,200m–3,210m interval. Allowed cement to set for 12 hours.", body_style))
    story.append(Paragraph("<b>4. Drilling Resumed:</b> Drilled out cement plug; full returns restored with 1.22 g/cc reduced mud weight.", body_style))

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>TOTAL NPT ELAPSED:</b> 44.0 Hours | <b>LCM & CEMENT MATERIAL COST:</b> ₹18.5 Lakhs", callout_style))

    doc.build(story)

# ---------------------------------------------------------
# 7. DUL-104 REPORT 1 & REPORT 2 (DAILY DRILLING REPORTS)
# ---------------------------------------------------------
def generate_dul104_report1():
    file_path = os.path.join(pdf_dir, "04_DUL104_Current_Drilling_Complete.pdf")
    doc = SimpleDocTemplate(file_path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story = []

    story.append(Paragraph("DUL-104 — Current Drilling Operations Knowledge Pack", title_style))
    story.append(Paragraph("Daily Operational Overview & Elevated Torque Anomaly Warning", subtitle_style))
    story.append(Spacer(1, 4))

    summary_data = [
        ["Well Name:", "Duliajan-104 (DUL-104)", "Report Date:", "05-DEC-2023"],
        ["Current Depth:", "2,205 m (MD)", "24-hr Progress:", "85 m drilled"],
        ["Formation:", "Barail Group (Upper Shale)", "Current ROP:", "14.5 m/hr"],
        ["Mud Weight:", "1.20 g/cc", "Torque Status:", "⚠️ Elevated (18.2 kN·m)"]
    ]
    t = Table(summary_data, colWidths=[110, 150, 110, 150])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#f0f4f8")),
        ('BACKGROUND', (2,0), (2,-1), colors.HexColor("#f0f4f8")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cccccc")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))

    story.append(Paragraph("24-HOUR OPERATIONAL LOG & ANOMALY OBSERVATION", heading2_style))
    story.append(Paragraph("<b>00:00 - 08:00 hrs:</b> Drilled 12.25-inch section smoothly from 2,120m to 2,165m in Upper Barail sandstone. Parameters steady.", body_style))
    story.append(Paragraph("<b>08:00 - 16:00 hrs:</b> Transitioned into Barail Reactive Shale at 2,185m. Observed steady rise in surface torque from 11.5 kN·m to 18.2 kN·m. Overpull of 12 tonnes noted during connection at 2,200m.", body_style))
    story.append(Paragraph("<b>16:00 - 24:00 hrs:</b> Initiated proactive back-reaming and pumped 25 bbl high-viscosity sweep. Conditioned mud with 2% Poly-Glycol to prevent pipe sticking.", body_style))

    story.append(Paragraph("<b>⚠️ PROACTIVE ALERT:</b> Early warning triggered for potential Barail shale pipe sticking based on historical DUL-92 signature.", callout_style))

    doc.build(story)

def generate_dul104_report2():
    file_path = os.path.join(pdf_dir, "DDR_OIL_DUL104_Barail_Section_Daily_Report.pdf")
    doc = SimpleDocTemplate(file_path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story = []

    story.append(create_banner("OIL INDIA LIMITED", "DAILY DRILLING REPORT (24-HOUR LOG) — DUL-104", "DDR/OIL/2023/104-D12"))
    story.append(Spacer(1, 10))

    summary_data = [
        ["Well Name:", "Duliajan-104 (DUL-104)", "Report Date:", "05-DEC-2023"],
        ["Current Depth:", "2,205 m (MD)", "24-hr Progress:", "85 m drilled"],
        ["Formation:", "Barail Group (Upper Shale)", "Current ROP:", "14.5 m/hr"],
        ["Mud Weight:", "1.20 g/cc", "Torque Status:", "⚠️ Elevated (18.2 kN·m)"]
    ]
    t = Table(summary_data, colWidths=[110, 150, 110, 150])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#f0f4f8")),
        ('BACKGROUND', (2,0), (2,-1), colors.HexColor("#f0f4f8")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cccccc")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

    story.append(Paragraph("24-HOUR DRILLING NARRATIVE & ANOMALY OBSERVATION", heading2_style))
    story.append(Paragraph("<b>00:00 - 08:00 hrs:</b> Drilled 12.25-inch section smoothly from 2,120m to 2,165m in Upper Barail sandstone. Parameters steady.", body_style))
    story.append(Paragraph("<b>08:00 - 16:00 hrs:</b> Transitioned into Barail Reactive Shale at 2,185m. Observed steady rise in surface torque from 11.5 kN·m to 18.2 kN·m. Overpull of 12 tonnes noted during connection at 2,200m.", body_style))
    story.append(Paragraph("<b>16:00 - 24:00 hrs:</b> Initiated proactive back-reaming and pumped 25 bbl high-viscosity sweep. Conditioned mud with 2% Poly-Glycol to prevent pipe sticking.", body_style))

    story.append(Paragraph("<b>⚠️ PROACTIVE ALERT:</b> Early warning triggered for potential Barail shale pipe sticking based on historical DUL-92 signature.", callout_style))

    doc.build(story)

# ---------------------------------------------------------
# 8. FIELD OVERVIEW & RESEARCH PAPERS
# ---------------------------------------------------------
def generate_field_overview_pdf():
    file_path = os.path.join(pdf_dir, "OIL_Assam_Basin_Field_Overview_Report.pdf")
    doc = SimpleDocTemplate(file_path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story = []

    story.append(create_banner("OIL INDIA LIMITED (DULIAJAN HEADQUARTERS)", "UPPER ASSAM BASIN FIELD OVERVIEW REPORT", "TECH-REP/OIL/2023/ASSAM-BASIN-01"))
    story.append(Spacer(1, 10))

    story.append(Paragraph("REGIONAL STRATIGRAPHY & FIELD ARCHITECTURE", heading2_style))
    story.append(Paragraph(
        "The Upper Assam Shelf Basin contains seven major oil and gas fields operated by Oil India Limited: Duliajan, Digboi, Naharkatiya, Moran, Rudrasagar, Jorhat, and Sibsagar. "
        "The Tertiary sedimentary column spans from surface Tipam Sandstones down to the Basal Sandstone above Precambrian basement rock.",
        body_style
    ))

    table_data = [
        ["Field Name", "Basin Region", "Key Reservoir Formations", "Primary Operational Hazards"],
        ["Duliajan Field", "Upper Assam Shelf", "Barail Sand, Girujan, Tipam", "Reactive Shale Swelling, Gas Kick"],
        ["Digboi Field", "Upper Assam Shelf", "Tipam Sandstone, Digboi Surface", "High Friction, Shallow Gas Drift"],
        ["Naharkatiya Field", "Upper Assam Shelf", "Barail Group, Kopili Shale", "Pack-off, Differential Sticking"],
        ["Moran Field", "Upper Assam Shelf", "Barail & Sylhet Formations", "Lost Circulation, Tight Hole"],
        ["Rudrasagar Field", "Upper Assam Shelf", "Barail Main Pay, Kopili", "High Pore Pressure Transition"],
        ["Jorhat & Sibsagar", "Upper Assam Shelf", "Tipam & Barail Group", "Hole Washout, Clay Dispersion"]
    ]
    t = Table(table_data, colWidths=[95, 105, 150, 170])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f2b48")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#b0bec5")),
        ('PADDING', (0,0), (-1,-1), 4),
        ('FONTSIZE', (0,0), (-1,-1), 8),
    ]))
    story.append(t)
    doc.build(story)

def generate_geology_nwis_pdf():
    file_path = os.path.join(pdf_dir, "Assam_Basin_Geology_NWIS_Context.pdf")
    doc = SimpleDocTemplate(file_path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story = []

    story.append(create_banner("OIL INDIA LIMITED R&D", "ASSAM BASIN GEOLOGY & NWIS DECISION CONTEXT", "NWIS-TECH-2023-GEO-01"))
    story.append(Spacer(1, 10))

    story.append(Paragraph("PETROLEUM SYSTEM & GEOMECHANICAL RISK PROFILE", heading2_style))
    story.append(Paragraph(
        "Geomechanical evaluation across Upper Assam fields establishes three primary drilling hazard windows: "
        "(1) Barail Group (1,800m–2,500m) containing 35–45% Smectite clay causing severe pipe sticking; "
        "(2) Kopili Formation (2,500m–3,200m) exhibiting pore pressure ramp up to 1.36 g/cc EMW requiring heavy mud weights; and "
        "(3) Sylhet Limestone (3,000m–3,500m) containing karstified vuggy voids leading to total mud loss.",
        body_style
    ))
    doc.build(story)

def generate_spe_paper_pdf():
    file_path = os.path.join(pdf_dir, "SPE_Assam_Basin_Drilling_Hazards_Paper.pdf")
    doc = SimpleDocTemplate(file_path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story = []

    story.append(create_banner("SOCIETY OF PETROLEUM ENGINEERS (SPE)", "TECHNICAL PAPER: DRILLING HAZARD MITIGATION IN UPPER ASSAM SHELF", "SPE-IN-2023-8891"))
    story.append(Spacer(1, 10))

    story.append(Paragraph("ABSTRACT & FORMATION DRILLING WINDOWS", heading2_style))
    story.append(Paragraph(
        "This paper integrates wireline log signatures (GR, RHOB, DTC) and historical offset well data across 45 wells to construct a predictive geomechanical model.",
        body_style
    ))

    table_data = [
        ["Formation Name", "Depth Interval", "Pore Pressure (EMW)", "Fracture Gradient", "Primary Drilling Hazard"],
        ["Tipam Sandstone", "0 - 800 m", "1.02 - 1.08 g/cc", "1.65 g/cc", "Washout, high permeability"],
        ["Girujan Clay", "800 - 1,500 m", "1.10 - 1.15 g/cc", "1.72 g/cc", "Clay swelling, tight hole"],
        ["Barail Group", "1,800 - 2,500 m", "1.18 - 1.25 g/cc", "1.80 g/cc", "🚨 Reactive Shale / Stuck Pipe"],
        ["Kopili Formation", "2,500 - 3,200 m", "1.28 - 1.38 g/cc", "1.88 g/cc", "🚨 Overpressure Kick / Influx"],
        ["Sylhet Limestone", "3,000 - 3,500 m", "1.15 - 1.22 g/cc", "1.52 g/cc", "🚨 Fractured Lost Circulation"]
    ]
    t = Table(table_data, colWidths=[90, 85, 95, 85, 165])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f2b48")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#b0bec5")),
        ('PADDING', (0,0), (-1,-1), 4),
        ('FONTSIZE', (0,0), (-1,-1), 8),
    ]))
    story.append(t)
    doc.build(story)

def copy_to_target_dirs():
    targets = [
        os.path.join(root_dir, "data", "raw", "documents", "incident_reports"),
        os.path.join(root_dir, "data", "raw", "documents", "wcr"),
        os.path.join(root_dir, "data", "raw", "documents", "ddr"),
        os.path.join(root_dir, "data", "raw", "documents", "other_reports"),
        os.path.join(root_dir, "data", "raw", "research", "drilling_research_papers"),
        os.path.join(root_dir, "data", "synthetic", "documents")
    ]
    for t in targets:
        os.makedirs(t, exist_ok=True)

    file_mapping = {
        "01_DUL92_Stuck_Pipe_Complete.pdf": os.path.join(root_dir, "data", "raw", "documents", "incident_reports", "01_DUL92_Stuck_Pipe_Complete.pdf"),
        "02_DUL88_Gas_Kick_Complete.pdf": os.path.join(root_dir, "data", "raw", "documents", "incident_reports", "02_DUL88_Gas_Kick_Complete.pdf"),
        "03_DUL99_Lost_Circulation_Complete.pdf": os.path.join(root_dir, "data", "raw", "documents", "incident_reports", "03_DUL99_Lost_Circulation_Complete.pdf"),
        "04_DUL104_Current_Drilling_Complete.pdf": os.path.join(root_dir, "data", "raw", "documents", "ddr", "04_DUL104_Current_Drilling_Complete.pdf"),
        "WCR_OIL_DUL92_Barail_Stuck_Pipe_Report.pdf": os.path.join(root_dir, "data", "raw", "documents", "wcr", "WCR_OIL_DUL92_Barail_Stuck_Pipe_Report.pdf"),
        "WCR_OIL_DUL88_Kopili_Gas_Kick_Report.pdf": os.path.join(root_dir, "data", "raw", "documents", "wcr", "WCR_OIL_DUL88_Kopili_Gas_Kick_Report.pdf"),
        "WCR_OIL_DUL99_Sylhet_Lost_Circulation_Report.pdf": os.path.join(root_dir, "data", "raw", "documents", "wcr", "WCR_OIL_DUL99_Sylhet_Lost_Circulation_Report.pdf"),
        "DDR_OIL_DUL104_Barail_Section_Daily_Report.pdf": os.path.join(root_dir, "data", "raw", "documents", "ddr", "DDR_OIL_DUL104_Barail_Section_Daily_Report.pdf"),
        "OIL_Assam_Basin_Field_Overview_Report.pdf": os.path.join(root_dir, "data", "raw", "documents", "other_reports", "OIL_Assam_Basin_Field_Overview_Report.pdf"),
        "Assam_Basin_Geology_NWIS_Context.pdf": os.path.join(root_dir, "data", "raw", "research", "drilling_research_papers", "Assam_Basin_Geology_NWIS_Context.pdf"),
        "SPE_Assam_Basin_Drilling_Hazards_Paper.pdf": os.path.join(root_dir, "data", "raw", "research", "drilling_research_papers", "SPE_Assam_Basin_Drilling_Hazards_Paper.pdf"),
    }

    for src_name, dst_path in file_mapping.items():
        src_path = os.path.join(pdf_dir, src_name)
        if os.path.exists(src_path):
            shutil.copy(src_path, dst_path)
            shutil.copy(src_path, os.path.join(root_dir, "data", "synthetic", "documents", src_name))
            print(f"Copied {src_name} -> {dst_path}")

if __name__ == "__main__":
    generate_dul92_report1()
    generate_dul92_report2()
    generate_dul88_report1()
    generate_dul88_report2()
    generate_dul99_report1()
    generate_dul99_report2()
    generate_dul104_report1()
    generate_dul104_report2()
    generate_field_overview_pdf()
    generate_geology_nwis_pdf()
    generate_spe_paper_pdf()
    copy_to_target_dirs()
    print("ALL 11 PDF Technical Reports generated and synchronized successfully!")
