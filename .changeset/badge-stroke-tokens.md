---
'@tradenetcorp/veli-tokens': patch
'@tradenetcorp/veli-ui': patch
---

### Added

- Add `color.status.*-stroke` tokens for badge outline borders, including `cautious-stroke` compatibility aliases.

### Changed

- Refresh Badge status subtle fills to alpha-200 tokens and map the Brand accent intent from the deprecated `teal` name.
- Point Badge info colors at the blue primitive scale instead of brand primary.

### Fixed

- Align Badge outline borders with Figma stroke tokens instead of subtle fill tokens.
- Remove visible borders from Badge subtle and emphasis appearances to match the design spec.

### Deprecated

- Badge `intent="teal"` now aliases to `intent="brand"`.
