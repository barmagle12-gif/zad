<#
  PowerShell helper to initialize a Git repo and push to a remote GitHub repository.
  Usage:
    Open PowerShell in the project root and run:
      powershell -ExecutionPolicy Bypass -File .\scripts\git-setup.ps1

  Notes:
  - Prefer using `gh auth login` to authenticate (recommended). If you supply a remote
    URL containing a token, be careful: do NOT commit or share that token.
  - The script will prompt for the remote repository URL (e.g. https://github.com/you/repo.git)
  - If `git` is not configured with user.name/email, the script will offer to set them.
#>

Set-StrictMode -Version Latest
Write-Host "Git setup script starting..." -ForegroundColor Cyan

function Check-Command($name) {
  $null = Get-Command $name -ErrorAction SilentlyContinue
  return $? 
}

if (-not (Check-Command git)) {
  Write-Error "Git not found in PATH. Please install Git and rerun this script."
  exit 1
}

$cwd = Get-Location
Write-Host "Working directory: $cwd"

# prompt for remote
$remote = Read-Host "Enter remote repository URL (e.g. https://github.com/username/repo.git)"
if ([string]::IsNullOrWhiteSpace($remote)) {
  Write-Error "Remote repository URL is required. Aborting."
  exit 1
}

# optional: check git user
$name = git config user.name
$email = git config user.email
if (-not $name -or -not $email) {
  Write-Host "Git user.name or user.email not set."
  $set = Read-Host "Would you like to set them now? (y/n)"
  if ($set -match '^[yY]') {
    $newName = Read-Host "Enter name for git user.name"
    $newEmail = Read-Host "Enter email for git user.email"
    if ($newName) { git config --global user.name "$newName" }
    if ($newEmail) { git config --global user.email "$newEmail" }
  }
}

if (-not (Test-Path .git)) {
  Write-Host "Initializing new git repository..."
  git init
} else {
  Write-Host ".git already exists - reusing existing repository." -ForegroundColor Yellow
}

Write-Host "Adding files to commit..."
git add .

try {
  git commit -m "chore: initial commit" -q
  Write-Host "Committed changes." -ForegroundColor Green
} catch {
  Write-Host "Nothing to commit or commit failed (maybe already committed). Continuing..." -ForegroundColor Yellow
}

Write-Host "Setting main branch and remote..."
git branch -M main 2>$null | Out-Null
if ((git remote) -notcontains 'origin') {
  git remote add origin $remote
} else {
  git remote set-url origin $remote
}

Write-Host "Pushing to remote 'origin' (main). You may be prompted for credentials or token." -ForegroundColor Cyan
try {
  git push -u origin main
  Write-Host "Push succeeded." -ForegroundColor Green
} catch {
  Write-Error "Push failed. If using HTTPS and a token, consider running 'gh auth login' or configuring credentials manager."
  exit 1
}

Write-Host "Done. If you plan to enable GitHub Actions with secrets, set them in the repository Settings -> Secrets." -ForegroundColor Cyan
