---
'@tradenetcorp/veli-ui': patch
---

Align Menu with Figma: refresh popover, item, section, and separator styling with dedicated menu design tokens. Rename `MenuItem` `tone` to `sentiment`, remove the `MenuPopover` `size` prop in favor of content-driven width, add selection check indicators via React Aria `selectionMode`/`selectedKeys`, expose `closeOnSelect` on `MenuItem`, and add `size` variants to section titles. Update item layout for icons, descriptions, and keyboard shortcuts using the React Aria `Keyboard` component.
