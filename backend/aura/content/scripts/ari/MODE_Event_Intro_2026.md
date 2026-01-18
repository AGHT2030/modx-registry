# This script generates a premium MODE Event Access Packet as multiple PDFs:
# 1) Client Packet
# 2) Vendor One-Pager (WrapUp)
# 3) QR Labels (print-ready)
#
# Uses reportlab.platypus as required.

from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors
from reportlab.lib.units import inch
import os

base_path = "/mnt/data"

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="TitleCenter", fontSize=22, alignment=TA_CENTER, spaceAfter=20))
styles.add(ParagraphStyle(name="SectionHeader", fontSize=14, spaceBefore=16, spaceAfter=8, textColor=colors.HexColor("#0B3C5D")))
styles.add(ParagraphStyle(name="Body", fontSize=10, spaceAfter=8))
styles.add(ParagraphStyle(name="Small", fontSize=9, spaceAfter=6, textColor=colors.grey))

def build_pdf(filename, story):
    doc = SimpleDocTemplate(
        os.path.join(base_path, filename),
        pagesize=LETTER,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    doc.build(story)

# -------------------------------------------------
# 1) CLIENT PACKET
# -------------------------------------------------
client_story = []

client_story.append(Paragraph("MODE™ Event Access Packet — Client Edition", styles["TitleCenter"]))
client_story.append(Paragraph("Alexa’s Quinceañera • 2026", styles["Body"]))
client_story.append(Paragraph("Powered by MODE™ by CoinPurse<br/>© 2026 AGH Trust", styles["Small"]))

client_story.append(Spacer(1, 12))
client_story.append(Paragraph("What MODE Is", styles["SectionHeader"]))
client_story.append(Paragraph(
    "MODE is a real-time event coordination platform that replaces paper schedules, group texts, "
    "and day-of confusion. It uses AI Twins (Ari & Agador), live schedules, venue navigation (PULSE), "
    "and automated notifications to keep everyone aligned.", styles["Body"]
))

client_story.append(Paragraph("Activation Timeline", styles["SectionHeader"]))
client_story.append(Paragraph(
    "<b>Vendors & Staff:</b> Access activates 2 weeks before the event via WrapUp™ for load-in, setup, and compliance.<br/>"
    "<b>Guests:</b> Access activates on the day of the event via QR scan — no pre-download required.",
    styles["Body"]
))

client_story.append(Paragraph("Who Gets Access", styles["SectionHeader"]))
table = Table([
    ["Audience", "What They See", "What They Don’t See"],
    ["Guests", "Welcome, schedule highlights, venue map, live updates", "Vendor logistics, private details"],
    ["Vendors", "Setup location, timing, alerts, AI assistance", "Other vendors’ info"],
    ["Planner", "Full run-of-show, voice control, overrides", "—"],
    ["Family / Safety", "Emergency alerts, exits, escalation tools", "Public views"]
], colWidths=[1.3*inch, 2.6*inch, 2.6*inch])

table.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), colors.lightgrey),
    ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
    ("FONT", (0,0), (-1,0), "Helvetica-Bold")
]))
client_story.append(table)

client_story.append(PageBreak())

client_story.append(Paragraph("Day-of Experience", styles["SectionHeader"]))
client_story.append(Paragraph(
    "If schedules shift or delays occur, MODE automatically notifies guests politely, updates vendors instantly, "
    "and allows the coordinator or AI Twins to rebalance the timeline without disruption.", styles["Body"]
))

client_story.append(Paragraph("Why Clients Love MODE", styles["SectionHeader"]))
client_story.append(Paragraph(
    "• Fewer calls & texts<br/>• Happier vendors<br/>• Guests feel informed<br/>• Professional, modern experience",
    styles["Body"]
))

build_pdf("MODE_Client_Packet_2026.pdf", client_story)

# -------------------------------------------------
# 2) VENDOR ONE-PAGER
# -------------------------------------------------
vendor_story = []

vendor_story.append(Paragraph("MODE™ Vendor Access — WrapUp™", styles["TitleCenter"]))
vendor_story.append(Paragraph("Event: Alexa’s Quinceañera • 2026", styles["Body"]))

vendor_story.append(Paragraph("What You Get", styles["SectionHeader"]))
vendor_story.append(Paragraph(
    "• Your exact setup location via venue map<br/>"
    "• Load-in & teardown timing<br/>"
    "• Real-time schedule updates<br/>"
    "• AI Twin assistance if coordinator is unavailable<br/>"
    "• Insurance & compliance references",
    styles["Body"]
))

vendor_story.append(Paragraph("When Access Opens", styles["SectionHeader"]))
vendor_story.append(Paragraph(
    "WrapUp™ activates <b>2 weeks before the event</b>. "
    "Scan your QR code to access instructions — no app install required.",
    styles["Body"]
))

vendor_story.append(Paragraph("On Event Day", styles["SectionHeader"]))
vendor_story.append(Paragraph(
    "If changes occur, MODE will notify you instantly. "
    "PULSE navigation guides you to the correct location even if staff are unavailable.",
    styles["Body"]
))

build_pdf("MODE_Vendor_WrapUp_OnePager_2026.pdf", vendor_story)

# -------------------------------------------------
# 3) QR LABELS (PRINT)
# -------------------------------------------------
qr_story = []

qr_story.append(Paragraph("MODE™ Event QR Labels", styles["TitleCenter"]))
qr_story.append(Paragraph("Print & place on signage, badges, or vendor packets", styles["Body"]))

labels = [
    ["Guest Access QR", "Event welcome, schedule & updates"],
    ["Vendor WrapUp QR", "Setup, maps, timing & AI support"],
    ["Planner Control QR", "Full control & voice commands"],
    ["Safety / Family QR", "Emergency & escalation access"]
]

qr_table = Table([["Label", "Purpose"]] + labels, colWidths=[2.5*inch, 3.5*inch])
qr_table.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), colors.lightgrey),
    ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
    ("FONT", (0,0), (-1,0), "Helvetica-Bold")
]))

qr_story.append(qr_table)
qr_story.append(Spacer(1, 12))
qr_story.append(Paragraph(
    "QR codes are event-specific and role-locked. Distribution is approved by the client.",
    styles["Small"]
))

build_pdf("MODE_QR_Labels_Print_2026.pdf", qr_story)

base_path
