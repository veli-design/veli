<!--
PR title: use Conventional Commits because squash merge uses this title as the
commit message on main. Example: feat(ui): add segmented control
-->

## Summary

<!-- Explain what changed and why. -->

## Issues

<!--
Internal (Linear): a branch containing PD-### automatically links its primary
issue. Choose the magic word by intent:
- Completes the issue: Resolves PD-123
- Relates without closing: Related to PD-123
- Partial contribution without closing: Ref PD-123
Do not use a closing keyword (Resolves, Fixes, Closes) unless this PR should
close that issue.

External (GitHub): Closes #123 only when this PR should close the issue;
otherwise mention #123 with no closing keyword.

For untracked maintenance work, write: N/A — <brief reason>
-->

## Validation

<!-- List automated and manual checks run. State any intentionally skipped
validation and why. -->

## Agent docs

<!--
If this PR changes packages/react/src/<id>.tsx public API or behavior that agents
need to know, update packages/react/agent/components/<id>.json (and AGENT_GUIDE.md
when the system-wide rules change).
-->

- [ ] Agent sidecars / guide updated, or N/A
