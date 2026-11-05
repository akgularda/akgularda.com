const LINK = '</.well-known/api-catalog>; rel="api-catalog", </openapi.yaml>; rel="service-desc", </about/>; rel="service-doc", </llms.txt>; rel="describedby", <https://arda-akgul.com/.well-known/oauth-protected-resource>; rel="oauth-protected-resource"';

function htmlToMd(html) {
  let s = html;
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, '');
  s = s.replace(/<nav[\s\S]*?<\/nav>/gi, '');
  s = s.replace(/<header[\s\S]*?<\/header>/gi, '');
  s = s.replace(/<footer[\s\S]*?<\/footer>/gi, '');
  s = s.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, n, t) =>
    '\n' + '#'.repeat(Number(n)) + ' ' + t.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() + '\n\n');
  s = s.replace(/<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, txt) => {
    const t = txt.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    return t ? `[${t}](${href})` : '';
  });
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) =>
    '- ' + t.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() + '\n');
  s = s.replace(/<(blockquote|pre)[^>]*>/gi, '\n> ');
  s = s.replace(/<\/(blockquote|pre)>/gi, '\n');
  s = s.replace(/<img\s[^>]*alt="([^"]*)"[^>]*>/gi, '![$1](image)');
  s = s.replace(/<(p|div|section|article|br\s*\/?|tr)[^>]*>/gi, '\n');
  s = s.replace(/<\/(p|div|section|article|tr)>/gi, '\n');
  s = s.replace(/<[^>]+>/g, '');
  s = s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&rsquo;|&lsquo;/g, "'").replace(/&nbsp;/g, ' ');
  s = s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return s + '\n';
}

const JSON_WELL_KNOWN = new Set([
  '/.well-known/api-catalog',
  '/.well-known/oauth-protected-resource',
  '/.well-known/oauth-authorization-server',
  '/.well-known/http-message-signatures-directory',
]);

function offline() {
  return Response.json({ error: 'Sınıf sunucusu şu anda çevrimdışı. Tek kişilik oyunu kullanabilirsin.' },
    { status: 503, headers: { 'Cache-Control': 'no-store' } });
}

export default {
  async fetch(req) {
    const url = new URL(req.url);
    const api = url.pathname.startsWith('/econ/api/');
    let res;
    try {
      // The DNS override preserves Host, so locally managed tunnel rules continue to match.
      res = api ? await fetch(req, { cf: { resolveOverride: 'econ-origin.arda-akgul.com' } }) : await fetch(req);
    } catch {
      return api ? offline() : new Response('origin unreachable', { status: 502 });
    }
    if (api) {
      if (res.status >= 500) return offline();
      const headers = new Headers(res.headers);
      headers.set('Cache-Control', 'no-store');
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
    }
    const headers = new Headers(res.headers);
    headers.set('Link', LINK);
    const ct = res.headers.get('content-type') || '';
    if (res.status === 200 && (req.headers.get('accept') || '').includes('text/markdown') &&
        ct.includes('text/html')) {
      const md = htmlToMd(await res.text());
      headers.set('Content-Type', 'text/markdown; charset=utf-8');
      headers.set('Vary', 'Accept');
      headers.set('x-markdown-tokens', String(Math.max(1, Math.round(md.length / 4))));
      headers.delete('content-length');
      return new Response(md, { status: 200, headers });
    }
    if (res.status === 200 && ct.includes('octet-stream') && JSON_WELL_KNOWN.has(url.pathname)) {
      headers.set('Content-Type', 'application/json; charset=utf-8');
    }
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  },
};
