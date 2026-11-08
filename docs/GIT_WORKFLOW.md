# Git Workflow

Veli uses GitHub Flow with a trunk-based bias: `main` is the only long-lived
branch, short-lived feature branches are opened from `main`, and completed work
lands through pull requests.

## Branches

- Keep `main` releasable.
- Create short-lived branches named after the work, for example
  `feature/pd-186-release-prep`.
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
  for summary, issue-linking, and validation requirements. The `PD-###` branch
  identifier links the primary Linear issue. Use `Resolves PD-###` only when
  this PR should close a Linear issue, `Related to PD-###` or `Ref PD-###`
  when it should not, and `Closes #123` only when this PR should close a
  GitHub issue.

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
include a `.changeset/*.md` file. The packages-first npm migration keeps release
execution manual and gated pending license, namespace, version/channel and
registry-transition approvals. Merging a feature or version PR does not publish
packages automatically. See [CI and release operations](CI_RELEASE_RUNBOOK.md).

Do not publish manually or assume an npm version can be deleted and reused.
Public publication requires its own approval and verification step.
