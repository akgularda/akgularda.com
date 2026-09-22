<#
.SYNOPSIS
    Pings RSS feed aggregation services about the site feed.

.DESCRIPTION
    Sends a minimal XML-RPC weblogUpdates.ping to a short, curated list of
    still-relevant ping endpoints (not the legacy Google sitemap ping, which
    is retired). Run after publishing new content. IndexNow remains the
    primary discovery push; this is a secondary feed-discovery signal.
#>

$BlogUrl = "https://arda-akgul.com/"
$FeedUrl = "https://arda-akgul.com/index.xml"
$Title   = "Arda Akgul"

# Curated endpoints only (research: large ping lists cause more harm than good).
$Endpoints = @(
    "http://rpc.pingomatic.com/",
    "http://rpc.twingly.com/",
    "http://api.moreover.com/ping"
)

$xml = @"
<?xml version="1.0"?>
<methodCall>
  <methodName>weblogUpdates.ping</methodName>
  <params>
    <param><value><string>$Title</string></value></param>
    <param><value><string>$BlogUrl</string></value></param>
  </params>
</methodCall>
"@

foreach ($Endpoint in $Endpoints) {
    try {
        $resp = Invoke-WebRequest -Uri $Endpoint -Method Post -Body $xml `
            -ContentType "text/xml" -TimeoutSec 15 -UseBasicParsing
        Write-Host "OK  $Endpoint -> $($resp.StatusCode)"
    } catch {
        Write-Host "WARN $Endpoint -> $($_.Exception.Message)"
    }
}

Write-Host "Feed ping pass complete. Feed: $FeedUrl"
exit 0
