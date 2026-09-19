---
'@tradenetcorp/veli-ui': minor
---

### Added

- Support `href`, link DOM props, `routerOptions`, and a `render` escape hatch on Tabs items so individual tabs can navigate with Next.js or TanStack Router links.
- Accept optional `navigate` and `useHref` on `VeliProvider` to wire React Aria's `RouterProvider` for app-wide client-side navigation.

### Changed

- Make `TabsItem.panel` optional so route-driven tabs can omit in-component panel content; Tabs still renders a visually hidden panel so `aria-controls` resolves.

### Fixed

- Keep link tab selection in sync with `selectedKey` / `onSelectionChange` after React Aria resets selection on href tab presses.
