# Git Workflow

Veli uses GitHub Flow with a trunk-based bias: `main` is the only long-lived
branch, short-lived feature branches are opened from `main`, and completed work
lands through pull requests.

## Branches

- Keep `main` releasable.
- Create short-lived branches named after the work, for example
  `fix/button-focus`.
- Rebase feature branches on `main` before review when they drift.
- Delete feature branches after merge.

## Pull Requests

- Use squash merge for normal feature and fix PRs.
- Use rebase merge only when preserving a small, intentional sequence of
  foundational commits makes the resulting history clearer.
- Do not use merge commits for routine PRs.
- Keep PRs focused enough that one squash commit tells a coherent story.
- PR titles must follow Conventional Commits because squash merge uses the PR
  title as the final commit message on `main`.
- Use the repository PR template and follow the [contributing guide](../CONTRIBUTING.md)
  for summary, issue-linking, and validation requirements. Use `Closes #123`
  only when the pull request should close a GitHub issue; otherwise mention
  `#123` without a closing keyword.

## Commit Messages

Use Conventional Commits for squashed PR titles and direct maintenance commits:

```text
feat(ui): add modal component
fix(tokens): correct success color output
docs: document release workflow
chore: release packages
```

The `PR Title` workflow validates pull request titles before merge. Local feature
branch commits do not need to follow this format because they are squashed away.

## Releases

Package releases use Changesets. Feature PRs that change published packages
include a `.changeset/*.md` file. The preparation workflow creates or updates the
Changesets release PR. After its exact candidate passes the required validation
and normal repository review, merging that release PR triggers automatic npm
publication and delivery of the matching released-site snapshot. Ordinary
feature merges do not publish npm packages.

Pending Changesets hold the standalone site-delivery path. Any manual site-only
override still requires compatible published packages and a rehearsed catalog;
it does not publish npm packages. See [CI and release operations](CI_RELEASE_RUNBOOK.md)
for the current workflow and recovery procedures.

Published npm versions are immutable. Use the documented recovery procedure
rather than attempting to delete and reuse an existing version.
