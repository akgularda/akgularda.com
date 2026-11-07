"""Check identity, project credits, FAQ parity, and optional public crawler access.

--live checks use declared user agents from this machine. They do not prove access
from a provider's actual IP ranges, indexing, ranking, or AI citations.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
import json
from pathlib import Path
from urllib.parse import urljoin
from urllib.request import Request, urlopen
from urllib.robotparser import RobotFileParser

REPO = Path(__file__).resolve().parents[1]
ROOT = REPO / 'public'
ORIGIN = 'https://arda-akgul.com'
BOTS = ('Googlebot', 'bingbot', 'OAI-SearchBot', 'ChatGPT-User',
        'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'DuckAssistBot')

class Document(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.schemas, self.words = [], []
        self.in_json = False
        self.buffer = ''
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        if tag == 'script' and dict(attrs).get('type') == 'application/ld+json':
            self.in_json, self.buffer = True, ''
    def handle_data(self, data):
        if self.in_json:
            self.buffer += data
        else:
            self.words.append(data)
    def handle_endtag(self, tag):
        if tag == 'script' and self.in_json:
            self.schemas.append(json.loads(self.buffer))
            self.in_json = False

def document(route):
    return Document((ROOT / route / 'index.html').read_text(encoding='utf-8'))

def of_type(doc, kind):
    return next(s for s in doc.schemas if s.get('@type') == kind)

profile = of_type(document('about'), 'Person')
assert profile['name'] == 'Arda Akgül'
assert profile['alternateName'] == 'Arda Akgul'
assert 'https://github.com/akgularda' in profile['sameAs']
projects = json.loads((REPO / 'data/projects.json').read_text(encoding='utf-8'))['items']
listing = of_type(document('projects'), 'ItemList')
assert listing['numberOfItems'] == len(projects)
works = {i['item']['name']: i['item'] for i in listing['itemListElement']}
for p in projects:
    w = works[p['title']]
    assert w['url'] == urljoin(ORIGIN, p['url'])
    assert w['creditText'] == p['role'] + ': Arda Akgül'
    assert w['subjectOf']['url'] == p['source_url']
    assert w['description'] == p['description']
    prop = 'creator' if p['role'] == 'Creator & developer' else 'editor' if p['role'] == 'Co-editor' else 'contributor'
    if prop == 'contributor':
        assert 'creator' not in w and 'editor' not in w, 'Contribution presented as ownership'
        assert w[prop]['roleName'] == p['role']
        person = w[prop]['contributor']
    else:
        person = w[prop]
    assert person['@id'] == profile['@id']
    if p['url'].startswith('/'):
        detail = of_type(document(p['url'].strip('/')), 'CreativeWork')
        assert detail['@id'] == w['@id'] and detail['creditText'] == w['creditText']
faq_doc = document('faq')
faq_schema = of_type(faq_doc, 'FAQPage')
faq_md = (ROOT / 'faq/index.md').read_text(encoding='utf-8')
corpus = (ROOT / 'llms-full.txt').read_text(encoding='utf-8')
visible = ' '.join(' '.join(faq_doc.words).split())
for q in faq_schema['mainEntity']:
    for value in (q['name'], q['acceptedAnswer']['text']):
        assert ' '.join(value.split()) in visible, 'FAQ schema differs from visible answer'
        assert value in faq_md and value in corpus, 'FAQ answer missing from text exports'
for route in ('about', 'faq', 'projects', 'experience', 'cv', 'music'):
    text = (ROOT / route / 'index.md').read_text(encoding='utf-8')
    assert 'Author: Arda Akgül' in text
    assert 'Source: ' + ORIGIN + '/' + route + '/' in text
robots = RobotFileParser()
robots.parse((ROOT / 'robots.txt').read_text(encoding='utf-8').splitlines())
for bot in BOTS:
    assert robots.can_fetch(bot, ORIGIN + '/about/'), bot + ' blocked by robots.txt'
print(f'GEO checks passed: {len(projects)} project credits, {len(faq_schema["mainEntity"])} matching FAQ answers, identity and text provenance, {len(BOTS)} allowed search/retrieval agents.')

parser = argparse.ArgumentParser()
parser.add_argument('--live', action='store_true')
args = parser.parse_args()
if args.live:
    def fetch(bot):
        req = Request(ORIGIN + '/about/', headers={'User-Agent': bot, 'Accept': 'text/html'})
        with urlopen(req, timeout=30) as response:
            body = response.read().decode('utf-8')
            assert response.status == 200
            person = of_type(Document(body), 'Person')
            assert person['@id'] == profile['@id']
            assert 'noindex' not in response.headers.get('X-Robots-Tag', '').lower()
            return {'agent': bot, 'status': response.status}
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(fetch, BOTS))
    print(json.dumps({'live_declared_user_agent_checks': results, 'limit': 'Requests originate from this machine, not verified provider IPs; no indexing or citation guarantee.'}, ensure_ascii=False))
