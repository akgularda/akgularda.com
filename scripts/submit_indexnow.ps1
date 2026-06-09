<#
.SYNOPSIS
    Submits updated URLs from a sitemap to the IndexNow API.

.DESCRIPTION
    This script parses the local XML sitemap to find URLs that were recently modified,
    or accepts command line parameters to submit a specific URL. It then triggers an
    IndexNow submission to notify search engines of changes.

    Requires the sitemap.xml to be present in the public folder.

.PARAMETER SingleUrl
    Optional. If provided, submits this specific URL instead of scanning the sitemap.

.PARAMETER Hours
    Optional. Submits URLs from the sitemap modified within the last N hours. Default is 24.
#>
param(
    [string]$SingleUrl = "",
    [int]$Hours = 24
)

$IndexNowKey = "149e6aa80447477daf5e34771966db2c"
$HostName = "akgularda.com"
$ApiEndpoint = "https://api.indexnow.org/indexnow"

$LogFile = "$PSScriptRoot\indexnow_log.txt"
$PublicDir = (Get-Item "$PSScriptRoot\..\public").FullName
$SitemapPath = Join-Path $PublicDir "sitemap.xml"

function Write-Log($Message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logLine = "[$timestamp] $Message"
    Write-Host $logLine
    Add-Content -Path $LogFile -Value $logLine
}

$urlsToSubmit = @()

if ($SingleUrl -ne "") {
    Write-Log "Single URL submission requested: $SingleUrl"
    $urlsToSubmit += $SingleUrl
} else {
    Write-Log "Scanning sitemap for URLs modified in the last $Hours hours..."
    if (-not (Test-Path $SitemapPath)) {
        Write-Log "ERROR: Sitemap not found at $SitemapPath. Please build the site first."
        exit 1
    }

    [xml]$sitemap = Get-Content $SitemapPath
    $cutoffDate = (Get-Date).AddHours(-$Hours).ToUniversalTime()
    
    $ns = New-Object System.Xml.XmlNamespaceManager($sitemap.NameTable)
    $ns.AddNamespace("sm", "http://www.sitemaps.org/schemas/sitemap/0.9")
    
    $nodes = $sitemap.SelectNodes("//sm:url", $ns)
    
    foreach ($node in $nodes) {
        $loc = $node.loc
        $lastmodStr = $node.lastmod
        if ([string]::IsNullOrEmpty($lastmodStr)) { continue }
        
        try {
            $lastmod = [datetime]::Parse($lastmodStr).ToUniversalTime()
            if ($lastmod -ge $cutoffDate) {
                $urlsToSubmit += $loc
            }
        } catch {
            Write-Log "Warning: Could not parse date $lastmodStr for URL $loc"
        }
    }
}

if ($urlsToSubmit.Count -eq 0) {
    Write-Log "No recent URLs found to submit. Exiting."
    exit 0
}

Write-Log "Found $($urlsToSubmit.Count) URLs to submit:"
foreach ($u in $urlsToSubmit) { Write-Log " - $u" }

# Prepare JSON payload
$payload = @{
    host = $HostName
    key = $IndexNowKey
    keyLocation = "https://$HostName/$IndexNowKey.txt"
    urlList = $urlsToSubmit
} | ConvertTo-Json

# Send request
Write-Log "Submitting to $ApiEndpoint..."
try {
    $response = Invoke-RestMethod -Uri $ApiEndpoint -Method Post -Body $payload -ContentType "application/json" -Scope Default
    Write-Log "SUCCESS: IndexNow submission accepted (Returned $($response | Out-String))."
} catch {
    $ex = $_.Exception.Response
    if ($ex) {
        $statusCode = $ex.StatusCode
        $statusDes  = $ex.StatusDescription
        Write-Log "ERROR: HTTP $($statusCode.value__) $statusDes"
    } else {
        Write-Log "ERROR: $($_.Exception.Message)"
    }
    exit 1
}

Write-Log "IndexNow sync completed successfully."
exit 0
