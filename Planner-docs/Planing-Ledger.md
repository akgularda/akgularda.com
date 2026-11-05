# Publication ledger

## 2026-11-05 Lisbon

- Read the complete source DOCX and inspected its 26 embedded images.
- Matched the site's English first-person essay style and retained the personal closing.
- Published 18 document images and three people-free album photographs with local URLs,
  captions, alt text and lazy loading. Omitted incidental laptop/work material.
- The three new album images use WebP at 1600px maximum, without cropping. The final couple
  PNG is copied verbatim from the DOCX and remains the article's final image.
- Source checks covered tourism statistics, the Commission report, fuel protests, UNESCO,
  the IMF programme and the Gulbenkian programme. Belém is not assigned an uncertain day.
- Hugo build and identity/SEO checks passed. All 21 article images exist, have alt text and
  loaded in browser review. The final PNG matches the embedded DOCX bytes exactly.
- Explicit dimensions reserve image space; `height: auto` in prose styles preserves aspect
  ratios at a 390px mobile viewport. No horizontal overflow was observed.
- The legacy blog-import check fails on 12 pre-existing articles because it rejects any
  `/images/blogs/` string, including existing valid OG paths. Confirmed the same pattern in
  HEAD and the referenced sample file on disk. No unrelated script changes were made.
