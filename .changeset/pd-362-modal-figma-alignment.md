---
'@tradenetcorp/veli-ui': patch
---

Refactor Modal into a compound component API and align styles with the Veli Figma spec.

Modal now composes through `Modal.Trigger`, `Modal.Header`, `Modal.Title`, `Modal.Description`, `Modal.CloseButton`, `Modal.Content`, and `Modal.Footer` instead of `title`, `description`, `footer`, `showCloseButton`, `closeButtonLabel`, and `contentClassName` props. Size tokens now match design widths (`xs` 440px, `sm` 440px, `md` 576px, `lg` 776px, `xl` 1024px, `full` 1200px), use `Shadow/sm` and `modal/bg-solid` tokens, and update header/footer spacing with section dividers. The close button is opt-in via `Modal.CloseButton`.
