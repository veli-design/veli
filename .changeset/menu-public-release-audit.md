---
'@tradenetcorp/veli-ui': minor
---

### Added

- Add array `shortcut` values that render as `Kbd` keys, and an automatic direction-aware submenu caret inside `MenuSubmenuTrigger`.

### Changed

- Align Menu popover and item spacing with Figma: 192px minimum width, 0.5px muted border, 16px content inset, 6px label–shortcut gap, and body-sized descriptions.
- Match Menu icons, submenu carets, and `MenuSeparator` to Figma tokens; separators now span the full item width without extra margin.

### Fixed

- Keep `shortcut` key order left-to-right in Dhivehi and other RTL menus.
- Add MenuPopover enter and exit motion that scales from its trigger, with reduced-motion support, silence item color transitions under `prefers-reduced-motion`, and switch sections to React Aria `MenuSection`.
