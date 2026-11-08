> Historical migration-readiness snapshot. Bootstrap has since completed; use
> [CI release operations](CI_RELEASE_RUNBOOK.md) for current automatic publication,
> verified human approval and recovery procedures.

# Npm release readiness

This document records artifact boundaries, unresolved rights and operational
release prerequisites. It is not legal assurance.

## Licensing prerequisites

Original project work and documentation attribution use © 2026 Government of the
Republic of Maldives. Developed by MINDCo. The brand permission contact and applicable asset permissions
remain unresolved. The standard MIT grant and disclaimer remain unchanged.
The supported publication script rejects unresolved fields; existing saved
tarballs are earlier validation rehearsals and must be regenerated when release
notices are completed.

`LICENSING.md` separates MIT original software/code examples from CC BY 4.0
original non-software documentation, with the government copyright attribution.
`LICENSES/CC-BY-4.0.txt` supplies the standard legal text. `ASSET_LICENSES.md`
defines category-level asset licensing scope and unresolved font, asset and
notice requirements.
`BRAND_POLICY.md` defines separate asset exclusions, without adding restrictions
to the MIT software grant. `THIRD_PARTY_NOTICES.md` records installed direct
runtime dependencies and reproduces the verified Phosphor MIT notice. These are
not claims of ownership or a complete transitive licence audit.

## Artifact boundaries

- React: compiled ESM and declarations, Tailwind source discovery CSS, agent
  metadata/recipes, README, changelog, manifest, inherited MIT licence and staged applicable notices.
- Tokens: generated CSS/JSON, README, changelog, manifest, inherited MIT licence and staged applicable notices.
  Font-family strings reference host-supplied fonts; no font binaries are shipped.
- CLI: compiled ESM, executable `veli`, README, changelog, manifest, licence and
  notices. Source Blocks are fetched later, not bundled inside the npm CLI.
- Blocks remain a private copy-source workspace, not an npm package. Its nine
  source archives and docs/Storybook sites need a separate distribution review.
  No private workspace identities or directory names change in this bundle.

App fonts, branding and artwork are outside the npm allowlists. Their separate
distribution requires applicable rights and notices; the category-level asset
policy does not independently establish redistribution clearance. Specifically:

| Materials                                                                    | Required evidence                                                                                                                                                                                      |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Inter Latin/Latin-ext WOFF2 and IBM Plex Mono 400/500/600 WOFF2 in web fonts | OFL-1.1 permits use under its conditions; add matching copyright and full OFL text to the web font distribution. Verify supplied-binary provenance and applicable reserved-name/subsetting conditions. |
| MV Faseyha Regular, MV A Waheed Bold 2, MV Aaamu FK Bold TTF in both apps    | Obtain verified rights holder and explicit redistribution licence for these exact files. No licence was present beside them.                                                                           |
| Veli Design logos, favicon variants, home artwork                            | Government copyright; confirm permission contact and permitted use; logos remain reserved.                                                                                                             |
| gov.mv logos, Maldives flag and example organisation emblem in both apps     | Verify source, applicable rights and permitted uses; do not treat government artwork as public domain.                                                                                                 |
| Remaining SVG/PNG/WebP/Lottie art and animation in app public directories    | Original documentation illustration/animation content follows CC BY; implementation code MIT; verify per-file classification and third-party terms.                                                    |
| Replaced standalone Phosphor copies                                          | Current imports verified; hosted MIT notice staged; historical copied archives require separate notice review.                                                                                         |

The local verification evidence outside the repository records per-file byte
counts and SHA-256 hashes, all eleven manifest identities, actual tarball contents
and findings. Fonts, branding and unrelated artwork are unchanged; the verified icon
replacements preserve their rendered appearance. Existing production is unchanged.

## Operational font notice checks

Inter and IBM Plex Mono are OFL-1.1 families. Their self-hosted web binaries
currently carry copyright and an OFL URL in metadata, but no full embedded
licence text was found and no accompanying OFL text is included in the built
web output. This is a notice-distribution task, not a blanket requirement to
obtain new permission for uses already allowed by the OFL. Include the relevant
upstream copyright and complete OFL text with the font distribution, preserving
reserved-font-name conditions where applicable. The five web binaries are copied
unchanged into the current build. Their exact supply source has not been
independently matched in this check. Storybook obtains Inter through its Google
Fonts stylesheet; its dependency-supplied font notices need their own check.

Dhivehi-font replacement and licence verification are deferred until the planned
replacement and its terms are available. Existing files and embedded metadata
remain unchanged; a planned purchase is not treated as completed rights clearance.
These are operational checks, separate from the public policy and npm packages.

## Verified Phosphor replacement boundary

Sixteen confirmed standalone copies are removed: seven Block SVGs, six footer
icons (also used by the homepage) and three code-control icons. Current Service
Detail `0.5.1` and Notification Tray `0.6.1` manifests retain the declared Phosphor
dependency and no longer ship those files. Named library icons preserve weight,
size, colour and decorative semantics. Astro uses SSR modules without icon-only
hydration. Moon deliberately uses the upstream bold geometry.

The completed regression verification recorded the pre-icon PD-595 baseline plus its existing
licensing source, loaded fonts, fixed browser/DPR, 40 paired captures, overlays,
pixel counts and keyboard checks. A genuine caret-spacing regression was found
and fixed. Final pairs have no layout/colour mismatch or changed pixels outside
icon regions; tiny geometry/antialiasing differences remain explicit.

The installed Phosphor MIT notice is staged in hosted web/Storybook artifacts.
Historical Git-derived archives may retain copied SVGs and still need notice
review before a separate public registry transition. No historical source or
receipt hashes are rewritten. Fonts, composite illustrations, branding and old
screenshots retain their separately recorded evidence gaps. None enters the
three npm tarballs. Those website-only gaps remain separate from the completed
copyright and documentation attribution in package notices.

## Publication and rollout gates

Current unversioned package manifests remain `@veli-design/react@0.17.0`,
`@veli-design/tokens@0.10.0`, `@veli-design/cli@0.1.1`. Pending Changesets have
not been applied; first-publication versions and dist-tag remain undecided.
There is no default dist-tag. If versioning is applied, regenerate Block ranges
and tested versions and repeat tarball consumers against the resulting versions.

The existing manual publication approval, explicit release branch/tag and
separate registry-transition gates remain. Verify npm name availability,
organisation role/publish permissions, initial authentication and any later trust
provisioning through separately authorised steps. Do not claim provenance while
the source repository is private. Validate a compatible new-scope Blocks registry
and define the old-consumer support period before activating docs/registry deployment.
Public npm CLI installation does not grant access through the existing registry access controls.

Repository URLs truthfully retain `tradenetcorp/veli`; they have not been changed
to the future GitHub organisation.

## Reference material

- [OSI standard MIT text](https://opensource.org/license/mit)
- [Creative Commons CC BY 4.0 legal text](https://creativecommons.org/licenses/by/4.0/legalcode.txt)
- [npm package metadata and licence fields](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/)
- [Migration rollout and consumer rehearsal](NPM_MIGRATION.md)

## Package legal artifacts

The root licence and governance files are canonical. Packages have no tracked
MIT or governance copies. pnpm supplies root `LICENSE`; `prepack` stages only
`licensing/LICENSING.md`, `licensing/CC-BY-4.0.txt` and applicable third-party
notice sections. Full brand and asset policies stay root-only; package
scope notices include self-contained exclusions and absolute source references.
The generated `licensing/` path avoids suppressing pnpm's root licence fallback.
Actual tarball checks, not source-copy equality, enforce this distribution shape.
