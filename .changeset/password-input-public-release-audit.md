---
'@tradenetcorp/veli-ui': minor
---

### Changed

- Rename the PasswordInput `variant` prop to `appearance` so Default and Outline match Input, Select, ComboBox, and TextArea. Replace `variant="outline"` with `appearance="outline"`.

### Fixed

- Draw the PasswordInput outline stroke inside the shell so hover (1.5px) and active (2px) do not shift the field or its value.
- Drop the muted PasswordInput disabled stroke and underline so Default and Outline match Figma (fill only).
- Use the text-input hover fill for disabled PasswordInput shells so they match Figma `components/text-input/bg-hover`.
- Honor reduced-motion preferences on PasswordInput color transitions.
