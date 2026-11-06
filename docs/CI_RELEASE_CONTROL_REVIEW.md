# Release control review (PD-1344)

This is a review record, not authorization to change release policy. The immediate
fix is step-scoped built-in token wiring for the release-site receipt. Keep all
existing controls for this fix; evaluate the proposals below separately before
implementation. CI changes must preserve exact source/package identity, independent
published-package site delivery, the global pending-release hold, shared deployment
locking, immutable evidence, duplicate suppression and deployment-only recovery.

| Control                                                                       | Assurance today                                                                                                    | Assessment and recommendation                                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Exact-head/base release CI, packed candidates and public package verification | Tests and deployment are bound to the release tree and exact package bytes.                                        | Retain. Ordinary selected CI and npm trust setup are not substitutes for this evidence.                                                                                                                                                                                                                                                    |
| `Visual review approved.` on an approved final-head human review              | Explicit visual attestation by a current write-access maintainer.                                                  | Retain now. Two generic GitHub approvals do not establish visual inspection; the check is independent of branch-rule bypass. A later proposal could replace the special text with an equally source-bound review mechanism and surface missing approval before merge. Automated screenshots alone cannot approve their own visual quality. |
| GitHub's two-review rule                                                      | General review count enforced by repository rules.                                                                 | Separate from visual attestation. No rule change or bypass is part of PD-1344. Avoid introducing another generic approval count in workflow code.                                                                                                                                                                                          |
| `VELI_RELEASE_BRANCH`                                                         | Explicit branch allowlist before the publisher job starts.                                                         | The workflow already targets main, so this is partly redundant. Consider a code-reviewed fixed main allowlist or explicit main default later; retain the current fail-closed variable until that policy is reviewed. Keep manual dispatch branch checks.                                                                                   |
| `VELI_NPM_DIST_TAG`                                                           | Explicit publication channel and monotonic tag guard.                                                              | Retain explicit channel selection. A stable-only workflow might default to latest, but that changes the consequence of missing configuration and must be approved separately. Preserve regression protection and pre-release separation.                                                                                                   |
| `VELI_NPM_PUBLICATION_APPROVED`                                               | Persistent rollout enable/disable switch.                                                                          | It is not approval of each release. Consider keeping one clearly named rollout switch and documenting its lifetime, rather than presenting it as a substitute for release-specific review. Retain today.                                                                                                                                   |
| `VELI_NPM_TRUSTED_PUBLISHING_READY`                                           | Maintainer attestation that trust is configured for packages actually releasing.                                   | Not a technical OIDC test and not permanent proof for future package releases. It overlaps the rollout switch. Consider consolidating the two only after bootstrap operations are complete, with an explicit per-releasing-package checklist. Keep the attestation today and recheck for tokens/CLI releases or repository transfer.       |
| `VELI_REGISTRY_TRANSITION_APPROVED` and temporary bootstrap entry             | Controls transition delivery; bootstrap guard retires stale production deployment after recurring evidence exists. | Retain until the documented end-to-end and recovery checks are complete. Removal belongs to an explicitly reviewed cleanup, not this receipt fix.                                                                                                                                                                                          |

## Recovery and operating cost

A shared site lock prevents simultaneous release handoff, catch-up and recovery
promotion. Receipt bookkeeping follows successful paired delivery; it never marks
newer source as delivered or implicitly authorizes holding a rollback. Missing or
failed receipts must remain recoverable even if that means repeating deployment.
Recovery never republishes packages. Manual site delivery still requires compatible
published versions, exact tested Blocks versions and source/bundle approval; a
maintainer declaration cannot bypass those checks.

Any simplification should reduce maintainer configuration and runner minutes while
retaining these guarantees. Measure duplicate builds, approval friction and recovery
outcomes first (related PD-1251), then review a concrete proposal and regression
matrix before changing defaults or removing a gate. This review makes no production,
repository-settings, npm-trust or visual-approval changes.
