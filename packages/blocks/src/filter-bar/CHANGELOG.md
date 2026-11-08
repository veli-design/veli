## 0.1.1

### Fixed

- Preserve advanced filtering until every category selection is removed, and restore the remembered browse scope when clearing.
- Keep keyboard focus inside desktop and mobile filter panels when Clear all disables itself.
- Align block-owned category and applied-chip dividers with strong border tokens and use Bold search/filter trigger icons.

## 0.1.0

### Added

- Introduce an experimental controlled filter bar with category browsing, grouped checkbox selections, search and removable applied-filter summaries.
- Export reusable composition parts, consumer-facing types and `useFilterBar`; keep state helpers and date-specific inputs outside the public block API.
- Connect consumer-owned controls through `panelStart` and filter extensions so custom selections share counts, removal and clear actions.
- Provide optional select-all and disclosure controls, including whole-header disclosure when select-all is hidden.
- Summarize selected subcategories with configurable name thresholds and consumer-supplied formatters.
- Use released Veli React 0.19.0 Sheets for mobile category choices and advanced filters, with fixed headers/footers, scrolling bodies and focus restoration.
- Keep category tags on their own mobile row and search visible beside Filters, while retaining expandable desktop search and keyboard focus when clearing queries.
- Enable overflow arrows on mobile and desktop by default, with a boolean override, independent edge fades and optional mobile gutter alignment.
- Limit mobile applied chips to two rows by default with localized expansion, configurable `mobileMaxRows`, and a zero-row option that retains the clear action.
- Animate chip removal and category transitions with reduced-motion support; align clear actions with desktop chips and keep them available below the mobile overview.
- Supply English and Dhivehi RTL examples, interactive web documentation, existing composition and Figma-reference stories, and a Next.js consumer adapter using Veli DatePicker directly.
