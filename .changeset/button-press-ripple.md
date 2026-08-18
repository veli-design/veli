---
'@tradenetcorp/veli-ui': patch
---

### Changed

- Keep the Button press ripple visible while the pointer is held, including when it is dragged outside the button, and clamp it to the nearest edge until release.
- Hold primary and danger fill Buttons on their hover background while pressed, and let the label and icons scale with the chrome.

### Fixed

- Use the accent fill token for the accent Button ripple, and stop fill Buttons from inheriting inverted text on accent.
