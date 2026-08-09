---
'@tradenetcorp/veli-ui': patch
---

### Changed

- Update Modal corner radius to `4xl` (32px) and bottom padding from 16px to 24px to match the design system.

### Fixed

- Stop forwarding open-state props to React Aria when Modal is used inside `Modal.Trigger`, which removes the build warning to place `onOpenChange` on the trigger.
