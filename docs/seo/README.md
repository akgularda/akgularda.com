# Google Search maintenance

Search Console property: `sc-domain:arda-akgul.com`. Ownership is verified through the public DNS TXT record; keep that record in place.

## Discovery and indexing

- Submit `https://arda-akgul.com/sitemap.xml` in Search Console. It includes only canonical HTML pages eligible for indexing. Empty writing sections become indexable automatically when articles are added.
- Use URL Inspection for the homepage and materially changed pages after deployment. Google decides whether and when to index a URL; repeating requests does not speed this up.
- RSS, Markdown, and machine-readable context files are not landing pages. A "Crawled - currently not indexed" status for these is not evidence that the main site is blocked.
- IndexNow and feed pings do not submit pages to Google. Google no longer supports its old sitemap ping endpoint.
- Update `lastmod` when the main content, important links, or structured data change. Archive dates also reflect the newest included article. Never substitute the build time.
- Keep Turkish article `contentlang: tr` metadata accurate. Do not declare translated alternates unless a real corresponding translation exists.
