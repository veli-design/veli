---
'@tradenetcorp/veli-ui': minor
---

### Added

- Add TextArea `isOptional` to show localized Optional beside the label. Required fields hide that caption.

### Changed

- Rename the PasswordInput `variant` prop to `appearance` so Default and Outline match Input, Select, ComboBox, and TextArea. Replace `variant="outline"` with `appearance="outline"`.
- Default PasswordInput `isRequired` to `true`. Pass `isRequired={false}` to opt out, or `showRequiredIndicator={false}` to keep the field required without a visible asterisk.

### Removed

- Remove TextArea `labelSupplementary`. Replace `labelSupplementary="Optional"` with `isOptional`.
- Remove PasswordInput `infoTooltip`, `infoTooltipAriaLabel`, and `labelSupplementary`. Password fields do not show an info icon or Optional caption.

### Fixed

- Draw the PasswordInput outline stroke inside the shell so hover (1.5px) and active (2px) do not shift the field or its value.
- Drop the muted PasswordInput disabled stroke and underline so Default and Outline match Figma (fill only).
- Use the text-input hover fill for disabled PasswordInput shells so they match Figma `components/text-input/bg-hover`.
- Honor reduced-motion preferences on PasswordInput color transitions.
