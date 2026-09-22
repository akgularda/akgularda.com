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
    @{ Name = "home canonical"; Target = $homeHtml; Pattern = 'rel="?canonical"? href="?https://arda-akgul\.com/"?'; IsRegex = $true },
    @{ Name = "person alternateName"; Target = $homeHtml; Pattern = '"alternateName":"Arda Akgul"' },
    @{ Name = "person givenName"; Target = $homeHtml; Pattern = '"givenName":"Arda"' },
    @{ Name = "person worksFor"; Target = $homeHtml; Pattern = '"worksFor"' },
    @{ Name = "about page title"; Target = $aboutHtml; Pattern = "About Arda Akgül" },
    @{ Name = "ProfilePage schema"; Target = $aboutHtml; Pattern = '"@type":"ProfilePage"' },
    @{ Name = "about page mainEntity"; Target = $aboutHtml; Pattern = '"mainEntity":{"@id":"https://arda-akgul.com/about/#person"' },
    @{ Name = "gtag"; Target = $homeHtml; Pattern = "G-RY2DML1TZX" },
    @{ Name = "Preferred Sources link"; Target = $homeHtml; Pattern = "google.com/preferences/source?q=arda-akgul.com" },
    @{ Name = "consent mode default"; Target = $homeHtml; Pattern = "analytics_storage\s*:\s*[`"']?denied"; IsRegex = $true },
    @{ Name = "consent banner"; Target = $homeHtml; Pattern = "consent-banner" },
    @{ Name = "privacy link"; Target = $homeHtml; Pattern = "href=[`"']?/privacy/"; IsRegex = $true },
    @{ Name = "cookie settings link"; Target = $homeHtml; Pattern = "cookie-settings-btn" }
)

$llmsPath = Join-Path $SiteRoot "public\llms.txt"
$llmsFullPath = Join-Path $SiteRoot "public\llms-full.txt"
$humansPath = Join-Path $SiteRoot "public\humans.txt"
$robotsPath = Join-Path $SiteRoot "public\robots.txt"
$essayPath = Join-Path $SiteRoot "public\publications\why-i-stopped-fighting-the-cameras\index.html"
$blogPostPath = Join-Path $SiteRoot "public\blogs\economics\renaissance-economics\index.html"
$extraRequired = @($llmsPath, $llmsFullPath, $humansPath, $robotsPath, $essayPath, $blogPostPath)
$missingExtra = $extraRequired | Where-Object { -not (Test-Path -LiteralPath $_) }
if ($missingExtra.Count -gt 0) {
    Write-Error ("Missing verification targets:`n- " + ($missingExtra -join "`n- "))
    exit 1
}
$llms = Get-Content -LiteralPath $llmsPath -Raw
$llmsFull = Get-Content -LiteralPath $llmsFullPath -Raw
$humans = Get-Content -LiteralPath $humansPath -Raw
$robots = Get-Content -LiteralPath $robotsPath -Raw
$essayHtml = Get-Content -LiteralPath $essayPath -Raw
$blogHtml = Get-Content -LiteralPath $blogPostPath -Raw
$checks += @(
    @{ Name = "llms.txt privacy link"; Target = $llms; Pattern = "https://arda-akgul.com/privacy/" },
    @{ Name = "llms.txt cookies link"; Target = $llms; Pattern = "https://arda-akgul.com/cookies/" },
    @{ Name = "llms.txt terms link"; Target = $llms; Pattern = "https://arda-akgul.com/terms/" },
    @{ Name = "llms.txt publication essays"; Target = $llms; Pattern = "Publication Essays" },
    @{ Name = "llms.txt essay link"; Target = $llms; Pattern = "publications/why-i-stopped-fighting-the-cameras" },
    @{ Name = "llms-full publication essays"; Target = $llmsFull; Pattern = "## Publication Essays" },
    @{ Name = "llms-full essay voice"; Target = $llmsFull; Pattern = "I think a lot of people still treat urban sensors" },
    @{ Name = "robots GPTBot allow"; Target = $robots; Pattern = "User-agent: GPTBot" },
    @{ Name = "humans.txt author"; Target = $humans; Pattern = "Arda Akgül" },
    @{ Name = "BlogPosting schema"; Target = $blogHtml; Pattern = '"@type":"BlogPosting"' },
    @{ Name = "BlogPosting genre"; Target = $blogHtml; Pattern = '"genre"' },
    @{ Name = "essay Article schema"; Target = $essayHtml; Pattern = '"@type":"Article"' },
    @{ Name = "essay voice"; Target = $essayHtml; Pattern = "I think a lot of people still treat urban sensors" }
)

$failedChecks = @()
foreach ($check in $checks) {
    if ($check.IsRegex) {
        if ($check.Target -notmatch $check.Pattern) { $failedChecks += $check.Name }
    } elseif ($check.Target -notmatch [regex]::Escape($check.Pattern)) {
        $failedChecks += $check.Name
    }
}

if ($failedChecks.Count -gt 0) {
    Write-Error ("SEO verification failed:`n- " + ($failedChecks -join "`n- "))
    exit 1
}

$redirectChecks = @(
    "RewriteEngine On",
    "RewriteCond %{HTTP_HOST} ^www\.arda-akgul\.com$ [NC]",
    "RewriteRule ^ https://arda-akgul.com%{REQUEST_URI} [L,R=301]"
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

