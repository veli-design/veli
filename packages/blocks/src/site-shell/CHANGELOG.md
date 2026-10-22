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
