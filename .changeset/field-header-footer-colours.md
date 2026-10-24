---
'@veli-design/react': patch
---

### Fixed

- Disabled field labels use the muted text colour, helper text uses muted text and switches to the disabled colour when the field is disabled, and the required asterisk stays danger when the field is disabled.
- `FieldDescription` accepts `isDisabled` so its helper can follow an inner control when that control disagrees with the surrounding field.
