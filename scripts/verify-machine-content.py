"""Check public text exports retain publication records, citations, and usable links."""
import json
import re
from pathlib import Path
from urllib.parse import unquote, urlsplit

REPO = Path(__file__).resolve().parents[1]
ROOT = REPO / 'public'
ORIGIN = 'https://arda-akgul.com'
corpus = (ROOT / 'llms-full.txt').read_text(encoding='utf-8')
publications = (ROOT / 'publications/index.md').read_text(encoding='utf-8')
records = json.loads((REPO / 'data/publications.json').read_text(encoding='utf-8'))
for record in records:
    for text in (publications, corpus):
        assert record['title'] in text, 'Publication missing from text export: ' + record['title']
        for link in record.get('links', []):
            assert link['url'] in text, 'Publication citation missing: ' + link['url']
for route in ('about', 'publications', 'experience', 'projects', 'cv', 'contact'):
    text = (ROOT / route / 'index.md').read_text(encoding='utf-8')
    assert 'Source: ' + ORIGIN + '/' + route + '/' in text
    assert not re.search(r'<(?:h[1-6]|p|div|section|article)\b', text), 'HTML leaked into Markdown: ' + route
    assert '{{<' not in text and '{{%' not in text, 'Unexpanded shortcode: ' + route
assert '\n## Education\n' in (ROOT / 'about/index.md').read_text(encoding='utf-8')
assert 'Selected current roles' in (ROOT / 'cv/index.md').read_text(encoding='utf-8')
index = (ROOT / 'llms.txt').read_text(encoding='utf-8')
assert index == (ROOT / '.well-known/llms.txt').read_text(encoding='utf-8'), 'Discovery indexes differ'
for url in re.findall(r'https://arda-akgul\.com/[^\s)]+', index):
    route = unquote(urlsplit(url).path).lstrip('/')
    target = ROOT / route
    if not target.suffix:
        target = target / 'index.html'
    assert target.is_file(), 'Broken discovery link: ' + url
catalogue = json.loads((REPO / 'data/projects.json').read_text(encoding='utf-8'))['items']
project_export = (ROOT / 'projects/index.md').read_text(encoding='utf-8')
for project in catalogue:
    for text in (project_export, corpus):
        assert project['title'] in text, 'Project missing from text export: ' + project['title']
        assert project['url'] in text, 'Project link missing from text export: ' + project['url']
feed = json.loads((ROOT / 'index.json').read_text(encoding='utf-8'))
assert feed['items'], 'Empty JSON Feed'
assert len({item['id'] for item in feed['items']}) == len(feed['items']), 'Duplicate feed entries'
for item in feed['items']:
    assert item['title'] and item['content_text'].strip(), 'Empty feed entry'
    route = unquote(urlsplit(item['url']).path).lstrip('/')
    assert (ROOT / route / 'index.html').is_file(), 'Broken JSON Feed URL'
print(f'Machine content checks passed: {len(records)} publication records and citations, {len(feed["items"])} feed items, Markdown exports and discovery links.')
