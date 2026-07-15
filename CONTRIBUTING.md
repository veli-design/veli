# Contributing to Veli

Thank you for contributing to Veli. This guide explains how to prepare a
focused pull request that works for both the Studio's Linear workflow and
external GitHub contributions.

## Before opening a pull request

- Branch from the latest `main` and keep the change focused on one coherent
  outcome.
- Internal contributors should use the Linear-generated branch name, such as
  `feature/pd-444-adopt-a-pr-template-format`. Its `PD-###` identifier links
  the pull request to the primary Linear issue.
- External contributors may use a descriptive branch name and should open or
  reference a GitHub issue when one exists.

## Pull request format

GitHub pre-fills [the PR template](.github/PULL_REQUEST_TEMPLATE.md). Keep its
`Summary`, `Issues`, and `Validation` sections, and replace its comments with
the relevant information.

### Title

Veli uses squash merge, so the pull request title becomes the commit message on
`main`. Use the Conventional Commits format enforced by CI:

```text
feat(ui): add segmented control
fix(tokens): normalize OKLCH output
docs: document release workflow
```

### Issue links

For internal work, the `PD-###` identifier in the branch name automatically
links the primary Linear issue. If the pull request also completes other Linear
issues, include each one in the PR description with a closing magic word:

```text
Fixes PD-123
```

For external work, link and close the GitHub issue addressed by the pull
request in the PR description:

```text
Closes #123
```

Use one closing reference for each additional issue. For untracked maintenance
work, write `N/A` in the `Issues` section and briefly explain why no issue is
linked.

### Validation and releases

Record the automated and manual checks you ran in `Validation`, including any
checks you intentionally skipped and why. Run the relevant quality checks
before requesting review.

Changes that affect a published Veli package must include a changeset. Follow
the [changelog authoring guide](docs/CHANGELOG_AUTHORING.md) and run
`pnpm changeset:check`. Documentation-only and internal-only changes do not
need a changeset.
