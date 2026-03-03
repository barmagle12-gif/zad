param(
    [string]$Repo = 'https://github.com/barmagle12-gif/zad.git'
)

Write-Host "Publish & Build helper starting..."

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git is not installed or not in PATH. Install Git and re-run."
    exit 1
}

# ensure repo initialized
if (-not (Test-Path .git)) {
    Write-Host "Initializing git repository..."
    git init
}

Write-Host "Setting remote to $Repo"
try {
    git remote remove origin 2>$null
} catch {
    # ignore if remote doesn't exist
}
# remove trailing slash if present
$Repo = $Repo.TrimEnd('/')
git remote add origin $Repo

# commit if there are changes
$status = git status --porcelain
if ($status) {
    Write-Host "Staging and committing changes..."
    git add -A
    try {
        git commit -m "chore: sync project files for CI build" -q 2>$null
    } catch {
        Write-Host "Nothing to commit or commit failed (possibly no changes)."
    }
} else {
    Write-Host "No local changes to commit."
}

Write-Host "Ensuring branch 'main' and pushing to origin..."
try {
    git branch -M main 2>$null
} catch {
    # ignore
}
git push -u origin main

Write-Host "Push completed. If this created a repository on GitHub, Actions should start automatically."

# Try to use gh CLI to wait for workflow and download artifacts
if (Get-Command gh -ErrorAction SilentlyContinue) {
    # extract owner/repo from URL
    $ownerRepo = $Repo -replace '^https://github.com/','' -replace '\.git$',''
    Write-Host "Using gh CLI to monitor Actions for $ownerRepo"

    # ensure auth
    gh auth status 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "gh CLI is not authenticated. Run 'gh auth login' and re-run this script to auto-download artifacts."
        Write-Host "Or open: https://github.com/$ownerRepo/actions"
        exit 0
    }

    Write-Host "Waiting for the 'android-build' workflow run to appear (timeout 10 minutes)..."
    $timeout = (Get-Date).AddMinutes(10)
    while ((Get-Date) -lt $timeout) {
        try {
            $runsJson = gh run list --repo $ownerRepo --workflow android-build.yml --limit 1 --json databaseId,status,conclusion
            $runs = $runsJson | ConvertFrom-Json
        } catch {
            Start-Sleep -Seconds 5
            continue
        }

        if (-not $runs -or $runs.Count -eq 0) {
            Start-Sleep -Seconds 5
            continue
        }

        $run = $runs[0]
        Write-Host "Found run: status=$($run.status) conclusion=$($run.conclusion) id=$($run.databaseId)"

        if ($run.status -eq 'queued' -or $run.status -eq 'in_progress') {
            Start-Sleep -Seconds 10
            continue
        }

        if ($run.conclusion -eq 'success') {
            Write-Host "Workflow succeeded. Downloading artifacts..."
            gh run download $run.databaseId --repo $ownerRepo --dir artifacts
            Write-Host "Artifacts downloaded to ./artifacts (check for .apk files)."
            exit 0
        } else {
            Write-Host "Workflow finished with conclusion: $($run.conclusion). Check Actions page: https://github.com/$ownerRepo/actions"
            exit 1
        }
    }

    Write-Host "Timed out waiting for workflow run. Check: https://github.com/$ownerRepo/actions"
} else {
    Write-Host "gh CLI not found. Open the Actions page to download artifacts once the workflow completes:"
    Write-Host "https://github.com/$($Repo -replace '^https://github.com/','' -replace '\.git$','')/actions"
}
