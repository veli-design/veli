---
'@tradenetcorp/veli-ui': minor
---

### Changed

- Rename the TextArea `variant` prop to `appearance` so Default and Outline match Input, Select, and ComboBox. Replace `variant="outline"` with `appearance="outline"`.

### Fixed

- Set the large TextArea shell minimum height to 173px to match the Figma specification.
- Apply the shared Dhivehi Safari baseline offset to TextArea so Thaana glyphs sit on the same line box as Input.
- Honor reduced-motion preferences on TextArea color transitions.
- Use `type-body-sm-regular` for the TextArea character counter at every size instead of hardcoded 14px type.
- Color field-header info tooltip triggers with `icon/base/default` (and `icon/disabled` when disabled) to match Figma. This applies to Input, TextArea, Select, ComboBox, and PasswordInput.
- Draw the TextArea outline stroke inside the shell so hover (1.5px) and active (2px) do not shift the field or its label.
- Drop the muted TextArea disabled stroke and underline so Default and Outline match Figma (fill only).
- Use the text-input hover fill for disabled TextArea shells so they match read-only and Figma `components/text-input/bg-hover`.
