## 0.2.1

### Fixed

- Play the intro once, then keep icon and 404 font styles still until pointer or keyboard activation. Remove automatic style cycling and idle waves, while preserving fine-pointer interaction and immediate style changes for reduced motion.

## 0.2.0

### Changed

- Require Veli UI 0.16.0 or later in the 0.16 line and tokens 0.9.1 or later in the 0.9 line for installation alongside the complete block catalog. Upgrade the applicable packages before adding or updating this block. Validated against release candidates; repeat a clean registry install after publication.

## 0.1.0

### Added

- Responsive error recovery content with interactive, theme-aware artwork.
- Application-owned messages, destinations and branding, with English/Dhivehi, LTR/RTL, and light/dark support.
- Independent CLI installation, catalog preview, Next.js example and consumer verification.

### Changed

- Callback recovery actions use Veli Link’s onPress without href, retaining inline sentence layout and app-controlled disabled/pending behavior.
