export const meta = {
  name: 'arda-seo-llm-plan',
  description: 'Exhaustive, repo-grounded plan to rank akgularda.com #1 for "Arda Akgül" and make it LLMs\' first source',
  phases: [
    { title: 'Audit', detail: 'Parallel repo-grounded audits across SEO/structured-data/AI-discovery/E-E-A-T dimensions' },
    { title: 'Research', detail: 'Parallel 2026 best-practice web research on name-query ranking + LLM grounding' },
    { title: 'Synthesize', detail: 'Merge audit + research into prioritized, per-file implementation specs' },
    { title: 'Verify', detail: 'Adversarially verify each proposed change against the actual repo files' },
  ],
}

const REPO = 'C:\\Users\\akgul\\Downloads\\akgularda.com-master\\akgularda.com-master'

const AUDIT_SCHEMA = {
  type: 'object',
  properties: {
    dimension: { type: 'string' },
    currentState: { type: 'string', description: 'What exists today, grounded in actual file contents with file paths/lines' },
    strengths: { type: 'array', items: { type: 'string' } },
    gaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          files: { type: 'array', items: { type: 'string' } },
          problem: { type: 'string' },
          recommendation: { type: 'string', description: 'Concrete fix, with Hugo-template or schema snippet where relevant' },
        },
        required: ['id', 'title', 'severity', 'problem', 'recommendation'],
      },
    },
  },
  required: ['dimension', 'currentState', 'gaps'],
}

const RESEARCH_SCHEMA = {
  type: 'object',
  properties: {
    topic: { type: 'string' },
    keyFindings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          finding: { type: 'string' },
          soWhat: { type: 'string', description: 'Why it matters for this specific site' },
          sourceUrl: { type: 'string' },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
        },
        required: ['finding', 'soWhat'],
      },
    },
    actionableTactics: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tactic: { type: 'string' },
          appliesTo: { type: 'string' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
        },
        required: ['tactic', 'priority'],
      },
    },
  },
  required: ['topic', 'keyFindings', 'actionableTactics'],
}

const SYNTH_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    expectations: { type: 'string', description: 'Honest expectation-setting on what guarantees #1 / first-source vs what is probabilistic' },
    tiers: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tier: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                files: { type: 'array', items: { type: 'string' } },
                change: { type: 'string', description: 'Detailed change incl. exact Hugo template / schema JSON / text snippets' },
                rationale: { type: 'string' },
                validation: { type: 'string', description: 'How to verify this change works' },
                needsUserInput: { type: 'string', description: 'Empty if none; else what is needed (e.g. profile URL)' },
              },
              required: ['id', 'title', 'files', 'change', 'rationale'],
            },
          },
        },
        required: ['tier', 'items'],
      },
    },
    openQuestions: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'tiers'],
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    itemId: { type: 'string' },
    verdict: { type: 'string', enum: ['sound', 'needs-change', 'wrong'] },
    reasoning: { type: 'string', description: 'Grounded in the actual current file contents' },
    correction: { type: 'string', description: 'Empty if sound; else the corrected change' },
  },
  required: ['itemId', 'verdict', 'reasoning'],
}

const repoContext = `
REPOSITORY: ${REPO}
This is the Hugo static site for "Arda Akgül" (akgularda.com), already built to a very high standard.
Goal of the overall project: (1) rank #1 on Google for the exact query "Arda Akgül"; (2) be the FIRST/primary
source that LLMs (ChatGPT, Claude, Perplexity, Gemini) cite when asked about Arda Akgül.
Scope constraint: ON-SITE CODE ONLY (the user will handle off-site steps themselves; do not plan Wikidata).
Confirmed: user has X, GitHub, and Instagram/YouTube profiles but has NOT yet provided the exact URLs.

Key files to read (use Read/Grep/Glob — you are READ-ONLY, do not edit):
- layouts/partials/seo-jsonld.html   (all JSON-LD: WebSite, Person, WebPage/ProfilePage/ContactPage/Article, BreadcrumbList, CollectionPage)
- layouts/partials/site-head.html    (title, meta, OG, Twitter, canonical, alternate links to ai.txt/llms.txt)
- hugo.toml                          (params: author, same_as, social, affiliations, member_of, knows_about, home_tiles, menu)
- content/about.md                   (canonical bio + experience)
- layouts/index.html                 (homepage template)
- layouts/index.llmsfull.txt         (llms-full corpus generator)
- static/llms.txt, static/ai.txt, static/agents.txt
- static/.well-known/agent.json, static/.well-known/ai-plugin.json, static/.well-known/ai.txt, static/.well-known/llms.txt, static/.well-known/security.txt
- static/robots.txt, layouts/robots.txt, layouts/sitemap.xml
- static/_headers, static/.htaccess, static/manifest.json
- content/publications/_index.md, content/experience/_index.md, content/contact.md
Ground EVERY claim in actual file contents (cite file path + line). Do not invent gaps that are already handled.`

// ---------- Phase 1: parallel audits (4) + parallel research (3), one barrier before synthesis ----------
phase('Audit')

const auditThunks = [
  () => agent(`${repoContext}

AUDIT DIMENSION: Structured data / JSON-LD correctness & completeness.
Read layouts/partials/seo-jsonld.html, site-head.html, and hugo.toml in full. Assess the Person, WebSite,
WebPage/ProfilePage/ContactPage/Article, CollectionPage, and BreadcrumbList schemas.
Identify concrete gaps that materially help (a) a personal-name #1 ranking and (b) LLM entity grounding, e.g.:
- Person.sameAs currently contains only LinkedIn (verify) — missing X/GitHub/Instagram/YouTube wiring.
- Missing schema types: FAQPage (Who is Arda Akgül? etc.), ItemList/ScholarlyArticle for /publications/.
- Person enrichment: alumniOf, award (McKinsey Forward), hasOccupation, founder->Organization (Monarch Castle Technologies).
- Per-article fields: wordCount, articleSection, inLanguage (Turkish posts), speakable.
- Any correctness bugs (wrong @id, missing @type, image absolute URL issues).
For each gap give an exact Hugo-template or schema-JSON snippet in the recommendation. Be precise and grounded.`,
    { label: 'audit:structured-data', phase: 'Audit', schema: AUDIT_SCHEMA }),

  () => agent(`${repoContext}

AUDIT DIMENSION: AI / LLM discovery surface.
Read static/llms.txt, layouts/index.llmsfull.txt, static/ai.txt, static/agents.txt, and all static/.well-known/* files
(agent.json, ai-plugin.json, ai.txt, llms.txt, security.txt). Assess how well an LLM/agent can (a) discover the site,
(b) identify Arda Akgül as the canonical entity, (c) lift ready-to-quote canonical text.
Identify gaps, e.g.: no verbatim-quotable canonical bio at multiple lengths; profile/sameAs links absent from these files;
publications summary missing; duplicate/inconsistent files between static/ and static/.well-known/; agent.json missing
sameAs/profiles; ai-plugin.json validity. Recommend concrete additions (give the exact text blocks to add).`,
    { label: 'audit:ai-discovery', phase: 'Audit', schema: AUDIT_SCHEMA }),

  () => agent(`${repoContext}

AUDIT DIMENSION: Crawlability, indexing & delivery.
Read static/robots.txt, layouts/robots.txt, layouts/sitemap.xml, static/_headers, static/.htaccess, static/manifest.json,
and the head of site-head.html. Assess: are AI crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web,
anthropic-ai, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, CCBot, Bytespider, Amazonbot,
meta-externalagent) explicitly allowed? Is the sitemap priority/lastmod optimal (home + /about/ should be highest)?
Canonical correctness, RSS discoverability, hreflang for bilingual content, redirects (www->apex, trailing slash, http->https
in .htaccess), 404 handling. Flag any header/.htaccess rule that could block crawlers or duplicate content. Concrete fixes.`,
    { label: 'audit:crawl-index', phase: 'Audit', schema: AUDIT_SCHEMA }),

  () => agent(`${repoContext}

AUDIT DIMENSION: On-page content & E-E-A-T for the "Arda Akgül" entity.
Read content/about.md, layouts/index.html, content/publications/_index.md, content/experience/_index.md, content/contact.md,
and the title/description logic in site-head.html. Assess what helps win the exact-name query and be LLM-quotable:
- Is there a crisp, self-contained "Who is Arda Akgül" answer near the top of the homepage/about (the snippet LLMs lift)?
- Is the name (with correct ü) + key disambiguators in H1/title/first sentence on every key page?
- Is there a visible FAQ? Visible external profile links (for rel=me bidirectional verification)?
- Internal linking between About/Publications/Experience (entity cluster). Author bylines on articles.
- Name-variant coverage (Arda Akgul without diacritic). Image alt text / portrait labeling.
Recommend concrete content additions (give the exact copy to add, in the site's existing voice).`,
    { label: 'audit:content-eeat', phase: 'Audit', schema: AUDIT_SCHEMA }),
]

const researchThunks = [
  () => agent(`${repoContext}

RESEARCH TOPIC: How to rank #1 on Google for an exact PERSONAL-NAME query in 2026.
Use web search/fetch. Find current, authoritative guidance on: entity SEO & the Knowledge Graph for individuals;
the weight of an exact-match domain + exact-match brand/name; sameAs corroboration across profiles; E-E-A-T for
person entities; how Google handles diacritics (Akgül vs Akgul); name-collision/disambiguation; how AI Overviews
affect a name SERP. Translate findings into tactics that apply to a Hugo personal site (on-site only). Cite sources.`,
    { label: 'research:name-ranking', phase: 'Research', schema: RESEARCH_SCHEMA }),

  () => agent(`${repoContext}

RESEARCH TOPIC: Becoming an LLM's FIRST/primary source about a person in 2026.
Use web search/fetch. Investigate: current status & real-world adoption of llms.txt / ai.txt (do ChatGPT, Claude,
Perplexity, Gemini actually consume them?); which crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot,
PerplexityBot, Google-Extended, Applebot-Extended, CCBot) fetch what, and how robots.txt governs training vs answering;
what structured data / on-page signals LLM retrieval & grounding actually rely on; how to make content maximally
"quotable" (self-contained sentences, FAQ, canonical bio). Separate evidence-backed facts from hype. Cite sources.`,
    { label: 'research:llm-first-source', phase: 'Research', schema: RESEARCH_SCHEMA }),

  () => agent(`${repoContext}

RESEARCH TOPIC: schema.org correctness & rich-result eligibility in 2026 (validation gotchas).
Use web search/fetch on Google's official structured-data docs + schema.org. Confirm correct, current usage for:
Person (sameAs, alumniOf, knowsAbout, hasOccupation, founder/Organization), FAQPage (current eligibility & any
2024-2026 deprecations of FAQ rich results), ItemList + ScholarlyArticle/Article for a publications list, ProfilePage,
BreadcrumbList, speakable. Flag anything that could throw errors/warnings in Google Rich Results Test or schema validator,
and anything deprecated so we don't add dead markup. Give precise do/don't tactics. Cite official sources.`,
    { label: 'research:schema-correctness', phase: 'Research', schema: RESEARCH_SCHEMA }),
]

const phase1 = await parallel([...auditThunks, ...researchThunks])
const audits = phase1.slice(0, 4).filter(Boolean)
const research = phase1.slice(4).filter(Boolean)
log(`Phase 1 done: ${audits.length} audits, ${research.length} research reports collected`)

// ---------- Phase 2: synthesize ----------
phase('Synthesize')
const synth = await agent(`${repoContext}

You are the lead architect. Synthesize the AUDIT findings and RESEARCH findings below into a single, prioritized,
implementation-ready plan of ON-SITE code/content changes. Group into tiers (Tier 1 = highest leverage for #1 ranking
+ LLM first-source; Tier 2 = strong reinforcement; Tier 3 = polish). For each item give: exact files, a DETAILED change
(include real Hugo-template snippets and schema JSON where relevant), rationale, and a validation step. Mark needsUserInput
where a real value is required (e.g. the X/GitHub/Instagram-YouTube profile URLs). De-duplicate overlapping recommendations.
Drop anything research showed is deprecated or risky. Be honest in 'expectations' about what is controllable on-site vs
what depends on indexing/external corroboration (no guarantees of literal #1). Keep it grounded in the real repo.

=== AUDIT FINDINGS ===
${JSON.stringify(audits)}

=== RESEARCH FINDINGS ===
${JSON.stringify(research)}`,
  { label: 'synthesize:plan', phase: 'Synthesize', schema: SYNTH_SCHEMA })

const allItems = (synth?.tiers || []).flatMap(t => t.items.map(i => ({ ...i, tier: t.tier })))
log(`Synthesis produced ${allItems.length} change items across ${(synth?.tiers || []).length} tiers`)

// ---------- Phase 3: adversarial verification of each item against the real repo ----------
phase('Verify')
const verifications = await parallel(allItems.map(item => () =>
  agent(`${repoContext}

ADVERSARIALLY VERIFY this single proposed change against the ACTUAL current repo files. Read the relevant file(s)
yourself and check: (1) is the claim about the current state true? (2) is the proposed Hugo-template/schema syntax
correct and will it build? (3) will it validate in Google Rich Results Test / schema.org validator? (4) does it conflict
with or duplicate something already present? (5) is it actually high-leverage, or busywork? Default to skepticism.
Return verdict 'sound' only if it is correct AND worthwhile as-is; 'needs-change' (with a correction) if fixable;
'wrong' if the premise is false or it would harm. Be specific and cite file lines.

PROPOSED CHANGE (id=${item.id}, tier=${item.tier}):
${JSON.stringify(item)}`,
    { label: `verify:${item.id}`, phase: 'Verify', schema: VERIFY_SCHEMA })
    .then(v => v ? { ...v, title: item.title, tier: item.tier } : null)
))

const verified = verifications.filter(Boolean)
log(`Verified ${verified.length} items: ${verified.filter(v => v.verdict === 'sound').length} sound, ${verified.filter(v => v.verdict === 'needs-change').length} need-change, ${verified.filter(v => v.verdict === 'wrong').length} wrong`)

return { synth, verifications: verified }
