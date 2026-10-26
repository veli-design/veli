# Bundled npm release preparation

Engineering release requirements for PD-595, PD-574, PD-573, PD-592 and PD-582.
This document records artifact boundaries and unresolved rights. It is not legal
assurance.

## Licensing decision still needed

The CTO's conditional go-ahead permits preparation with licences, copyright and
asset notices in place; legal review is expected before public announcement.
No verified legal entity or copyright year was provided in the inspected issue
scope, comments or repository. Do not infer copyright ownership from GitHub's
`tradenetcorp` namespace, the npm `veli-design` organisation, or MINDCo hosting.
The standard MIT grant and disclaimer are unchanged. Root and npm-package copies
use explicit `[YEAR] [COPYRIGHT HOLDER — TO BE CONFIRMED]` placeholders. Confirm
the exact holder, year(s) and authority to license contributions before replacing
them consistently. The supported root publication script rejects unresolved templates and draft
notices; this is not a claim to intercept arbitrary direct npm publish commands. Local tarballs deliberately contain these templates for review only.

`LICENSING.md` separates MIT original software/code examples from CC BY 4.0
original non-software documentation, with unresolved attribution placeholders.
`LICENSES/CC-BY-4.0.txt` supplies the standard legal text. `ASSET_LICENSES.md`
records the known 86 source assets and their unresolved rights.
`BRAND_POLICY.md` defines separate asset exclusions, without adding restrictions
to the MIT software grant. `THIRD_PARTY_NOTICES.md` records installed direct
runtime dependencies and reproduces the verified Phosphor MIT notice. These are
not claims of ownership or a complete transitive licence audit.

## Artifact boundaries

- React: compiled ESM and declarations, Tailwind source discovery CSS, agent
  metadata/recipes, README, changelog, manifest, licence and notices.
- Tokens: generated CSS/JSON, README, changelog, manifest, licence and notices.
  Font-family strings reference host-supplied fonts; no font binaries are shipped.
- CLI: compiled ESM, executable `veli`, README, changelog, manifest, licence and
  notices. Source Blocks are fetched later, not bundled inside the npm CLI.
- Blocks remain a private copy-source workspace, not an npm package. Its nine
  source archives and docs/Storybook sites need a separate distribution review.
  No private workspace identities or directory names change in this bundle.

The asset inventory contains 86 files across the two apps' public directories and
seven standalone Block SVGs. Those files are outside the npm allowlists. No new
claim to redistribution rights is made for any of them. Specifically:

| Materials                                                                    | Evidence and required decision                                                                                                                                                              |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inter Latin/Latin-ext WOFF2 and IBM Plex Mono 400/500/600 WOFF2 in web fonts | Identify exact upstream files/version, attach matching upstream copyright and font licence, verify modification/subsetting terms. A known family name alone does not verify these binaries. |
| MV Faseyha Regular, MV A Waheed Bold 2, MV Aaamu FK Bold TTF in both apps    | Obtain verified rights holder and explicit redistribution licence for these exact files. No licence was present beside them.                                                                |
| Veli logos, favicon variants, home artwork                                   | Verify ownership/brand-use policy and who can authorise redistribution; excluded from proposed code grant.                                                                                  |
| gov.mv logos, Maldives flag and example organisation emblem in both apps     | Verify source, applicable rights and permitted uses; do not treat government artwork as public domain.                                                                                      |
| Remaining SVG/PNG/WebP/Lottie art and animation in app public directories    | Record source and applicable terms before public deployment; not automatically relicensed MIT.                                                                                              |
| Six service-detail SVGs and notification-tray cursor-click.svg               | Verify origin and applicable notices before releasing Blocks archives; no upstream provenance assumed.                                                                                      |

The local verification evidence outside the repository records per-file byte
counts and SHA-256 hashes, all eleven manifest identities, actual tarball contents
and findings. No fonts/assets were removed from current app previews or production.

## Seven Block SVG distribution findings

An exclusion from the MIT code grant is not permission to redistribute an asset.
All seven assets below have unverified upstream provenance, copyright holder,
licence/version and redistribution conditions. Similarity to an icon library is
not evidence of a matching upstream file. Obtain source/rights evidence and the
required notices, or agree an explicit removal/replacement, before distributing
an affected artifact. No artwork is silently removed by this change.

| Exact repository file                                     | Public npm tarballs | Copy-source registry                           | Hosted docs / Storybook                                                                 |
| --------------------------------------------------------- | ------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------- |
| `packages/blocks/src/service-detail/hand-coins.svg`       | Absent              | Included in service-detail manifest/archive    | CSS mask; included in rendered examples and downloadable source                         |
| `packages/blocks/src/service-detail/hand-deposit.svg`     | Absent              | Included in service-detail manifest/archive    | CSS mask; included in rendered examples and downloadable source                         |
| `packages/blocks/src/service-detail/hourglass-medium.svg` | Absent              | Included in service-detail manifest/archive    | CSS mask; included in rendered examples and downloadable source                         |
| `packages/blocks/src/service-detail/list-numbers.svg`     | Absent              | Included in service-detail manifest/archive    | CSS mask; included in rendered examples and downloadable source                         |
| `packages/blocks/src/service-detail/note-pencil.svg`      | Absent              | Included in service-detail manifest/archive    | CSS mask; included in rendered examples and downloadable source                         |
| `packages/blocks/src/service-detail/list-bullets.svg`     | Absent              | Included in service-detail manifest/archive    | CSS mask; included in rendered examples and downloadable source                         |
| `packages/blocks/src/notification-tray/cursor-click.svg`  | Absent              | Included in notification-tray manifest/archive | Imported by notification-tray-content.tsx; included in examples and downloadable source |

`service-detail.css` references all six service-detail SVGs; the notification-tray
content module imports cursor-click. Both block manifests enumerate those files.
The catalog's `sourceBundleFiles` / `sourceArchive` preserve the manifest files,
and `blockMarkdown` embeds their bytes into generated documentation. The web app
serves the catalog, archives and block-source docs; Storybook renders the shared
Blocks examples. These facts establish distribution surfaces, not permission.
Actual npm tarball inspection confirms no SVG/font/image asset is included in
React, tokens or CLI. Those packages do not embed the fetched Block archives.

New Blocks-registry publication and public docs/Storybook deployment remain
blocked for these assets as well as the other unverified public assets. Existing
production has not been changed or newly approved. Keep the existing deployment
approval gate disabled; an MIT exclusion must never be treated as clearance to
activate it. Npm publication separately remains blocked by copyright templates
and the existing rollout prerequisites.

## Issue traceability

| Issue  | Local contribution                                                                                                                    | Still required                                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| PD-574 | Standard MIT/CC BY texts, scope map, asset register, brand policy and third-party notices with three npm copies                       | Verify holder/year, code ownership and excluded-asset rights; review exact notices                                        |
| PD-573 | Mixed MIT/CC BY metadata in seven workspaces; MIT in four private software fixture/sample inputs                                      | Replace copyright templates before shipping; metadata is a proposed selection, not clearance                              |
| PD-582 | Discovery metadata in all seven workspaces; keywords completed in tokens/CLI                                                          | Current repository, homepage and bugs links require private GitHub access; public support route remains a launch decision |
| PD-592 | Existing renamed public install docs retained; token install command, React registry guidance and per-package licence scope clarified | Confirm actual published versions/registry before directing users to install                                              |
| PD-595 | Same package migration and local release controls                                                                                     | Rollout approvals and registry/auth decisions below                                                                       |

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
the source repository is private. Approve a compatible new-scope Blocks registry
and old-consumer support period before activating docs/registry deployment.
Public npm CLI installation does not grant registry access through MINDCo WFA.

Repository URLs truthfully retain `tradenetcorp/veli`; they have not been changed
to the future GitHub organisation. No issue should be marked Done based on these draft legal files.

## Reference material

- [OSI standard MIT text](https://opensource.org/license/mit)
- [Creative Commons CC BY 4.0 legal text](https://creativecommons.org/licenses/by/4.0/legalcode.txt)
- [npm package metadata and licence fields](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/)
- [Migration rollout and consumer rehearsal](NPM_MIGRATION.md)
