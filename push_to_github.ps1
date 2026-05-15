# push_to_github.ps1
# Smart Git push script for the dadwork‑ledger project.
# ------------------------------------------------------------
# Configuration – you can edit these defaults if desired
$BranchName = "main"
$CommitMessage = "Auto push – $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# Remote URL will be read from the environment variable set by create_github_repo.ps1
if (-not $env:GITHUB_REMOTE_URL) {
    Write-Host "[ERROR] Environment variable GITHUB_REMOTE_URL not set. Run .\create_github_repo.ps1 first." -ForegroundColor Red
    exit 1
}
$RemoteUrl = $env:GITHUB_REMOTE_URL

# Helper functions for colored output
function Write-Info($msg)   { Write-Host $msg -ForegroundColor Cyan }
function Write-Warn($msg)  { Write-Host $msg -ForegroundColor Yellow }
function Write-ErrorMsg($msg) { Write-Host $msg -ForegroundColor Red }

# ------------------------------------------------------------
# 1️⃣ Ensure we are in the project root
$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot
Write-Info "Working directory: $repoRoot"

# ------------------------------------------------------------
# 2️⃣ Initialise a git repository if missing
if (-not (Test-Path .git)) {
    Write-Info "No .git folder – initializing repository..."
    git init
    if ($LASTEXITCODE -ne 0) { Write-ErrorMsg "git init failed"; exit 1 }
    Write-Info "Repository initialised."
}

# ------------------------------------------------------------
# 3️⃣ Stage all files (respect .gitignore)
git add .
if ($LASTEXITCODE -ne 0) { Write-ErrorMsg "git add failed"; exit 1 }

# ------------------------------------------------------------
# 4️⃣ Commit if there are staged changes
$staged = git diff --cached --name-only
if ($staged) {
    Write-Info "Staged changes detected – creating commit."
    git commit -m $CommitMessage
    if ($LASTEXITCODE -ne 0) { Write-ErrorMsg "git commit failed"; exit 1 }
    Write-Info "Commit created."
} else {
    Write-Info "No changes to commit."
}

# ------------------------------------------------------------
# 5️⃣ Ensure remote is correctly set (uses $RemoteUrl)
$currentRemote = git remote get-url origin 2>$null
if ($currentRemote) {
    if ($currentRemote -ne $RemoteUrl) {
        Write-Warn "Remote 'origin' points to $currentRemote – updating to $RemoteUrl"
        git remote set-url origin $RemoteUrl
    } else {
        Write-Info "Remote 'origin' already correct."
    }
} else {
    git remote add origin $RemoteUrl
    if ($LASTEXITCODE -ne 0) { Write-ErrorMsg "Failed to add remote"; exit 1 }
    Write-Info "Remote 'origin' added."
}

# ------------------------------------------------------------
# 6️⃣ Checkout/create the target branch
git checkout -B $BranchName
if ($LASTEXITCODE -ne 0) { Write-ErrorMsg "Failed to checkout/create branch $BranchName"; exit 1 }
Write-Info "Using branch '$BranchName'"

# ------------------------------------------------------------
# 7️⃣ Push to GitHub (uses GITHUB_TOKEN if present for silent auth)
if ($env:GITHUB_TOKEN) {
    Write-Info "GITHUB_TOKEN detected – using token for authentication."
    $authUrl = $RemoteUrl -replace 'https://', "https://$($env:GITHUB_TOKEN)@"
    git push -u $authUrl $BranchName
} else {
    Write-Info "Pushing with normal credential prompt."
    git push -u origin $BranchName
}
if ($LASTEXITCODE -ne 0) {
    Write-ErrorMsg "git push failed – check authentication or remote URL."
    exit 1
}
Write-Info "✅ Push completed successfully!"
