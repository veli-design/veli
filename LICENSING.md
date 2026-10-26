# Licensing scope

Draft implementation for review. Copyright holder, year and authority to license
original work remain **TO BE CONFIRMED**. The standard licence texts are supplied
unchanged; their presence is not a claim that unresolved ownership or asset
rights have been cleared. Publication remains blocked.

## Software: MIT

Original Veli software is covered by the MIT licence in `LICENSE`: React
components, design-token data and generated CSS/JSON, CLI, application source,
build scripts, configuration, tests and executable code examples. This includes
code snippets in Markdown/MDX, recipes, stories and tutorial code. CC BY 4.0 is
not applied to software. The copyright line remains `[YEAR] [COPYRIGHT HOLDER —
TO BE CONFIRMED]`; no legal entity is inferred from repository or hosting names.

## Non-software documentation: CC BY 4.0

Original non-software documentation is covered by Creative Commons Attribution
4.0 International, whose complete standard text is in
`LICENSES/CC-BY-4.0.txt`. This includes original prose in READMEs, guides,
changelogs, agent guidance, Markdown/MDX pages and Storybook explanations, plus
original explanatory diagrams only where ownership is verified and they are not
excluded below. Code examples embedded in those documents remain MIT.

This map applies by content type, not filename alone: an MDX file may contain
CC BY prose and MIT code. Generated documentation retains the source material's
licence. Imported quotations, third-party notices, official imagery and other
excluded materials do not become CC BY merely by appearing in documentation.
A screenshot is not automatically cleared: the rights in every depicted asset
must be checked. Machine-readable package metadata uses `(MIT AND CC-BY-4.0)`
for mixed software/documentation workspaces; software-only fixtures retain MIT.
This means the respective terms apply to their respective contents, not that
users may choose either licence for every file.

### Attribution information

Before release, confirm the documentation creator/attribution identity,
copyright holder and year. The following is a conspicuous **template**, not a
completed attribution notice:

> [DOCUMENT TITLE], by [CREATOR / ATTRIBUTION IDENTITY — TO BE CONFIRMED].
> Copyright © [YEAR] [COPYRIGHT HOLDER — TO BE CONFIRMED].
> Source: [SPECIFIC SOURCE URL OR REPOSITORY PATH]. Licensed under
> [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
> Changes: [DESCRIBE CHANGES, IF ANY].
> Warranty disclaimer: see section 5 of the linked licence.

Follow the standard licence's attribution provisions: retain supplied creator,
copyright, licence and disclaimer information and source links where reasonably
practicable, and indicate modifications. This summary does not add a mandatory
credit format or new conditions. The standard legal text controls.

## Excluded material and other rights

The original-work grants do not apply to Veli names/logos, MINDCo names/marks,
Government of Maldives names, flags, emblems, seals, ministry marks, official
identity elements, designated photographs/illustrations/marketing assets, or
third-party fonts, icons, images, datasets and embedded media. Their appearance
in this repository or a website is not a licence to reuse them. See
`BRAND_POLICY.md`, the per-file `ASSET_LICENSES.md` register and
`THIRD_PARTY_NOTICES.md`. Third-party licence texts remain under their own terms;
the standard CC licence text itself carries Creative Commons' CC0 dedication.

No copyright grant here clears trademark, endorsement, privacy, publicity or
other rights outside its scope. Exclusion does not grant redistribution rights.
Public artifacts containing unverified assets remain blocked until rights are
verified or an explicit removal/replacement is agreed. No assets are removed by
this documentation change.

## Distributed packages and repository access

Root documents are canonical. pnpm 11.18.0 inherits the root MIT `LICENSE` when
packing each workspace package; no package-local MIT copy is maintained.
Each package's `prepack` hook stages the concise canonical distribution template
from `packaging/LICENSING.md`, the complete CC BY text, and applicable sections of
`THIRD_PARTY_NOTICES.md` under its ignored `licensing/` directory. Tokens has no
runtime dependencies or bundled third-party implementation, so it has no extra
third-party notice file. These files are generated artifacts, not parallel
source policies. `BRAND_POLICY.md` and `ASSET_LICENSES.md` remain root-only.

The package notice states MIT software / CC BY original documentation scope,
attribution placeholders and exclusions without requiring access to root policy
links. Actual tarball checks validate inherited MIT, canonical CC text, relevant
notices, working package references and absence of excluded artwork. No app font,
brand image or Block SVG is included; registry and hosted examples are separate.

The repository currently remains private at `tradenetcorp/veli`; repository and
issue links require access. Public npm publication, repository transfer and
public site/registry deployment require separate rollout approvals. This file
is a scope map and engineering preparation, not legal assurance.

## Standard licence sources

- MIT: https://opensource.org/license/mit and the SPDX published MIT text.
- CC BY 4.0: https://creativecommons.org/licenses/by/4.0/legalcode.txt

Explanatory scope and pending notices are kept here, outside both standard texts.
