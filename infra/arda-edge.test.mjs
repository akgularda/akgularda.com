import assert from 'node:assert/strict';
import test from 'node:test';
import worker from './arda-edge.mjs';

test('API preserves request, authorization and tunnel Host while Pages uses normal origin', async t => {
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (request, options) => {
    requests.push({ request, options });
    return Response.json({ ok: true });
  });
  const request = new Request('https://arda-akgul.com/econ/api/rooms/ABC234/teams', {
    method: 'POST', headers: { Authorization: 'Bearer test', 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'QA' }),
  });
  const response = await worker.fetch(request);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(requests[0].request, request);
  assert.equal(requests[0].options.cf.resolveOverride, 'econ-origin.arda-akgul.com');
  assert.deepEqual(await requests[0].request.json(), { name: 'QA' });
  await worker.fetch(new Request('https://arda-akgul.com/econ/'));
  assert.equal(requests[1].options, undefined);
});

test('offline tunnel returns a readable uncached API response', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response('tunnel offline', { status: 530 }));
  const response = await worker.fetch(new Request('https://arda-akgul.com/econ/api/rooms'));
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.match((await response.json()).error, /çevrimdışı/);
});

test('main site Markdown and discovery headers continue to work', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response('<h1>Arda</h1><p>Hello</p>', {
    headers: { 'Content-Type': 'text/html' },
  }));
  const response = await worker.fetch(new Request('https://arda-akgul.com/', {
    headers: { Accept: 'text/markdown' },
  }));
  assert.match(await response.text(), /# Arda/);
  assert.match(response.headers.get('link'), /api-catalog/);
});
