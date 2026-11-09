## 0.11.1

### Changed

- Make the block documentation self-contained for public consumers while preserving API and integration guidance.

## 0.11.0

### Changed

- Require Veli React ^0.20.0 and record the exact 0.20.0 candidate baseline. The copied-source rendering API and token baseline are unchanged; previous block archives retain their existing requirements.

## 0.10.0

### Changed

- Require Veli React ^0.19.0 and record the exact 0.19.0 candidate baseline. The copied-source rendering API and token baseline are unchanged; previous block archives retain their existing requirements.

## 0.9.0

### Added

- Reuse `ServiceDetailExpandableList` for inline names with a configurable initial count and localized more/less controls. The standard wrapper now uses the same part.

- Compose service label/value rows with `ServiceDetailTable`, an accessible caption and a rounded, divided surface across desktop and mobile layouts.

## 0.8.0

### Added

- Optional compact summary surface for supplementary metadata, with responsive columns and host-owned values.
- Ordered supplementary guideline composition and migration examples, including omitted metadata and multiline checklists.

### Fixed

- Preserve line breaks within prerequisite items without creating additional list entries.

## 0.7.0

### Added

- Compose service pages from reusable layout, summary, content, action, section, download and dialog parts, with consumer-owned fields, ordering and actions. The existing props-based `ServiceDetail` remains available and uses the same parts.
- Add optional per-service application and processing time breakdowns, independently expandable with keyboard and touch controls.
- Supply custom summary icons, accessible information controls and either value/caret or show/hide disclosure triggers.

### Changed

- Show fee details beneath the fee summary in a nested description list, with a caret on the existing show/hide control and reduced-motion support.
- Keep custom sections and actions inside one shared content surface, avoiding repeated rounded edges between sections.
- Require only guideline-specific labels when using the guideline part directly; existing complete label dictionaries remain supported.

### Fixed

- Reserve space around inline disclosure controls so focus rings stay clear of labels and adjacent values.

- Match custom controls and dialog close buttons to Veli’s 2px focus ring and surface-colored gap, with a visible outline in forced-colors mode.

- Show one guideline summary state at a time: loading takes precedence over errors, and errors over stale content.
- Open summary information in a native Veli popover on press or touch, retaining the hover/focus tooltip and accessible dismissal and focus return.

## 0.6.0

### Changed

- Support the verified public package baseline: @veli-design/react@^0.18.0, react-aria-components@^1.22.0, @veli-design/tokens@^0.11.0. The copied-source rendering API is unchanged.

## 0.5.2

### Fixed

- Include the merged Dhivehi fee alignment and final-row separator fixes in the public-package source archive.

## 0.5.1

### Changed

- Render decorative icons from the declared Phosphor library dependency instead of copied SVG files, preserving their weights and accessible semantics.

## 0.5.0

### Changed

- Use the public @veli-design React and tokens package names. Migrate application and copied source imports together.

## 0.4.1

### Fixed

- Right-align Dhivehi fee labels and values while preserving the fee grid's column order.
- Hide the bottom borders across the final row of the two-column fee grid, while preserving separators on mobile and above an incomplete final row.

## 0.4.0

### Changed

- Adopt Veli UI 0.17.x and tokens 0.10.x as the supported core package baseline. Upgrade the applicable core packages together before adding or updating this copied block; earlier block versions retain their previous dependency contracts.
- Record the tested core candidate versions for the bilingual typography and subtle-button color update. Block APIs and authored source are unchanged.

## 0.3.0

### Added

- Support an explicit compact heading gap for guideline introductory sections.

### Fixed

- Place expanded fees before processing/eligibility metadata and retain the designed trailing grid inset.
- Use semantic link colors, the filled inactive platform information icon, and the 20px desktop guideline close icon.
- Match default/introductory guideline heading gaps and inactive TOC padding; preserve visible platform labels in accessible names.

## 0.2.0

### Added

- Match the updated mobile guideline sheet with a floating, dismissible table of contents.
- Support action appearances and decorative trailing icons for cancellation downloads and external-platform calls to action.
- Add realistic fictional EN/DV examples, distinct application notices and steps, and coverage of every Figma apply type and summary expansion state.

### Fixed

- Match the external Start arrow's 20px Bold Figma variant in the shared example and action slot.
- Keep long service names readable without expansion, and keep expansion controls within the card.
- Reuse unavailable/loading states for empty guideline and summary content instead of opening blank views.
- Preserve spacing between isolated numbers and Dhivehi currency text, with localized numeric typography.
- Track the final guideline section at the native scroll boundary without adding space; preserve explicit TOC selections until manual input resumes.
- Align expanded service-list controls, space manual form details, localize the Dhivehi fee summary and isolate mixed-script display values.
- Remove preview disclaimer banners and clarify the online-plus-external and unavailable-content examples.
- Omit the summary area when metadata is empty and no services are supplied.
- Match the Figma platform trigger's neutral hover pill.
- Restore ordinary and nested guideline list markers under Tailwind Preflight, and apply the EN/DV Veli typography tokens to section headings.

## 0.1.0

### Added

- Experimental Services summary, fees, manual form actions, prerequisites, applying information and guideline sheet with caller-owned content, labels and navigation.
