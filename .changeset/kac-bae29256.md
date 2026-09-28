---
'@tradenetcorp/veli-ui': minor
---

### Added

- Add Pagination loadmore with item counts, progress, and Veli Button’s loading indicator.

### Changed

- Model `PaginationProps` as a variant union. Page-only wrappers should extend `PaginationPageProps`; load-more wrappers can use `PaginationLoadMoreProps`.

### Removed

- Remove Pagination’s `isDisabled` prop. Boundary and completion controls disable automatically; use `isLoading` for pending load-more requests.

### Fixed

- Keep Pagination within narrow containers, restore numbered-button theme colors, make ellipsis menus work when `boundaryCount` is zero, and retain keyboard focus after selecting a hidden page.
