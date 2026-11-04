---
'@veli-design/react': minor
---

### Changed

- Replace Sheet content props with composable `Sheet.Header`, `Sheet.Title`, `Sheet.Description`, `Sheet.Body`, `Sheet.Footer`, `Sheet.Handle` and `Sheet.Close` parts.
- Move `title`, `description`, `headerActions` and `footer` into children, move `contentClassName` to `Sheet.Body.className`, and replace `showHandle` with conditional `Sheet.Handle`. Include close controls and dividers explicitly.
