---
'@veli-design/react': minor
---

### Added

- Add a `webOtp` prop to `OTPInput` that asks Android Chrome for the SMS code while the field is focused. It is off by default. The SMS must end with `@yourdomain #123456` for Chrome to read it.

### Fixed

- Fix `OTPInput` SMS autofill that dropped the code or mixed it with existing digits when the field already had a value. A new code that replaces a full code now calls `onComplete`, so a resend can auto-submit.
