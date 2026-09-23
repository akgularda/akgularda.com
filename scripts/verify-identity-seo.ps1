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
$apiCatalogPath = Join-Path $SiteRoot "public\.well-known\api-catalog"
$ardPath = Join-Path $SiteRoot "public\.well-known\ard.json"
$skillsIndexPath = Join-Path $SiteRoot "public\.well-known\agent-skills\index.json"
$authMdPath = Join-Path $SiteRoot "public\auth.md"
$prmPath = Join-Path $SiteRoot "public\.well-known\oauth-protected-resource"
$asPath = Join-Path $SiteRoot "public\.well-known\oauth-authorization-server"
$jwksPath = Join-Path $SiteRoot "public\.well-known\jwks.json"
$mcpCardPath = Join-Path $SiteRoot "public\.well-known\mcp\server-card.json"
$agentCardPath = Join-Path $SiteRoot "public\.well-known\agent-card.json"
$essayPath = Join-Path $SiteRoot "public\publications\why-i-stopped-fighting-the-cameras\index.html"
$blogPostPath = Join-Path $SiteRoot "public\blogs\economics\renaissance-economics\index.html"
$extraRequired = @($llmsPath, $llmsFullPath, $humansPath, $robotsPath, $apiCatalogPath, $ardPath, $skillsIndexPath, $authMdPath, $prmPath, $asPath, $jwksPath, $mcpCardPath, $agentCardPath, $essayPath, $blogPostPath)
$missingExtra = $extraRequired | Where-Object { -not (Test-Path -LiteralPath $_) }
if ($missingExtra.Count -gt 0) {
    Write-Error ("Missing verification targets:`n- " + ($missingExtra -join "`n- "))
    exit 1
}
$llms = Get-Content -LiteralPath $llmsPath -Raw
$llmsFull = Get-Content -LiteralPath $llmsFullPath -Raw
$humans = Get-Content -LiteralPath $humansPath -Raw
$robots = Get-Content -LiteralPath $robotsPath -Raw
$apiCatalog = Get-Content -LiteralPath $apiCatalogPath -Raw
$ard = Get-Content -LiteralPath $ardPath -Raw
$skillsIndex = Get-Content -LiteralPath $skillsIndexPath -Raw
$authMd = Get-Content -LiteralPath $authMdPath -Raw
$prm = Get-Content -LiteralPath $prmPath -Raw
$asMeta = Get-Content -LiteralPath $asPath -Raw
$jwks = Get-Content -LiteralPath $jwksPath -Raw
$mcpCard = Get-Content -LiteralPath $mcpCardPath -Raw
$agentCard = Get-Content -LiteralPath $agentCardPath -Raw
$essayHtml = Get-Content -LiteralPath $essayPath -Raw
$blogHtml = Get-Content -LiteralPath $blogPostPath -Raw
$checks += @(
    @{ Name = "PRM scopes_supported non-empty"; Target = $prm; Pattern = '"scopes_supported": \["read"\]'; IsRegex = $true },
    @{ Name = "AS agent_auth block"; Target = $asMeta; Pattern = "agent_auth" },
    @{ Name = "AS agent_auth register_uri"; Target = $asMeta; Pattern = "register_uri" },
    @{ Name = "AS agent_auth claim_uri"; Target = $asMeta; Pattern = "claim_uri" },
    @{ Name = "AS agent_auth identity_types"; Target = $asMeta; Pattern = "identity_types_supported" },
    @{ Name = "AS agent_auth credential_types"; Target = $asMeta; Pattern = "credential_types_supported" },
    @{ Name = "agent-card protocolVersion"; Target = $agentCard; Pattern = '"protocolVersion": "0.3.0"' },
    @{ Name = "agent-card supportedInterfaces"; Target = $agentCard; Pattern = "supportedInterfaces" },
    @{ Name = "agent-card skills url"; Target = $agentCard; Pattern = "arda-site/SKILL.md" },
    @{ Name = "auth.md claim_uri"; Target = $authMd; Pattern = "claim_uri" },
    @{ Name = "auth.md A2A endpoint"; Target = $authMd; Pattern = "agent-card.json" },
    @{ Name = "llms.txt privacy link"; Target = $llms; Pattern = "https://arda-akgul.com/privacy/" },
    @{ Name = "llms.txt cookies link"; Target = $llms; Pattern = "https://arda-akgul.com/cookies/" },
    @{ Name = "llms.txt terms link"; Target = $llms; Pattern = "https://arda-akgul.com/terms/" },
    @{ Name = "llms.txt publication essays"; Target = $llms; Pattern = "Publication Essays" },
    @{ Name = "llms.txt essay link"; Target = $llms; Pattern = "publications/why-i-stopped-fighting-the-cameras" },
    @{ Name = "llms-full publication essays"; Target = $llmsFull; Pattern = "## Publication Essays" },
    @{ Name = "llms-full essay voice"; Target = $llmsFull; Pattern = "A lot of people still treat urban sensors" },
    @{ Name = "robots GPTBot allow"; Target = $robots; Pattern = "User-agent: GPTBot" },
    @{ Name = "robots Content-Signal"; Target = $robots; Pattern = "Content-Signal: ai-train=yes, search=yes, ai-input=yes" },
    @{ Name = "api-catalog linkset"; Target = $apiCatalog; Pattern = '"linkset"' },
    @{ Name = "api-catalog service-desc"; Target = $apiCatalog; Pattern = "openapi.yaml" },
    @{ Name = "ard.json entries"; Target = $ard; Pattern = '"entries"' },
    @{ Name = "ard.json urn"; Target = $ard; Pattern = "urn:air:arda-akgul.com" },
    @{ Name = "skills index schema"; Target = $skillsIndex; Pattern = "schemas.agentskills.io/discovery/0.2.0" },
    @{ Name = "skills index digest"; Target = $skillsIndex; Pattern = "sha256:" },
    @{ Name = "auth.md h1"; Target = $authMd; Pattern = "# auth.md" },
    @{ Name = "auth.md agent_auth"; Target = $authMd; Pattern = "agent_auth:" },
    @{ Name = "auth.md register_uri"; Target = $authMd; Pattern = "register_uri" },
    @{ Name = "PRM bearer header"; Target = $prm; Pattern = '"bearer_methods_supported": \["header"\]'; IsRegex = $true },
    @{ Name = "PRM authorization_servers"; Target = $prm; Pattern = "authorization_servers" },
    @{ Name = "AS issuer"; Target = $asMeta; Pattern = '"issuer": "https://arda-akgul.com"' },
    @{ Name = "AS grant_types"; Target = $asMeta; Pattern = "grant_types_supported" },
    @{ Name = "AS jwks_uri"; Target = $asMeta; Pattern = "jwks_uri" },
    @{ Name = "JWKS keys"; Target = $jwks; Pattern = '"keys"' },
    @{ Name = "MCP serverInfo"; Target = $mcpCard; Pattern = '"serverInfo"' },
    @{ Name = "MCP endpoint"; Target = $mcpCard; Pattern = "arda-akgul.com/mcp" },
    @{ Name = "MCP capabilities"; Target = $mcpCard; Pattern = '"capabilities"' },
    @{ Name = "humans.txt author"; Target = $humans; Pattern = "Arda Akgül" },
    @{ Name = "BlogPosting schema"; Target = $blogHtml; Pattern = '"@type":"BlogPosting"' },
    @{ Name = "BlogPosting genre"; Target = $blogHtml; Pattern = '"genre"' },
    @{ Name = "essay Article schema"; Target = $essayHtml; Pattern = '"@type":"Article"' },
    @{ Name = "essay voice"; Target = $essayHtml; Pattern = "A lot of people still treat urban sensors" }
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

