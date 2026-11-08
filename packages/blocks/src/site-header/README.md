## Core package baseline

Version 0.11.1 targets Veli React 0.19.x and tokens 0.11.x. Install the applicable new core versions
before adding or updating this application-owned source. The approved typography
metrics and subtle-button colors can change wrapping and element height. Previous
block archives retain their existing requirements.

## Ownership and prerequisites

This experimental block is editable source for applications using Veli's public npm packages. Install tokens and primitives through the existing [Veli setup guide](/docs/). Do not install the private blocks workspace. Applications own translations, URLs, logos, routing, authentication, and search.

## Installation

Public npm installation needs no credentials. Configure the compatible Blocks registry URL.

```sh
corepack pnpm add @veli-design/react@0.19.0 @veli-design/tokens@0.11.0 react@19.2.6 react-dom@19.2.6 react-aria-components@1.22.0 motion@12.42.2 @phosphor-icons/react@2.1.10
```

Use Tailwind 4 with your framework's integration. In your global stylesheet:

```css
@import 'tailwindcss';
@import '@veli-design/tokens/tailwind';
@import '@veli-design/react/tailwind';
```

Optional host CSS variables (built-in fallbacks match the gov.mv reference, including dark mode). Prefer the `--veli-header-*` names. If you already ship the older gov.mv names (`--ease-drawer`, `--site-tile-gradient`, `--info-panel-glow`), alias them:

```css
:root {
  --veli-header-ease-drawer: var(--veli-ease-drawer, cubic-bezier(0.32, 0.72, 0, 1));
  --veli-header-site-tile-gradient: var(
    --site-tile-gradient,
    radial-gradient(circle at 50% 0%, #fbfcfb 0%, #e0e2dd 100%)
  );
  --veli-header-govmv-tile-gradient: radial-gradient(
    circle at 50% 2%,
    #5bccca 0%,
    #47a8a9 25%,
    #348388 50%,
    #205f68 75%,
    #0c3a47 100%
  );
  --veli-header-info-panel-glow: var(
    --info-panel-glow,
    radial-gradient(ellipse 100% 80% at 50% 0%, rgb(213 255 211) 0%, rgb(255 255 255 / 0%) 63%)
  );
}

.dark {
  --veli-header-site-tile-gradient: var(
    --site-tile-gradient,
    radial-gradient(circle at 50% 0%, #0e0e0d 0%, #191a18 50%, #252624 100%)
  );
  --veli-header-info-panel-glow: var(
    --info-panel-glow,
    radial-gradient(
      ellipse 236.72% 100% at 50% 0%,
      rgb(35 115 10) 0%,
      rgb(18 57 5 / 50%) 31.478%,
      transparent 62.957%
    )
  );
}
```

Initialize Veli Blocks and add the header:

```sh
corepack pnpm dlx @veli-design/cli init
corepack pnpm dlx @veli-design/cli add site-header
```

The CLI copies the inventory into the configured Blocks directory and retains originals under `.veli/blocks/site-header/`. Import the editable working copy directly and commit both it and `.veli`. Files outside Tailwind's normal source tree require an explicit `@source` path relative to your stylesheet.

Wrap the application in `VeliProvider` with `language="en"` or `language="dv"`, and `colorScheme="light"`, `"dark"`, or `"system"`. The header does not write document attributes or persist preferences.

## API

`SiteHeader` is a client component. Supply serializable data and application-owned callbacks:

- `logo` (ReactNode) and optional `title` for ministry mode.
- `pathname` so scroll mode resets on navigation.
- `desktopNavItems` / `mobileNavItems`: `{ href, label, current?, external? }`.
- `apps` / `sites`: switcher tiles with `id`, `name`, `kind`, `href`, `description`, optional artwork URLs, `current`, `badge: 'signin'`, `external`, and `sections`. Use `current` for “You are here”; use `badge: 'signin'` when the destination requires authentication (independent flags — avoid setting both on one tile).
- `labels`: every user-facing string, including `searchSummary`, `showingApps`, `showingSites`, `noAppsMatch`, `noSitesMatch`, and `noAppsOrSitesMatch` functions. `showAll`, `appsOnly`, and `sitesOnly` label the switcher filter. Sites render in the order supplied; that order is the default directory order.
- `languages`, `language`, `onLanguageChange`.
- `colorScheme`, `onColorSchemeChange` (`light` | `dark` | `system`).
- `onNavigate(href)` for in-app switcher tiles.
- `flagSrc` for the official-website banner.
- `actions` (ReactNode): search, sign-in, or account controls. The header fades this slot while overlays are open.
- Optional `renderNavLink` for framework routers.
- Optional `onOverlayChange({ switcherOpen, switcherRendered, mobileMenuVisible })` for page-shell chrome coordination. Fade main/footer while `switcherOpen || mobileMenuVisible`; hide notices while `switcherRendered || mobileMenuVisible`.
- Optional ref handle: `closeOverlays()` and `focusLogo()`. `focusLogo` skips moving focus when another control already owns it (for example a search palette).

Keep labels, routing, authentication, API calls, account panels, and persistence in the application. Put router render callbacks in a client adapter.

## Accessibility and responsive behavior

Preserve the header landmark, dialog semantics when the app switcher expands, Escape dismissal, and focus return to the logo trigger. The switcher apps and sites are a React Aria listbox: Show all uses a grid layout, Apps only and Sites only use a stack. Arrow keys move the highlight (hover treatment, without a focus ring) and Enter opens the highlighted app or site. Link groups and language controls must keep readable names in English/LTR and Dhivehi/RTL. The official banner shows the target language as a direct switch for the two configured languages. Respect `prefers-reduced-motion`. Manual screen-reader and device testing remains part of adopting an experimental block.

## Updating your copy

1. Run `veli status` and read the new block changelog and dependency requirements. Updating Veli UI alone does not update this source.
2. Run `veli update site-header`. The CLI verifies both releases and performs a three-way merge using your saved original, customized working file, and the new canonical source.
3. Resolve any labelled conflicts, then run `veli update --continue site-header`; use `--abort` to restore the pre-update working copy.
4. Run your application's build, interaction, and accessibility checks and commit the updated working copy and baseline together.
