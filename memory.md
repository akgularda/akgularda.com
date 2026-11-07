# memory.md — arda-akgul.com (akgularda.com repo)

## Lisbon publication 2026-11-05
- Current publication checkout is `C:\Users\akgul\Downloads\arda-akgul-pages-migration`.
- Lisbon travel essay lives in `content/blogs/culture/lisbon-economics-everyday-life.md`.
- Images live in `static/images/blogs/lisbon/`. The last couple PNG must remain byte-identical
  to `word/media/image26.png` in the supplied DOCX. Do not crop or re-encode it.
- Three album architectural images are WebP derivatives, without people or cropping.
- User explicitly requested public blog publication on arda-akgul.com, including photographs.

## Project
- Hugo personal site for Arda Akgül, live at https://arda-akgul.com (GitHub Pages, `hugo --baseURL https://arda-akgul.com/ --minify`).
- Working copy: `C:\Users\akgul\AppData\Local\Temp\opencode\akgularda.com`, branch `master`.
- Old domain `akgularda.com` is NXDOMAIN; only allowed occurrence in served files: `static/humans.txt` GitHub repo URL. GitHub username `akgularda` is fine.

## Stack / commands
- Build: `hugo --minify` (local Hugo 0.154 — CI is 0.166; **CI stricter on undefined template vars**, local may pass what CI fails).
- Verify: `powershell -ExecutionPolicy Bypass -File scripts\verify-identity-seo.ps1` (must be green before push).
- IndexNow: `scripts\submit_indexnow.ps1` (key file `static/149e6aa80447477daf5e34771966db2c.txt`); feeds: `scripts\ping_feeds.ps1`.
- Commit: `-c user.name=opencode -c user.email=opencode@localhost`. Workflow: branch → verify → push → PR → merge (user approves) → `gh run watch` → live checks.

## AI/GEO state (done)
- robots allows GPTBot/ClaudeBot/PerplexityBot/etc (`layouts/robots.txt`).
- `llms.txt` (+.well-known copy, keep in sync), `llms-full.txt` (template `layouts/index.llmsfull.txt` — variable `$pubEssays`), `ai.txt`, `agents.txt`, `.well-known/agent.json`, `openapi.yaml`, `humans.txt`.
- Person JSON-LD sameAs from `hugo.toml` params.social/same_as (LinkedIn, GitHub, Medium, X).
- Footer: machine-readable nav (llms.txt, llms-full.txt, ai.txt, humans.txt) — minify strips quotes in HTML.
- GA4 `G-RY2DML1TZX` + consent banner/GDPR. sitemap, RSS, WebSub, IndexNow.
-6 site essays at `content/publications/*.md` (author voice: I think / For me / That is why / the real / interesting), listed under Publications "Site Essays"; Article JSON-LD; verify script guards essays/robots/llms-full.

## Pending (user-owned)
- GSC + Bing WMT verification & sitemap submit (need token/HTML file).
- llms.txt directory forms (Cloudflare Turnstile — browser): directory.llmstxt.cloud/submit, llmstxt.site/submit, llmstxtdirectory.org; values: name "Arda Akgül", url https://arda-akgul.com, category Websites, email ardakgul4@gmail.com, social github/akgularda.
- LinkedIn/GitHub bio site link; RadioTEDU WP Application Password; external backlinks (ERUMAG/UDIAD/TEDU author pages).

## Gotchas
- PowerShell: `gh pr edit --body` multi-word args break; `$var` interpolates inside double-quoted commit messages (escaped once, message came out without name).
- HTML minify removes attribute quotes — live grep must use `href=/llms.txt` not `href="/llms.txt"`.
- Subagents free-tier blocked; user speaks Turkish, site content English.

## Search copy and machine content audit 2026-11-07
- Public reading is supported; MCP/A2A/OAuth service claims were unsupported by running endpoints (POST returned 405). Remove those descriptors rather than treating file presence as protocol support.
- Markdown and full corpus exports now render publication shortcodes, retain 43 records and citation links, and include projects, experience, and CV. JSON Feed contains actual writing.
- Run scripts/verify-machine-content.py and node scripts/verify-edge.mjs after Hugo build.
- infra/arda-edge.mjs is Cloudflare Worker source. GitHub Pages deployment does not deploy the Worker. Its Link-header and content-negotiation fixes require a separate Cloudflare deployment; do not report them as live based on a Pages deployment.

## Project portfolio 2026-11-07
- data/projects.json holds 37 project entries: RadioTEDU 8, sTRC research/editorial 2, Monarch Castle 16 (including The Keep), SDCofA 10, and Ekonomi Laboratuvarı 1.
- Ownership/roles were specified by Arda: creator/developer for the listed RadioTEDU and Monarch/SDCofA projects; Contributor for Mobile; Research assistant for Beyond Epicenters; Co-editor for the sTAM bulletin. Agentic Web and MCP are a single project, with both original links retained.
- Keep project descriptions and publication state aligned with original sources. Shared catalogue markup renders in HTML and Markdown/full text exports.
- PR #28 and its separate Cloudflare Worker source were both deployed on 2026-11-07; the observed active Worker version was e6494a23.

## Music and trade artwork 2026-11-07
- Music is a text-only personal collection at /music/: 19 approved pieces across Jazz (9), Classical & Early Music (6), and Lo-Fi (4). Keep song titles and artists as text, without song links or embedded/audio players.
- Midnight Room’s Calm Men Win and Mimi’s Faded Hours’ 3 AM Coding Session were explicitly excluded. The remaining list in data/music.json was approved by Arda.
- Vroom’s The Return to Amsterdam of the Second Expedition to the East Indies (1599), Rijksmuseum SK-A-2858, appears after Selected Work. Preserve its full panoramic composition and attribution. Source/rights are recorded in data/artwork.json; use the responsive Hugo image resources from the museum-sourced original.
- The user explicitly approved implementing and publishing both the Music page and painting in this session.

## GEO consistency 2026-11-07
- FAQ visible answers and FAQPage JSON-LD share content/faq.md front matter via profile-faq shortcode. Keep current vs former roles and project contribution distinctions consistent with About/Experience.
- Project CreativeWork entities and the 37-item catalogue ItemList use data/projects.json. Creator/developer, contributor, research-assistant, and co-editor credits must remain distinct; project-entity.html holds the shared mapping.
- Markdown exports carry author/source/language/date provenance; llms-full.txt includes FAQ and the complete project catalogue.
- scripts/verify-geo.py guards profile identity, project credits, visible/structured FAQ parity, text exports, and robots policy; --live adds declared-user-agent requests from the local machine, not verified provider IPs. These checks do not prove indexing or AI citations.
