# Removes backend/.env from ALL commits on the current branch (fixes GitHub Push Protection).
#
# From repo root:
#   powershell -ExecutionPolicy Bypass -File scripts\purge-backend-env-from-history.ps1
# With uncommitted changes (stashes everything including untracked, then restores):
#   powershell -ExecutionPolicy Bypass -File scripts\purge-backend-env-from-history.ps1 -Stash
#
# Then: rotate your Brevo/Sendinblue key, then: git push origin main --force

param(
    [switch]$Stash
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location -LiteralPath $root

if (-not (Test-Path -LiteralPath '.git')) {
    Write-Error 'Run this from the Edu-Bridge repo (no .git found).'
}

$dirty = git status --porcelain
$didStash = $false

if ($dirty) {
    if (-not $Stash) {
        Write-Host $dirty
        Write-Host ''
        Write-Host 'Working tree is not clean. Commit or stash, or re-run with -Stash (temporarily stashes all changes including untracked):'
        Write-Host '  powershell -ExecutionPolicy Bypass -File scripts\purge-backend-env-from-history.ps1 -Stash'
        exit 1
    }
    Write-Host 'Stashing all changes (including untracked) temporarily...'
    git stash push -u -m 'purge-backend-env-from-history-temp'
    $didStash = $true
}

$branch = (git branch --show-current).Trim()
if (-not $branch) {
    if ($didStash) { git stash pop }
    Write-Error 'Detached HEAD: checkout main (or your default branch) first.'
}

try {
    Write-Host "Rewriting history on branch '$branch' to drop backend/.env from every commit..."
    git filter-branch -f --index-filter "git rm --cached --ignore-unmatch backend/.env" --prune-empty -- $branch

    Write-Host 'Removing backup refs and pruning...'
    git for-each-ref --format='%(refname)' refs/original | ForEach-Object {
        if ($_) { git update-ref -d $_ 2>$null }
    }
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive

    Write-Host ''
    Write-Host 'Done. Next steps:'
    Write-Host '  1. Revoke/rotate the leaked Sendinblue (Brevo) SMTP key in the Brevo dashboard.'
    Write-Host "  2. git push origin $branch --force"
    Write-Host '  (Tell collaborators to re-clone or reset to the new history.)'
}
finally {
    if ($didStash) {
        Write-Host ''
        Write-Host 'Restoring your stashed changes...'
        git stash pop
    }
}
