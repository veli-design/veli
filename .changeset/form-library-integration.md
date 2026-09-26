---
'@tradenetcorp/veli-ui': minor
---

### Added

- Add `@tradenetcorp/veli-ui/form` with a `Form` wrapper that defaults `validationBehavior` to `aria`, plus `toErrorMessage` and `getErrorMessages` to turn React Hook Form errors and Standard Schema issues (Zod, Valibot, ArkType) into field error messages.
- Add `CheckboxGroup` for managing several checkboxes as one `string[]` value.
- Add `description` and `errorMessage` to `RadioGroup`.
- Add `triggerRef` on `Select` and `DatePicker` so form libraries can focus the trigger on validation errors.
- Infer `Select` and `ComboBox` `value` / `onChange` key types from the value you pass, so `string | null` form fields wire without conversion.

### Fixed

- Apply `Dropzone`'s `name` and `required` props to the underlying file input so native form submission and required validation work.
