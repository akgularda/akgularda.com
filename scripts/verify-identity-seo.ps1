param(
    [string]$SiteRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

$homePath = Join-Path $SiteRoot "public\index.html"
$aboutPath = Join-Path $SiteRoot "public\about\index.html"
$htaccessPath = Join-Path $SiteRoot "public\.htaccess"

$requiredPaths = @($homePath, $aboutPath, $htaccessPath)
$missingPaths = $requiredPaths | Where-Object { -not (Test-Path -LiteralPath $_) }
if ($missingPaths.Count -gt 0) {
    Write-Error ("Missing verification targets:`n- " + ($missingPaths -join "`n- "))
    exit 1
}

$homeHtml = Get-Content -LiteralPath $homePath -Raw
$aboutHtml = Get-Content -LiteralPath $aboutPath -Raw
$htaccess = Get-Content -LiteralPath $htaccessPath -Raw

$checks = @(
    @{ Name = "home title"; Target = $homeHtml; Pattern = "Arda Akgül - Official Website" },
    @{ Name = "home meta description"; Target = $homeHtml; Pattern = "Official website of Arda Akgül" },
    @{ Name = "home canonical"; Target = $homeHtml; Pattern = 'rel="canonical" href="https://akgularda.com/"' },
    @{ Name = "person alternateName"; Target = $homeHtml; Pattern = '"alternateName":"Arda Akgul"' },
    @{ Name = "person givenName"; Target = $homeHtml; Pattern = '"givenName":"Arda"' },
    @{ Name = "person worksFor"; Target = $homeHtml; Pattern = '"worksFor"' },
    @{ Name = "person alumniOf"; Target = $homeHtml; Pattern = '"alumniOf"' },
    @{ Name = "person founderOf"; Target = $homeHtml; Pattern = '"founderOf"' },
    @{ Name = "home FAQ schema"; Target = $homeHtml; Pattern = '"@type":"FAQPage"' },
    @{ Name = "about page title"; Target = $aboutHtml; Pattern = "About Arda Akgül" },
    @{ Name = "ProfilePage schema"; Target = $aboutHtml; Pattern = '"@type":"ProfilePage"' },
    @{ Name = "about page mainEntity"; Target = $aboutHtml; Pattern = '"mainEntity":{"@id":"https://akgularda.com/about/#person"' },
    @{ Name = "about FAQ schema"; Target = $aboutHtml; Pattern = '"@type":"FAQPage"' },
    @{ Name = "about FAQ question"; Target = $aboutHtml; Pattern = 'Who is Arda Akgül?' }
)

$failedChecks = @()
foreach ($check in $checks) {
    if ($check.Target -notmatch [regex]::Escape($check.Pattern)) {
        $failedChecks += $check.Name
    }
}

if ($failedChecks.Count -gt 0) {
    Write-Error ("SEO verification failed:`n- " + ($failedChecks -join "`n- "))
    exit 1
}

$redirectChecks = @(
    "RewriteEngine On",
    "RewriteCond %{HTTP_HOST} ^www\.akgularda\.com$ [NC]",
    "RewriteRule ^ https://akgularda.com%{REQUEST_URI} [L,R=301]"
)

$failedRedirectChecks = @()
foreach ($pattern in $redirectChecks) {
    if ($htaccess -notmatch [regex]::Escape($pattern)) {
        $failedRedirectChecks += $pattern
    }
}

if ($failedRedirectChecks.Count -gt 0) {
    Write-Error ("Redirect verification failed:`n- " + ($failedRedirectChecks -join "`n- "))
    exit 1
}

Write-Output "Identity SEO checks passed."
