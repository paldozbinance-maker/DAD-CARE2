# ------------------------------------------------------------
# create_github_repo.ps1
# ------------------------------------------------------------
# This script creates the GitHub repository (if it doesn't exist) and configures the local git remote.
# It expects a GitHub Personal Access Token (PAT) in the environment variable GITHUB_TOKEN.
# ------------------------------------------------------------
# Configuration – change only if you need a different repo name or description.
$RepoName        = "DAD-CARE"
$RepoDescription = "Dadcare ledger application – auto‑pushed"
$RepoPrivate     = $false   # $true => private repo, $false => public
# ------------------------------------------------------------
function Write-Info   { param($msg) Write-Host $msg -ForegroundColor Cyan }
function Write-Warn   { param($msg) Write-Host $msg -ForegroundColor Yellow }
function Write-Error  { param($msg) Write-Host $msg -ForegroundColor Red }
# ------------------------------------------------------------
# Verify PAT
if (-not $env:GITHUB_TOKEN) {
    Write-Error "GITHUB_TOKEN environment variable not set. Set it with your PAT before running this script."
    exit 1
}
# ------------------------------------------------------------
# Build API request payload
$payload = @{ name = $RepoName; description = $RepoDescription; private = $RepoPrivate } | ConvertTo-Json
# ------------------------------------------------------------
# Create repository (or retrieve if it already exists)
Write-Info "Creating repository '$RepoName' on GitHub..."
$apiUrl = "https://api.github.com/user/repos"
try {
    $response = Invoke-RestMethod -Method Post -Uri $apiUrl -Headers @{ Authorization = "token $env:GITHUB_TOKEN"; Accept = "application/vnd.github+json"; "User-Agent" = "PowerShell" } -Body $payload -ErrorAction Stop
} catch {
    # If repository already exists, GitHub returns a 422 error – fall back to GET
    if ($_.Exception.Response.StatusCode -eq 422) {
        Write-Warn "Repository already exists – retrieving existing repo info."
        $repoUrl = "https://api.github.com/repos/$(Invoke-RestMethod -Method Get -Uri 'https://api.github.com/user' -Headers @{ Authorization = "token $env:GITHUB_TOKEN" }).login/$RepoName"
        $response = Invoke-RestMethod -Method Get -Uri $repoUrl -Headers @{ Authorization = "token $env:GITHUB_TOKEN"; Accept = "application/vnd.github+json"; "User-Agent" = "PowerShell" }
    } else {
        Write-Error "Failed to create repository: $_"
        exit 1
    }
}
# ------------------------------------------------------------
# Remote URL
$remoteUrl = $response.clone_url
Write-Info "Repository URL: $remoteUrl"
# Save remote URL for push script
$env:GITHUB_REMOTE_URL = $remoteUrl
Write-Info "Remote URL saved to environment variable GITHUB_REMOTE_URL"
# ------------------------------------------------------------
# Ensure we are in the project root
$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot
# ------------------------------------------------------------
# Initialise git repo if missing
if (-not (Test-Path .git)) {
    Write-Info "No .git folder – initializing repository..."
    git init
    if ($LASTEXITCODE -ne 0) { Write-Error "git init failed"; exit 1 }
}
# ------------------------------------------------------------
# Add or update remote named 'origin'
$currentRemote = git remote get-url origin 2>$null
if ($currentRemote) {
    if ($currentRemote -ne $remoteUrl) {
        Write-Warn "Remote 'origin' points to $currentRemote – updating to $remoteUrl"
        git remote set-url origin $remoteUrl
    } else {
        Write-Info "Remote 'origin' already set to correct URL."
    }
} else {
    git remote add origin $remoteUrl
    if ($LASTEXITCODE -ne 0) { Write-Error "Failed to add remote"; exit 1 }
    Write-Info "Remote 'origin' added."
}
Write-Info "Git remote configuration complete."
# End of script
