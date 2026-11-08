## 0.11.0

### Added

- Add opt-in `profileOnly` presentation for hosts such as gov.Account and gov.CorpID. These hosts supply their authenticated primary person independently of selected business context. Hide account lists, retrieval/empty states and account-management actions in this mode while retaining sign-out, desktop appearance controls and Veli Sheet.
- Preserve the default account-list API, rendering, callbacks and states used by gov.mv. Existing consumers require no adapter changes.

## 0.10.0

### Changed

- Use Veli Sheet for the mobile account panel, sharing its native swipe, motion, dismissal and focus management. Preserve the profile header, grabber spacing, account content, pinned sign-out and anchored desktop panel.
- Require `@veli-design/react@^0.19.0`. The account-panel rendering and host callback API is unchanged.

## 0.9.0

### Changed

- Require Veli React ^0.19.0 and record the exact 0.19.0 candidate baseline. The copied-source rendering API and token baseline are unchanged; previous block archives retain their existing requirements.

## 0.8.0

### Changed

- Support the verified public package baseline: @veli-design/react@^0.18.0, react-aria-components@^1.22.0, @veli-design/tokens@^0.11.0. The copied-source rendering API is unchanged.

## 0.7.0

### Changed

- Use the public @veli-design React and tokens package names. Migrate application and copied source imports together.

## 0.6.0

### Changed

- Adopt Veli UI 0.17.x and tokens 0.10.x as the supported core package baseline. Upgrade the applicable core packages together before adding or updating this copied block; earlier block versions retain their previous dependency contracts.
- Record the tested core candidate versions for the bilingual typography and subtle-button color update. Block APIs and authored source are unchanged.

## 0.5.0

### Changed

- Require Veli UI 0.16.0 or later in the 0.16 line and tokens 0.9.1 or later in the 0.9 line for the complete eight-block CLI installation. Applications using older UI versions must upgrade before adding or updating this block; earlier versions are not claimed to be broken in isolation. Validated with UI 0.16.0 and tokens 0.9.1 release candidates; repeat a clean registry install after publication.

## 0.4.1

### Fixed

- Align the 44px avatar trigger with adjacent navigation controls and prevent avatar clipping by removing baseline spacing from the panel and shared avatar wrappers. The public API, avatar sizes and 389px desktop panel width are unchanged.

## 0.4.0

### Changed

- Use the maintained `@phosphor-icons/react` package for icons. When upgrading a copied block, install `@phosphor-icons/react@^2.1.10` as a direct dependency. Icon size, color, weight and behavior are retained with the maintained artwork.

## 0.3.0

### Changed

- Reference canonical Veli CSS variables. Require tokens 0.9 and UI 0.15 for the unified token architecture. Keep appearance options aligned when typography metrics change.

## 0.2.1

### Changed

- Use the revised Alert light appearance for account-list failures. Require Veli UI 0.14 and tokens 0.8 for the new Alert API and colours.

## 0.2.0

### Added

- Show three accessible skeleton account rows during loading, retaining the selected profile and sign-out action and respecting reduced motion.
- Keep an avatar ring visible while the panel is open.
- Replace pending account-row avatars with a spinner in the same 44px footprint, retaining names and accessible status and respecting reduced motion without changing the Avatar primitive.

### Changed

- Match notification hover/pressed colors and Figma muted secondary text, raised panel surfaces, mobile notch color, and 24px notch-to-profile spacing.
- Build the mobile sheet directly with headless React Aria primitives, moving the surface and content together during dragging without Veli Modal overrides. Use non-spring transitions, retain the released drag position during dismissal, and reveal the close control only on keyboard-visible focus. Keep profile content naturally sized above the pinned footer.
- Require `onAccountSelect` and render every additional account as an action. Hosts must supply switching and omit accounts they cannot select.
- Remove visible pending captions from account rows and action buttons, retaining buttons' built-in spinner and accessible status announcements.
- Present account-list retrieval failures with Veli Alert's subtle danger variant.
- Keep profile names and email centered beneath the avatar in both directions, and right-align account-row text in RTL layouts. Storybook's toolbar translates all sample content to Dhivehi except email addresses; use the toolbar instead of separate Dark/Dhivehi stories.
- Allow independent secondary-text language/direction metadata so Latin emails retain English font size and line height in Dhivehi layouts while translated subtitles retain Dhivehi typography.
- Declare the desktop theme selector horizontal so arrow-key navigation follows the visual order in both LTR and RTL.
- Use the regular Dhivehi body style for theme option labels, retaining the medium English style and shared typography tokens.
- Match Veli Modal's designer-approved scrim: hard black at 60% with 6px backdrop blur in both light and dark modes, without adding tokens.

### Removed

- Remove display-only accounts, account/action and appearance disabled props, and `labels.disabled`. Keep the top-level avatar trigger `isDisabled` for shell coordination and pending state for actions.
- Remove account/action `error` props and inline action errors. Consumers present action failures through toasts or notifications; panel-level account-list retrieval errors remain supported.

## 0.1.5

### Changed

- Use a custom React Aria account-row button with subtle Veli hover/pressed colors and visible keyboard focus, preserving pending/disabled behavior without primitive layout overrides, press scaling, or ripple animation.
- Improve secondary-text contrast against the row's interaction backgrounds in light and dark themes.

## 0.1.4

### Changed

- Extend the desktop scroll area to the footer border, keeping content spacing inside the scroll area so overflowing accounts clip at the divider.

## 0.1.3

### Changed

- Align the desktop footer with the corrected design: a full-width top border above the theme selector and sign-out action, with no divider between them.

## 0.1.2

### Changed

- Reduce the theme selection pill's spring overshoot, including the longer movement between Light and Auto.

## 0.1.1

### Changed

- Animate the appearance selection pill with Veli spring easing and slow-duration motion tokens, including RTL movement and immediate reduced-motion updates.

## 0.1.0

### Added

- Experimental responsive account panel with generic controlled account data, localized actions, desktop appearance selection, and mobile drag dismissal.
- React Aria overlay semantics, keyboard and focus management, RTL, theme, and reduced-motion support.
