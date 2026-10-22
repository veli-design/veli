---
'@tradenetcorp/veli-ui': patch
---

### Fixed

- Keep Calendar and RangeCalendar within narrow mobile containers, localize navigation labels, disable year selection with the calendar, and respect reduced motion in the year menu.

- Prevent Dhivehi Calendar and RangeCalendar hydration mismatches in WebKit while retaining RTL keyboard navigation.

- Match Figma's selected Today indicator and Calendar error-icon tokens, and use the DatePicker field radius and header/helper/disabled text tokens from the current Changelog.

- Restore DatePicker's 44-pixel calendar days and Figma popover geometry, align filled and focused field tokens, and keep Dhivehi numeric date segments consistent across browsers and hydration.

- Use the approved white text and Today indicator for selected Calendar dates and range endpoints, including invalid selections, so dark-mode selected dates meet AA text contrast.
