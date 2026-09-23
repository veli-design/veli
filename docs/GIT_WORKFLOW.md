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

Package releases are managed by Changesets. Feature PRs that change published
packages should include a `.changeset/*.md` file. When that PR merges to `main`,
the release workflow opens a version PR. Merging the version PR publishes the
packages to GitHub Packages.

Do not publish package versions manually. If an accidental package version is
published, delete the GitHub Package version before reusing that version number.
