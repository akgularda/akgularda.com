"""Regenerate the public CV from data/cv.json. Requires reportlab."""
import json
import os
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'data/cv.json').read_text(encoding='utf-8'))
font_dir = Path(os.environ.get('WINDIR', 'C:/Windows')) / 'Fonts'
if (font_dir / 'arial.ttf').exists():
    regular, bold = font_dir / 'arial.ttf', font_dir / 'arialbd.ttf'
else:
    regular = Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
    bold = Path('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')
pdfmetrics.registerFont(TTFont('CV', str(regular)))
pdfmetrics.registerFont(TTFont('CV-Bold', str(bold)))
out = ROOT / 'static/downloads/arda-akgul-cv.pdf'
out.parent.mkdir(parents=True, exist_ok=True)
c = canvas.Canvas(str(out), pagesize=(595.28, 841.89))
c.setTitle('Arda Akgül - Curriculum Vitae')
c.setAuthor('Arda Akgül')
INK, MUTED, BLUE = '#182b3b', '#546372', '#204f79'
y = 790

def para(text, size=9, leading=13, color=INK, bold=False, gap=5):
    global y
    style = ParagraphStyle('cv', fontName='CV-Bold' if bold else 'CV', fontSize=size, leading=leading, textColor=HexColor(color))
    p = Paragraph(text, style)
    _, h = p.wrap(491, 750)
    p.drawOn(c, 52, y-h)
    y -= h + gap

def text(value):
    return escape(value)

def section(title):
    global y
    y -= 12
    c.setStrokeColor(HexColor('#dce2e9'))
    c.line(52, y, 543, y)
    y -= 17
    para(title, size=12, leading=15, color=BLUE, bold=True, gap=10)

def footer(page):
    c.setFont('CV', 8)
    c.setFillColor(HexColor(MUTED))
    c.drawString(52, 32, 'arda-akgul.com  |  Updated ' + data['updated'])
    c.drawRightString(543, 32, str(page) + ' / 2')

para(text(data['name']), size=29, leading=34, bold=True, gap=8)
para('Economics, research, and technology in public life', size=11, leading=16, color=BLUE, gap=8)
para(text(data['location']) + '  |  <link href="mailto:' + data['email'] + '">' + data['email'] + '</link>', color=MUTED)
para('<link href="https://arda-akgul.com/">arda-akgul.com</link>  |  <link href="https://www.linkedin.com/in/ardakgul">linkedin.com/in/ardakgul</link>  |  <link href="https://github.com/akgularda">github.com/akgularda</link>', color=BLUE, gap=12)
para(text(data['bio']), size=9.5, leading=14)
section('Education')
for e in data['education']:
    para(text(e['degree']) + ' | ' + text(e['institution']), bold=True)
    para(text(e['dates']), color=MUTED, gap=4)
    if e['detail']: para(text(e['detail']), gap=8)
section('Research and leadership')
for r in data['roles'][:3]:
    para(text(r['institution']), bold=True)
    para(text(r['role']) + ' | ' + text(r['dates']), color=BLUE, gap=3)
    para(text(r['detail']), gap=10)
footer(1)
c.showPage()
y = 790
para('Arda Akgül', size=18, leading=23, bold=True)
para('Curriculum Vitae | continued', color=MUTED)
section('Technology and student media')
for r in data['roles'][3:]:
    para(text(r['institution']), bold=True)
    para(text(r['role']) + (' | ' + text(r['dates']) if r['dates'] else ''), color=BLUE, gap=3)
    para(text(r['detail']), gap=9)
section('Selected previous experience')
for r in data['previous']:
    para(text(r['institution']) + ' - ' + text(r['role']), bold=True, gap=2)
    para(text(r['dates']), color=MUTED, gap=7)
section('Technical toolkit')
for s in data['skills']:
    para('<b>' + text(s['title']) + ':</b> ' + text(s['detail']), gap=6)
section('Selected certifications')
para(' | '.join(text(s) for s in data['certifications']), gap=8)
para('Full publication record: <link href="https://arda-akgul.com/publications/">arda-akgul.com/publications/</link>', color=BLUE)
footer(2)
c.save()
print(out)
