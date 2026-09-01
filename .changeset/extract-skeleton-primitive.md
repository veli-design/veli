---
'@tradenetcorp/veli-ui': minor
---

### Added

- Add a generic `Skeleton` placeholder primitive exported from `@tradenetcorp/veli-ui/skeleton` for composing loading state skeletons.

### Removed

- Remove embedded skeleton loading modes from `Input`, `TextArea`, `PasswordInput`, `Search`, and `Accordion`. Compose `Skeleton` placeholders instead of using `appearance="skeleton"`, `variant="skeleton"`, or `isSkeleton`.
