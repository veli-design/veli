## 0.6.0

### Changed

- Require Veli React ^0.19.0 and record the exact 0.19.0 candidate baseline. The copied-source rendering API and token baseline are unchanged; previous block archives retain their existing requirements.

## 0.5.0

### Changed

- Support the verified public package baseline: @veli-design/react@^0.18.0, react-aria-components@^1.22.0, @veli-design/tokens@^0.11.0. The copied-source rendering API is unchanged.

## 0.4.0

### Changed

- Use the public @veli-design React and tokens package names. Migrate application and copied source imports together.

## 0.3.0

### Changed

- Adopt Veli UI 0.17.x and tokens 0.10.x as the supported core package baseline. Upgrade the applicable core packages together before adding or updating this copied block; earlier block versions retain their previous dependency contracts.
- Record the tested core candidate versions for the bilingual typography and subtle-button color update. Block APIs and authored source are unchanged.

## 0.2.0

### Changed

- Require Veli UI 0.16.0 or later in the 0.16 line and tokens 0.9.1 or later in the 0.9 line for installation alongside the complete block catalog. Upgrade the applicable packages before adding or updating this block. Validated against release candidates; repeat a clean registry install after publication.

## 0.1.1

### Fixed

- A single navigation group uses the full navigation area instead of the narrow first column at tablet and desktop widths.

## 0.1.0

### Added

- Responsive organization identity, navigation groups and social links.
- Application-owned messages, destinations and branding, with English/Dhivehi, LTR/RTL, and light/dark support.
- Independent CLI installation, catalog preview, Next.js example and consumer verification.

- Fixed EN/DV navigation headings, directional external arrows, stronger divider, and reference typography.
- Responsive tablet columns and language-specific identity wrapping; bold social icons in examples.

### Changed

- Navigation labels and external arrows follow Veli Link’s existing secondary intent without color overrides; differences from the Figma footer are documented.

- Social/contact links use standard secondary transparent icon-only Button anchors (md), with Figma background and sizing overrides documented for design review.
