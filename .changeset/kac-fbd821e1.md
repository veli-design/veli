---
'@tradenetcorp/veli-ui': minor
---

### Added

- Add typed Link refs and `aria-current` support for current-page navigation.

### Changed

- Link now inherits all surrounding typography when `size` is omitted, including weight. For standalone links, pass `size="sm"`, `"md"`, or `"lg"` to apply the matching medium body typography preset for English or Dhivehi. Icons remain 16px without a size or with `sm`/`md`, and 20px with `lg`.
- **Migration:** Previously, Link always applied medium weight and `size` only changed icons. Remove `size` from inline links that should follow their surrounding text; add an explicit size to standalone links that should retain medium typography. Review existing sizes: English `sm`/`md`/`lg` now set 14px/16px/18px text. For example, change `size="sm"` to `size="md"` to keep an existing 16px standalone label and 16px icons. To retain custom typography or weight, omit `size` and style the surrounding element. Text-only links can now wrap across lines, so review constrained navigation and table layouts.

### Fixed

- Keep keyboard focus visible even when a visual override is false, show a system-color focus outline in forced-colors mode, and disable color transitions under reduced motion.
