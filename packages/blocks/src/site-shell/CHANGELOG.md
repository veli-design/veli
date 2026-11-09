## 0.5.1

### Fixed

- Refresh the exact tested dependency baseline to tokens 0.11.1 for the repository-transfer metadata release. Copied source and supported dependency ranges are unchanged; previous block archives retain their existing baselines.

## 0.5.0

### Changed

- Support the verified public package baseline: @veli-design/tokens@^0.11.0. The copied-source rendering API is unchanged.

## 0.4.0

### Changed

- Use the public @veli-design React and tokens package names. Migrate application and copied source imports together.

## 0.3.0

### Changed

- Adopt tokens 0.10.x as the supported core package baseline. Upgrade the applicable core packages together before adding or updating this copied block; earlier block versions retain their previous dependency contracts.
- Record the tested core candidate versions for the bilingual typography and subtle-button color update. Block APIs and authored source are unchanged.

## 0.2.0

### Changed

- Require Veli tokens 0.9.1 or later in the 0.9 line for installation alongside the complete block catalog. Upgrade the applicable packages before adding or updating this block. Validated against release candidates; repeat a clean registry install after publication.

## 0.1.1

### Fixed

- Mark faded main and footer chrome as `inert` while overlays are open so keyboard focus cannot enter invisible content.
- Use 4 px horizontal gutters below `lg` and 8 px from `lg` up to match the gov.mv shell.

## 0.1.0

### Added

- Experimental page shell with a raised viewport column, rounded main surface, and overlay chrome fade coordinated from host-supplied overlay flags. Optional `header`, `footer`, and `notices` slots compose the site-header, site-footer, and preview-banner blocks.
