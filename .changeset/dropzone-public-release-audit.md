---
'@tradenetcorp/veli-ui': minor
---

### Added

- Add a `multiple` prop to `DropzoneField` (Figma `mode`). Single-file fields lay the area out as one row and replace it with the chosen file; multiple-file fields stack the area above a file list.
- Add `infoTooltip`, `infoTooltipAriaLabel`, `isOptional`, `isRequired`, `showRequiredIndicator`, and `isInvalid` to `DropzoneField` for the Figma field header and validation states.
- Add `title`, `hint`, and `secondaryText` to `DropzoneField` and `DropzoneArea` for customizing the drop area copy, and `isInvalid` to `DropzoneArea`.
- Add `value`, `defaultValue`, `onValueChange`, `onAccept`, `onFileAccept`, `onFileReject`, `onFileValidate`, `onUpload`, `maxFiles`, `maxSize`, and `name` pass-through props to `DropzoneField`.
- Submit the selected files with native forms when `Dropzone` or `DropzoneField` has a `name`, including files that were dropped.
- Export the `DropzoneState`, `DropzoneFileState`, and `DropzoneFileStatus` types for `useDropzone` selectors.
- Move focus to the file's remove button when a single-file dropzone receives a file, and back to Browse files when the file is removed.

### Changed

- Restyle Dropzone to match the current Veli Figma component: a single dashed drop area with 2px hover, drop-target, and invalid borders; file items with a linear progress bar along the bottom; and uploaded and error statuses in the item metadata.
- Rename `DropzoneField` `size` to `labelSize`. It sets the label type scale only (`md` for Body/md, `sm` for Body/sm). The drop area is the same at both sizes.
- Replace the `DropzoneField` `allowsBrowse` prop with `showTrigger`.
- `DropzoneTrigger` and `DropzoneItemDelete` now render Veli `Button`s. The remove button shows a danger Trash icon once a file is uploaded.
- A single-file dropzone now rejects a batch of more than one file with the localized “Only one file allowed” message instead of adding every file.

### Removed

- Remove the `lg` value from `DropzoneField` `size`. Use `labelSize="md"`.
- Remove `DropzoneField` `onSelect`. Use `onValueChange` or `onAccept`.
- Remove the `variant` (`circular` and `fill`) and `size` props from `DropzoneItemProgress`. Progress is always the linear bar along the bottom of the item.
- Remove the `size` prop from `DropzoneItemMetadata` and the `orientation` prop from `DropzoneList`. Lists are always vertical.
- Remove the `Dropzone` `required` prop, which had no effect.
- Remove `isDisabled` from `DropzoneArea`. Disable the whole dropzone with `disabled` on `Dropzone` or `isDisabled` on `DropzoneField`.

### Fixed

- Fix Dropzone text, background, and border colors that referenced undefined theme tokens and rendered unstyled.
- Fix `onValueChange` firing twice for each change in controlled mode.
- Fix upload progress updates being dropped or moving backwards after a file finished uploading.
- Fix overlapping invalid-state timers leaving the drop area stuck in its invalid style.
- Match file extensions in `accept` case-insensitively, so `.pdf` accepts `REPORT.PDF`.
- Fix nested interactive controls inside the drop area and a focusable element hidden with `aria-hidden`.
- Keep right-to-left layouts aligned when file names or error messages are in a left-to-right script.
- Respect reduced-motion preferences for drop area and progress transitions.
