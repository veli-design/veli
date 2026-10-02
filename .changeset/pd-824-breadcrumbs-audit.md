---
'@tradenetcorp/veli-ui': minor
---

### Changed

- Align Breadcrumbs typography and motion with the design specification, including reduced-motion support and Dhivehi-specific type weight.

### Removed

- Remove the unused `Breadcrumb` `tone` prop. Remove the prop from existing trails; use `BreadcrumbBackLink` or `showBackLink` for the dedicated back-link treatment.

### Fixed

- Mark disabled breadcrumb text as unavailable to assistive technologies while keeping it out of the tab order.
