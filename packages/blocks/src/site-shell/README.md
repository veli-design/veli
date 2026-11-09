## Core package baseline

Version 0.5.0 targets tokens 0.11.x. Install the applicable new core versions
before adding or updating this application-owned source. The approved typography
metrics and subtle-button colors can change wrapping and element height. Previous
block archives retain their existing requirements.

## Ownership and prerequisites

This experimental block is editable source for applications using Veli's public npm packages. Install tokens and primitives through the existing [Veli setup guide](/docs/). Do not install the private blocks workspace.

`SiteShell` is the page frame only: raised viewport column, rounded main surface, and overlay chrome fade. Applications own the site header, footer, session, search palette, routing, draft-mode notices, translations, and persistence. Compose the [site-header](/blocks/site-header/), [site-footer](/blocks/site-footer/), and [preview-banner](/blocks/preview-banner/) blocks (or your own equivalents) through the `header`, `footer`, and `notices` slots.

## Installation

Public npm installation needs no credentials. Configure the compatible Blocks registry URL.

```sh
corepack pnpm add react@19.2.6 react-dom@19.2.6 motion@12.42.2 @veli-design/tokens@0.11.0
```

Use Tailwind 4 with your framework's integration. In your global stylesheet:

```css
@import 'tailwindcss';
@import '@veli-design/tokens/tailwind';
```

The composed header, footer, and preview banner blocks list their own Veli UI requirements.

Initialize Veli Blocks and add the shell (and usually the preview banner):

```sh
corepack pnpm dlx @veli-design/cli init
corepack pnpm dlx @veli-design/cli add site-shell
corepack pnpm dlx @veli-design/cli add preview-banner
```

The CLI copies the inventory into the configured Blocks directory and retains originals under `.veli/blocks/site-shell/`. Import the editable working copy directly and commit both it and `.veli`. Files outside Tailwind's normal source tree require an explicit `@source` path relative to your stylesheet.

Wrap the application in `VeliProvider` with `language="en"` or `language="dv"`, and `colorScheme="light"`, `"dark"`, or `"system"`. The shell does not write document attributes or persist preferences.

## API

`SiteShell` is a client component.

| Prop               | Contract                                                                                                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `header`           | Required React node, typically the site-header block.                                                                                                                         |
| `children`         | Page content rendered inside the raised, rounded `main` landmark.                                                                                                             |
| `footer`           | Optional React node, typically the site-footer block. Fades with the main column while overlays are open.                                                                     |
| `notices`          | Optional React node slot for the preview-banner block (or equivalent). Mount it here so its scroll spacer participates in the page flex column only when notices are present. |
| `overlay`          | Optional `{ switcherOpen?, switcherRendered?, mobileMenuVisible? }` from site-header’s `onOverlayChange`. Main and footer fade while `switcherOpen \|\| mobileMenuVisible`.   |
| `contentClassName` | Optional classes on the padded main wrapper (for example page-specific horizontal padding).                                                                                   |
| `className`        | Optional classes on the root column.                                                                                                                                          |

Wire site-header’s `onOverlayChange` into `overlay`. Pass `hidden={overlay.switcherRendered \|\| overlay.mobileMenuVisible}` to the preview banner in the `notices` slot. Keep a header ref for `closeOverlays()` and `focusLogo()` when mounting a search palette or other modal that must dismiss shell overlays and restore focus.

## Host adapter pattern

Keep session discovery, tenant filtering, sign-in/out, Cmd/Ctrl+K search, draft-mode notice resolution, and locale copy in the application. Map header overlay state into `overlay` and into the preview banner’s `hidden` prop. Put framework `Link` renderers on the header and footer adapters, not inside this block.

Mount site-header in `header`, site-footer in `footer`, and preview-banner in
`notices`. Call the header handle’s `closeOverlays` / `focusLogo` from application
search controls. Validate authenticated identity flows in the consuming application.

## Accessibility and responsive behavior

Preserve the single `main` landmark and chrome fade that sets `aria-hidden`, `inert`, and disables pointer events while overlays are open so faded content leaves the tab order. Respect `prefers-reduced-motion`. Manual screen-reader and device testing remains part of adopting an experimental block.

## Updating your copy

1. Run `veli status` and read the new block changelog and dependency requirements. Updating Veli UI alone does not update this source.
2. Run `veli update site-shell`. The CLI verifies both releases and performs a three-way merge using your saved original, customized working file, and the new canonical source.
3. Resolve any labelled conflicts, then run `veli update --continue site-shell`; use `--abort` to restore the pre-update working copy.
4. Run your application's build, interaction, and accessibility checks and commit the updated working copy and baseline together.

## Non-goals

The block does not discover sessions, sign users in, implement account switching or logout, run site search, resolve draft-mode cookies, navigate, persist preferences, or send analytics. It contains no identity-provider, framework, environment-variable or service-client imports. It does not embed site-header, site-footer, or preview-banner source; compose those blocks (or host equivalents) through slots. It introduces no registry, CLI capability, or npm package.
