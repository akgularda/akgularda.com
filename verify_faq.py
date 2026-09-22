import re, os
# build sonrasi: her sayfada gorunur soru = schema soru mu?
pages = {
  'home': 'public/index.html',
  'about': 'public/about/index.html',
  'experience': 'public/experience/index.html',
  'publications': 'public/publications/index.html',
  'contact': 'public/contact/index.html',
  'blogs': 'public/blogs/index.html',
  'faq': 'public/faq/index.html',
}
for name, path in pages.items():
    t = open(path, encoding='utf-8').read()
    body = re.sub(r'<script[^>]*>.*?</script>', '', t, flags=re.S)
    schema_qs = re.findall(r'"@type":\s*"Question"', t)
    # gorunur dt sayisi
    vis_dt = body.count('<dt>')
    # faq.md tekrar riski: partial da cikti mi?
    faq_dup = body.count('Frequently asked questions')
    print('%-14s schema_Q=%d gorunur_dt=%d faq_baslik=%d %s' % (
        name, len(schema_qs), vis_dt, faq_dup,
        'OK' if (len(schema_qs) == 0 or vis_dt == len(schema_qs)) and faq_dup <= 1 else 'UYUSMAZLIK'))