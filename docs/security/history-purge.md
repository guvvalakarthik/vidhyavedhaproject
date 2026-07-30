# Sensitive-history purge

Deleting `Backend/.env` in a normal commit does not remove its values from older
commits. A repository administrator must rewrite every reachable ref and then
invalidate the old objects on GitHub.

This operation changes commit IDs and invalidates open pull requests, branch
protections based on old commits, local clones, and signed commit references.
Run it only after the checklist pull requests are merged or closed.

## Before the rewrite

1. Rotate every credential from the tracked file. History cleanup is not revocation.
2. Merge or close every open pull request, including long-lived feature branches.
3. Announce a freeze on pushes and create an offline backup of the repository.
4. Install the official `git-filter-repo` tool on the administrator workstation.
5. Record protected-branch settings and the latest expected `main` commit.

## Prepare and verify

From a trusted PowerShell terminal outside any working clone:

```powershell
./scripts/security/prepare-history-purge.ps1 `
  -RepositoryUrl https://github.com/guvvalakarthik/vidhyavedhaproject.git `
  -ConfirmRewrite
```

The script creates a disposable mirror, removes `Backend/.env` and the committed
`Backend/node_modules` tree from every ref, verifies both paths are absent, and
prints—but deliberately does not execute—the force-push command. Review the
mirror and obtain repository-owner approval before force-pushing.

## After owner approval

Run the printed `git push --force --mirror ...` command from the verified mirror.
Then:

1. Confirm GitHub code search and fresh clones cannot find either removed path.
2. Re-enable or verify branch protection, secret scanning, and push protection.
3. Ask every contributor to delete old clones and clone again; do not merge old branches.
4. Rotate any credential again if an old clone was pushed after the freeze.
5. Contact GitHub Support if sensitive unreachable objects must be immediately purged from caches.
6. Record the new `main` commit and the completion evidence in the private incident log.
