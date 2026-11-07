"""Validate canonical, indexability, and structured-data consistency in a Hugo build."""
from datetime import datetime, timezone
from html.parser import HTMLParser
import json
from pathlib import Path
from urllib.parse import urlsplit, unquote
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1] / 'public'
ORIGIN = 'https://arda-akgul.com'
class Page(HTMLParser):
    def __init__(self, file):
        super().__init__()
        self.meta, self.links, self.schemas = {}, {}, []
        self.lang, self.title = '', ''
        self.in_title = self.in_json = False
        self.buffer = ''
        self.feed(file.read_text(encoding='utf-8'))
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'html': self.lang = a.get('lang', '')
        if tag == 'meta': self.meta[a.get('name', a.get('http-equiv', ''))] = a.get('content', '')
        if tag == 'link': self.links[a.get('rel')] = a.get('href', '')
        if tag == 'title': self.in_title = True
        if tag == 'script' and a.get('type') == 'application/ld+json': self.in_json, self.buffer = True, ''
    def handle_data(self, data):
        if self.in_title: self.title += data
        if self.in_json: self.buffer += data
    def handle_endtag(self, tag):
        if tag == 'title': self.in_title = False
        if tag == 'script' and self.in_json:
            self.schemas.append(json.loads(self.buffer))
            self.in_json = False

def page_at(url):
    p = ROOT / unquote(urlsplit(url).path).lstrip('/')
    return Page(p / 'index.html' if not p.suffix else p)

errors = []
def check(condition, message):
    if not condition: errors.append(message)

urls = []
for node in ET.parse(ROOT / 'sitemap.xml').getroot():
    values = {n.tag.split('}')[-1]: n.text for n in node}
    url = values['loc']
    urls.append(url)
    check(url.startswith(ORIGIN + '/'), 'Wrong sitemap host: ' + url)
    p = page_at(url)
    check('noindex' not in p.meta.get('robots', ''), 'Noindex URL in sitemap: ' + url)
    check(p.links.get('canonical') == url, 'Canonical mismatch: ' + url)
    check(bool(p.meta.get('description', '').strip()), 'Missing description: ' + url)
    check(bool(p.title.strip()), 'Missing title: ' + url)
    check(p.title.count('Arda Akgül') <= 1, 'Repeated brand in title: ' + url)
    if 'lastmod' in values:
        stamp = datetime.fromisoformat(values['lastmod'].replace('Z', '+00:00'))
        check(stamp <= datetime.now(timezone.utc), 'Future lastmod: ' + url)
    for s in p.schemas:
        if s.get('@type') in ('BlogPosting', 'Article', 'ProfilePage', 'WebPage', 'ContactPage', 'CollectionPage'):
            check(s.get('inLanguage') == p.lang, 'Language mismatch: ' + url)
        if s.get('@type') == 'FAQPage':
            check(url == ORIGIN + '/faq/', 'Hidden FAQ schema: ' + url)
        if s.get('@type') == 'Person':
            check('alumniOf' not in s and 'award' not in s, 'Unsupported education/award claim: ' + url)
check(len(urls) == len(set(urls)), 'Duplicate sitemap URLs')
check(ORIGIN + '/' in urls and ORIGIN + '/about/' in urls, 'Identity pages missing from sitemap')
for route in ('/blogs/sustainability/', '/blogs/mathematics/', '/blogs/economics/microeconomics/'):
    check(ORIGIN + route not in urls, 'Empty archive in sitemap: ' + route)
    check('noindex' in page_at(ORIGIN + route).meta.get('robots', ''), 'Empty archive is indexable: ' + route)
check('noindex' in Page(ROOT / '404.html').meta.get('robots', ''), '404 template should be noindex')
check('noindex' not in page_at(ORIGIN + '/blogs/economics/').meta.get('robots', ''), 'Populated archive lost indexing')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'Search SEO checks passed: {len(urls)} sitemap URLs, canonical/robots consistency, language and JSON-LD checks.')
