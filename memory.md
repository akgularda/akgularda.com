# memory.md — arda-akgul.com (akgularda.com repo)

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
