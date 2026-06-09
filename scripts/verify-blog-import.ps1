param(
    [string]$SiteRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

$expectedFiles = @(
    "content/blogs/business-industry/corporate-strategy/_index.md",
    "content/blogs/business-industry/corporate-strategy/corporate-aesthetic-urban-space.md",
    "content/blogs/business-industry/corporate-strategy/philips-paradox-healthcare-strategy.md",
    "content/blogs/business-industry/corporate-strategy/values-companies-provide-chevron-mcdonalds-apple.md",
    "content/blogs/economics/game-theory/thinking-in-game-theory.md",
    "content/blogs/economics/renaissance-economics.md",
    "content/blogs/economics/trade-industrial-policy/blackrock-erdogan-dolmabahce.md",
    "content/blogs/economics/trade-industrial-policy/future-of-investment-companies.md",
    "content/blogs/economics/trade-industrial-policy/japan-inc.md",
    "content/blogs/economics/trade-industrial-policy/turkiye-varlik-fonu-finansal-gelecek.md",
    "content/blogs/tech-computing/digital-infrastructure/_index.md",
    "content/blogs/tech-computing/digital-infrastructure/annas-archive-spotify-scraping.md",
    "content/blogs/tech-computing/digital-infrastructure/blockchain-problem-of-bitcoin.md",
    "content/blogs/tech-computing/digital-infrastructure/turkcell-huawei-5g-integration.md",
    "content/guides/everyday-sustainability-guides-turkey-2026.md",
    "content/guides/real-time-tools-traders-analysts.md"
)

$contentFiles = @(
    "content/blogs/business-industry/corporate-strategy/corporate-aesthetic-urban-space.md",
    "content/blogs/business-industry/corporate-strategy/philips-paradox-healthcare-strategy.md",
    "content/blogs/business-industry/corporate-strategy/values-companies-provide-chevron-mcdonalds-apple.md",
    "content/blogs/economics/game-theory/thinking-in-game-theory.md",
    "content/blogs/economics/renaissance-economics.md",
    "content/blogs/economics/trade-industrial-policy/blackrock-erdogan-dolmabahce.md",
    "content/blogs/economics/trade-industrial-policy/future-of-investment-companies.md",
    "content/blogs/economics/trade-industrial-policy/japan-inc.md",
    "content/blogs/economics/trade-industrial-policy/turkiye-varlik-fonu-finansal-gelecek.md",
    "content/blogs/tech-computing/digital-infrastructure/annas-archive-spotify-scraping.md",
    "content/blogs/tech-computing/digital-infrastructure/blockchain-problem-of-bitcoin.md",
    "content/blogs/tech-computing/digital-infrastructure/turkcell-huawei-5g-integration.md",
    "content/guides/everyday-sustainability-guides-turkey-2026.md",
    "content/guides/real-time-tools-traders-analysts.md"
)

$missingFiles = @()
foreach ($relativePath in $expectedFiles) {
    $absolutePath = Join-Path $SiteRoot $relativePath
    if (-not (Test-Path -LiteralPath $absolutePath)) {
        $missingFiles += $relativePath
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Error ("Missing imported files:`n- " + ($missingFiles -join "`n- "))
    exit 1
}

$brokenImageRefs = @()
foreach ($relativePath in $contentFiles) {
    $absolutePath = Join-Path $SiteRoot $relativePath
    $content = Get-Content -LiteralPath $absolutePath -Raw
    if ($content -match "(https://akgularda\.com)?/images/blogs/") {
        $brokenImageRefs += $relativePath
    }
}

if ($brokenImageRefs.Count -gt 0) {
    Write-Error ("Imported files still contain missing blog image references:`n- " + ($brokenImageRefs -join "`n- "))
    exit 1
}

Write-Output "Blog import checks passed."
