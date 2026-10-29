---
'@tradenetcorp/veli-ui': minor
---

### Changed

- Toast `subtle` and `emphasis` now use Alert light and high-contrast colours, a 24px radius, semibold titles, and strong description text. The default appearance is `subtle`, and each toast shows a per-intent leading icon unless `showLeadingIcon` is `false` or a custom `leadingIcon` is set. The close control is an icon-only Button.
- Toast and Alert keep high-contrast or emphasis foreground colour on ghost close and action hover or press, instead of switching to `text-base-strong`.

### Removed

- Remove the `outline` toast appearance. Use `subtle` or `emphasis`.
