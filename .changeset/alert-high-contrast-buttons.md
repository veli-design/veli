---
'@veli-design/react': patch
---

### Fixed

- High-contrast Alert actions and close use Button `highContrast` styles instead of colour overrides. Compose the primary action as secondary `fill` (not `transparent`) with `highContrast`, and secondary or close actions as secondary `ghost` with `highContrast`. `Alert.Actions` and `Alert.CloseButton` apply `highContrast` to direct Veli Buttons when the Alert appearance is `highContrast`.
