---
'@tradenetcorp/veli-ui': patch
---

Improve Dhivehi and RTL rendering across UI components:

- Add Dhivehi font fallback scoping and shared WebKit baseline handling for mixed-script text.
- Remove component-specific hardcoded alignment offsets that are now handled centrally.
- Keep Checkbox labels, descriptions, and error messages aligned in RTL/Dhivehi layouts.
- Align Dhivehi Avatar initials visually within the avatar circle.
- Start Calendar and RangeCalendar weeks on Sunday for both English and Dhivehi locales.
