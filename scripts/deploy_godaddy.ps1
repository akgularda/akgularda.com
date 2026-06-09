# Configuration
$ftpServer = "ftp://akgularda.com"
# Credentials are read from environment variables so secrets stay out of source control.
# Set them before running, e.g.:
#   $env:GODADDY_FTP_USER = "file@akgularda.com"
#   $env:GODADDY_FTP_PASSWORD = "your-ftp-password"
# See .env.example for the full list.
$username = if ($env:GODADDY_FTP_USER) { $env:GODADDY_FTP_USER } else { "file@akgularda.com" }
$password = $env:GODADDY_FTP_PASSWORD
if ([string]::IsNullOrEmpty($password)) {
    Write-Host "Error: GODADDY_FTP_PASSWORD environment variable is not set." -ForegroundColor Red
    Write-Host "Set it before deploying:  `$env:GODADDY_FTP_PASSWORD = '<your-ftp-password>'" -ForegroundColor Yellow
    exit 1
}
# Resolve path to handle '..' correctly and match FullName format
$localDir = (Get-Item "$PSScriptRoot\..\public").FullName
$historyFile = "$PSScriptRoot\deployment_history.json"
$remoteBase = "/public_html"

# Checking for the public folder
if (-not (Test-Path $localDir)) {
    Write-Host "Error: 'public' folder not found. Run 'hugo' first." -ForegroundColor Red
    exit 1
}

$webclient = New-Object System.Net.WebClient
$webclient.Credentials = New-Object System.Net.NetworkCredential($username, $password)

# Load History
$history = @{}
if (Test-Path $historyFile) {
    try {
        $history = Get-Content $historyFile -Raw | ConvertFrom-Json -AsHashtable
    } catch {
        Write-Host "Warning: Could not read history file. Starting fresh." -ForegroundColor Yellow
    }
}

# Function to calculate file hash
function Get-MyFileHash($path) {
    return (Get-FileHash -Path $path -Algorithm MD5).Hash
}

$newState = @{}

function Sync-Directory($localPath, $remoteRelPath) {
    $items = Get-ChildItem -Path $localPath
    
    foreach ($item in $items) {
        if ($item.Attributes -band [System.IO.FileAttributes]::Directory) {
            $newItemRemoteRelPath = "$remoteRelPath/" + $item.Name
            # Try create dir (silent fail if exists)
            try {
                $req = [System.Net.WebRequest]::Create("$ftpServer$remoteBase$newItemRemoteRelPath")
                $req.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
                $req.Credentials = $webclient.Credentials
                $null = $req.GetResponse()
            } catch {}
            
            Sync-Directory $item.FullName $newItemRemoteRelPath
        } else {
             # Get relative path key safely
             $relPath = $item.FullName.Substring($localDir.Length)
             $hash = Get-MyFileHash $item.FullName
             $newState[$relPath] = $hash
             
             $needsUpload = $false
             if (-not $history.ContainsKey($relPath)) { $needsUpload = $true; $reason="New" }
             elseif ($history[$relPath] -ne $hash) { $needsUpload = $true; $reason="Changed" }
             
             if ($needsUpload) {
                # Upload
                $uri = "$ftpServer$remoteBase$remoteRelPath/" + $item.Name
                Write-Host "Uploading ($reason): $($item.Name) ..." -NoNewline
                try {
                    $webclient.UploadFile($uri, "STOR", $item.FullName)
                    Write-Host " [OK]" -ForegroundColor Green
                } catch {
                    Write-Host " [FAILED] $_" -ForegroundColor Red
                    # Reuse old hash on failure so we retry next time
                    if ($history.ContainsKey($relPath)) { $newState[$relPath] = $history[$relPath] }
                    else { $newState.Remove($relPath) }
                }
             }
        }
    }
}

Write-Host "Starting Smart Sync (v3) to $remoteBase..." -ForegroundColor Yellow
Sync-Directory $localDir "" 

# Save state
$newState | ConvertTo-Json -Depth 5 | Set-Content $historyFile
Write-Host "Sync Complete!" -ForegroundColor Green
