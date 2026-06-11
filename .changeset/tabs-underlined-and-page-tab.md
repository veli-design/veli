---
'@tradenetcorp/veli-ui': minor
---

Replace `SegmentedTabs` with underlined `Tabs` navigation: bottom border, animated selection indicator, optional `leading`/`trailing` slots, and `overflowItems` with a "More" dropdown (`TabsOverflow`). Move the previous pill/segmented pattern to `@tradenetcorp/veli-ui/page-tab` as `PageTab`.

**Breaking:** `SegmentedTabs`, `SegmentedTabsItem`, and `SegmentedTabsProps` are removed from `@tradenetcorp/veli-ui/tabs`. Use `Tabs`/`TabsItem`/`TabsProps` for underlined tabs, or `PageTab` from `@tradenetcorp/veli-ui/page-tab` to keep the segmented style. `isCentered` is removed from `Tabs` (still available on `PageTab`).
