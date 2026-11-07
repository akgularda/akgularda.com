import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import worker from '../infra/arda-edge.mjs';

// Use Hugo's actual minified HTML: href attributes may be unquoted.
const html = await readFile(new URL('../public/publications/index.html', import.meta.url), 'utf8');
const originalFetch = globalThis.fetch;
globalThis.fetch = async () => new Response(html, { headers: { 'Content-Type': 'text/html' } });
try {
  const res = await worker.fetch(new Request('https://arda-akgul.com/publications/', {
    headers: { Accept: 'text/markdown' },
  }));
  const text = await res.text();
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/markdown/);
  assert.match(text, /# Publications\b/);
  assert.ok(text.includes('sTAM Sustainability Agenda Q2 2026'));
  assert.ok(text.includes('](https://strc.tedu.edu.tr/stam-bulten)'));
  assert.ok(!res.headers.get('Link').includes('oauth-protected-resource'));
  console.log('Edge source checks passed: minified HTML retains page title and publication links.');
} finally {
  globalThis.fetch = originalFetch;
}
