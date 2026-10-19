## Ownership and prerequisites

This experimental block is editable source for internal teams with access to Veli's restricted GitHub Packages. Install tokens and primitives through the existing [Veli setup guide](/docs/). Do not install the private blocks workspace.

`SiteShell` is the page frame only: raised viewport column, rounded main surface, and overlay chrome fade. Applications own the site header, footer, session, search palette, routing, draft-mode notices, translations, and persistence. Compose the [site-header](/blocks/site-header/), [site-footer](/blocks/site-footer/), and [preview-banner](/blocks/preview-banner/) blocks (or your own equivalents) through the `header`, `footer`, and `notices` slots.

## Installation

Configure `@tradenetcorp:registry=https://npm.pkg.github.com` and use your existing package-read credentials. Never commit credentials.

```sh
corepack pnpm add react@19.2.6 react-dom@19.2.6 motion@12.42.2 @tradenetcorp/veli-tokens@0.9.1
```

Use Tailwind 4 with your framework's integration. In your global stylesheet:

```css
@import 'tailwindcss';
@import '@tradenetcorp/veli-tokens/tailwind';
```

The composed header, footer, and preview banner blocks list their own Veli UI requirements.

Initialize Veli Blocks and add the shell (and usually the preview banner):

```sh
corepack pnpm dlx @tradenetcorp/veli init
corepack pnpm dlx @tradenetcorp/veli add site-shell
corepack pnpm dlx @tradenetcorp/veli add preview-banner
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

For gov.mv, keep `useFrontendSession`, `SearchPalette`, `getDraftModeNotices`, and `useCopy` in the application. Mount site-header in `header`, site-footer (with the signed-out theme toggle) in `footer`, preview-banner in `notices`, and call the header handle’s `closeOverlays` / `focusLogo` from the search palette. Adoption and real identity regression tests remain tracked separately.

## Accessibility and responsive behavior

Preserve the single `main` landmark and chrome fade that sets `aria-hidden`, `inert`, and disables pointer events while overlays are open so faded content leaves the tab order. Respect `prefers-reduced-motion`. Manual screen-reader and device testing remains part of adopting an experimental block.

## Updating your copy

1. Run `veli status` and read the new block changelog and dependency requirements. Updating Veli UI alone does not update this source.
2. Run `veli update site-shell`. The CLI verifies both releases and performs a three-way merge using your saved original, customized working file, and the new canonical source.
3. Resolve any labelled conflicts, then run `veli update --continue site-shell`; use `--abort` to restore the pre-update working copy.
4. Run your application's build, interaction, and accessibility checks and commit the updated working copy and baseline together.

## Non-goals

The block does not discover sessions, sign users in, implement account switching or logout, run site search, resolve draft-mode cookies, navigate, persist preferences, or send analytics. It contains no govmv-web, OneGov, Ory, Next.js, environment-variable or service-client imports. It does not embed site-header, site-footer, or preview-banner source; compose those blocks (or host equivalents) through slots. It introduces no registry, CLI capability, or npm package.
