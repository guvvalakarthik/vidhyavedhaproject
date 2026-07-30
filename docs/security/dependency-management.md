# Dependency and repository security controls

The repository uses GitHub secret scanning, secret-scanning push protection,
Dependabot vulnerability alerts, Dependabot security updates, and weekly version
update pull requests for the frontend, backend, and GitHub Actions.

## Maintainer routine

1. Review security-update pull requests before feature updates.
2. Run frontend and backend tests plus the frontend production build.
3. Run `npm audit --omit=dev` in both package roots.
4. For any temporary exception, document the advisory, affected code path,
   compensating control, owner, review date, and removal condition.
5. Remove an exception immediately when a patched compatible release exists.

The current React Router advisory assessment is recorded in
[`known-security-exceptions.md`](../known-security-exceptions.md). It applies only
while the application remains a browser-only SPA without RSC or server actions.
