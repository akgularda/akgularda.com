# Blog Import Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Import the blog batch from `C:\Users\akgul\Downloads\blogs` into the current Hugo site using the site's existing taxonomy and without shipping broken image references.

**Architecture:** Keep the site's single-file Hugo content pattern, map imported bundle posts into existing top-level sections, create only the two missing subsection folders that the imported themes require, and strip image markdown because the source bundle does not include actual image assets. Add one PowerShell regression script that fails until the expected files exist and contain no `/images/blogs/` references.

**Tech Stack:** Hugo content files, PowerShell verification script

---

### Task 1: Add the failing import verification

**Files:**
- Create: `scripts/verify-blog-import.ps1`

**Step 1: Write the failing test**

Add a PowerShell script that asserts:
- all expected imported markdown files exist at their adapted paths
- new subsection `_index.md` files exist
- imported content files do not contain `https://akgularda.com/images/blogs/...` or `/images/blogs/...`

**Step 2: Run test to verify it fails**

Run: `powershell -ExecutionPolicy Bypass -File .\scripts\verify-blog-import.ps1`
Expected: FAIL with missing imported files

**Step 3: Write minimal implementation**

Use the script as the regression harness for the content import.

**Step 4: Run test to verify it passes**

Run the same command after all content files are added.
Expected: PASS with `Blog import checks passed.`

### Task 2: Add missing subsection indexes

**Files:**
- Create: `content/blogs/business-industry/corporate-strategy/_index.md`
- Create: `content/blogs/tech-computing/digital-infrastructure/_index.md`
- Modify: `content/blogs/economics/game-theory/_index.md`

**Step 1: Write the failing test**

Let Task 1 cover existence and path expectations.

**Step 2: Run test to verify it fails**

Run: `powershell -ExecutionPolicy Bypass -File .\scripts\verify-blog-import.ps1`
Expected: FAIL because subsection indexes do not exist yet

**Step 3: Write minimal implementation**

Create the two new subsection landing pages and update the game theory subsection copy so it no longer describes future-only content.

**Step 4: Run test to verify it passes**

Expected: still FAIL because imported post files are not in place yet

### Task 3: Import business and economics posts

**Files:**
- Create: `content/blogs/business-industry/corporate-strategy/corporate-aesthetic-urban-space.md`
- Create: `content/blogs/business-industry/corporate-strategy/philips-paradox-healthcare-strategy.md`
- Create: `content/blogs/business-industry/corporate-strategy/values-companies-provide-chevron-mcdonalds-apple.md`
- Create: `content/blogs/economics/game-theory/thinking-in-game-theory.md`
- Create: `content/blogs/economics/renaissance-economics.md`
- Create: `content/blogs/economics/trade-industrial-policy/blackrock-erdogan-dolmabahce.md`
- Create: `content/blogs/economics/trade-industrial-policy/future-of-investment-companies.md`
- Create: `content/blogs/economics/trade-industrial-policy/japan-inc.md`
- Create: `content/blogs/economics/trade-industrial-policy/turkiye-varlik-fonu-finansal-gelecek.md`

**Step 1: Write the failing test**

Use Task 1.

**Step 2: Run test to verify it fails**

Expected: FAIL until all files are added.

**Step 3: Write minimal implementation**

Convert each imported `index.md` bundle file into the site's flat markdown file pattern, keep front matter and body text, and remove image blocks that point to missing assets.

**Step 4: Run test to verify it passes**

Expected: still FAIL because tech and guide content is not imported yet

### Task 4: Import technology and guide content

**Files:**
- Create: `content/blogs/tech-computing/digital-infrastructure/annas-archive-spotify-scraping.md`
- Create: `content/blogs/tech-computing/digital-infrastructure/blockchain-problem-of-bitcoin.md`
- Create: `content/blogs/tech-computing/digital-infrastructure/turkcell-huawei-5g-integration.md`
- Create: `content/guides/everyday-sustainability-guides-turkey-2026.md`
- Create: `content/guides/real-time-tools-traders-analysts.md`

**Step 1: Write the failing test**

Use Task 1.

**Step 2: Run test to verify it fails**

Expected: FAIL until the remaining files are added.

**Step 3: Write minimal implementation**

Add the remaining content files, preserving the adapted slugs and stripping missing image embeds.

**Step 4: Run test to verify it passes**

Expected: PASS

### Task 5: Verify Hugo build output

**Files:**
- Verify only

**Step 1: Write the failing test**

Use the regression script plus a Hugo build.

**Step 2: Run test to verify it fails**

If the build fails, fix content formatting or path issues.

**Step 3: Write minimal implementation**

Adjust front matter or markdown only as needed to produce a clean build.

**Step 4: Run test to verify it passes**

Run:
- `powershell -ExecutionPolicy Bypass -File .\scripts\verify-blog-import.ps1`
- `hugo`

Expected:
- regression script passes
- Hugo build completes without errors
