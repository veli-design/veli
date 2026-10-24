## 0.4.0

## 0.5.0

### Changed

- Use the public @veli-design React and tokens package names. Migrate application and copied source imports together.

### Changed

- Adopt Veli UI 0.17.x and tokens 0.10.x as the supported core package baseline. Upgrade the applicable core packages together before adding or updating this copied block; earlier block versions retain their previous dependency contracts.
- Record the tested core candidate versions for the bilingual typography and subtle-button color update. Block APIs and authored source are unchanged.

## 0.3.0

### Changed

- Require Veli UI 0.16.0 or later in the 0.16 line and tokens 0.9.1 or later in the 0.9 line for the complete eight-block CLI installation. Applications using older package versions must upgrade before adding or updating this block; earlier versions are not claimed to be broken in isolation. Validated with UI 0.16.0 and tokens 0.9.1 release candidates; repeat a clean registry install after publication.

## 0.2.0

### Changed

- Match the established two-group footer layout with compact, non-wrapping link rows, asymmetric responsive gaps, unadorned links, and native visible-focus outlines.
- Add reusable `startGroupClassName` and `endGroupClassName` hooks for applications that need to adjust either group without framework-specific code.
- Support the existing Veli UI 0.10 and token 0.6 dependency floor used by current applications.

## 0.1.0

### Added

- Experimental responsive footer with application-supplied links, translated labels, and an optional router renderer.
