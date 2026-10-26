# Brand and asset scope

Engineering draft for review. The proposed MIT licence covers original software and code examples; CC BY 4.0
covers original non-software documentation, subject to confirmation of ownership
and licensing authority. `LICENSING.md` defines the boundary. Neither grant
relicenses excluded brand/government assets or third-party material.

The following materials are excluded from both proposed original-work grants:

- Veli names, logos and brand artwork, including `apps/web/public/favicon*.svg`,
  `apps/web/public/images/veli-mark.svg`, `home-veli-logo-*.svg`,
  `home-shader-mask-*.svg` and `veli-home-background.png` in that images directory.
- Government and organisation identifiers: `govmv-logo*.svg`, `maldives-flag.svg`
  and `example-organization-emblem.svg` in both apps' `public/blocks/` directories.
- Font binaries in `apps/web/public/fonts/` and `apps/storybook/public/fonts/`.
  These require their own upstream licences and notices; font-family names in
  the tokens do not distribute or license fonts.
- Seven standalone SVGs under `packages/blocks/src/service-detail/` and
  `packages/blocks/src/notification-tray/cursor-click.svg`, until their upstream
  origin and redistribution terms are verified. No third-party ownership is assumed.
- Other visual/animation assets under the apps' `public/` directories until
  their origin and redistribution terms have been recorded in the release inventory.

## Identity and references

Ownership/control of the Veli Design identity, MINDCo names and marks, and
Government of Maldives identity elements is **TO BE CONFIRMED** with the relevant
rights holder. This draft does not assert trademark registrations or ownership.
Under the proposed policy, truthful nominative references such as “Built using
Veli Design” are permitted, without suggesting official status or endorsement.
This is not permission to use logos or official marks, name a fork “Veli”, “Veli
Design” or “Maldives Government Design System”, or make certification,
affiliation, sponsorship or endorsement claims. Obtain separate permission from
the verified controlling rights holder before those uses. The permission contact
and approval process remain **TO BE CONFIRMED**; no contact is invented here.
This policy does not curtail uses otherwise permitted by applicable law and
adds no restrictions to MIT software or CC BY documentation rights.

No permission to use excluded marks, imply official affiliation or government
endorsement is supplied by the MIT or CC BY copyright licences. This document does not assert
who owns an excluded asset or invent a restriction on MIT-licensed code.
Obtain the applicable permission or licence from the verified rights holder.
Exclusion from this grant is not permission to redistribute. Public distribution
of artifacts containing unverified assets remains blocked until rights are
verified or an explicit replacement/removal has been agreed.

None of those app asset directories is part of the three npm packages' file
allowlists. A docs/Storybook deployment and a Blocks registry release are separate
artifact reviews: this npm scope does not clear those assets for redistribution.
See `docs/RELEASE_READINESS.md` in the repository for unresolved evidence.
