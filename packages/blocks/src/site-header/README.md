## Core package baseline

Version 0.14.0 targets Veli React 0.20.x and tokens 0.11.x. Install the applicable new core versions
before adding or updating this application-owned source. The approved typography
metrics and subtle-button colors can change wrapping and element height. Previous
block archives retain their existing requirements.

## Ownership and prerequisites

This experimental block is editable source for applications using Veli's public npm packages. Install tokens and primitives through the existing [Veli setup guide](/docs/). Do not install the private blocks workspace. Applications own translations, URLs, logos, routing, authentication, and search.

## Installation

Public npm installation needs no credentials. Configure the compatible Blocks registry URL.

```sh
corepack pnpm add @veli-design/react@0.20.0 @veli-design/tokens@0.11.0 react@19.2.6 react-dom@19.2.6 react-aria-components@1.22.0 motion@12.42.2 @phosphor-icons/react@2.1.10
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
    radial-gradient(circle at 50% 0%, rgb(155 180 155 / 0.04) 0%, rgb(44 66 11 / 0.09) 100%)
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
    linear-gradient(to bottom, var(--veli-color-green-200) 0%, transparent 32.5%)
  );
}

.dark {
  --veli-header-site-tile-gradient: var(
    --site-tile-gradient,
    radial-gradient(circle at 50% 0%, rgb(14 14 13 / 0.4) 0%, rgb(37 38 36 / 0.55) 100%)
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

- `logo` (ReactNode) and optional `title` for ministry mode. The title wraps within 320px and the bar grows with it. It does not truncate.
- `pathname` so scroll mode resets on navigation.
- `desktopNavItems` / `mobileNavItems`: `{ href, label, current?, external? }`.
- `apps` / `sites`: switcher tiles with `id`, `name`, `kind`, `href`, `description`, optional artwork URLs, `current`, `badge: 'signin'`, `external`, `sections`, and optional `infoParagraphs` (bold lead-in + body; replaces the title/description/sections info-card layout when set). Use `current` for “You are here”; use `badge: 'signin'` when the destination requires authentication (independent flags — avoid setting both on one tile).
- `skipToMainHref` (optional, default `#main-content`): target of the "Skip to main content" link, which is the first tab stop. [site-shell](/blocks/site-shell/) renders a matching `main`. A standalone host sets `id="main-content"` and `tabIndex={-1}` on its own `main`, or passes the id of its main landmark here.
- `labels`: every user-facing string, including `skipToMain`, `scrollToViewMore`, `searchSummary`, `showingApps`, `showingSites`, `noAppsMatch`, `noSitesMatch`, `noAppsOrSitesMatch`, and `searchEmptyHint`. `showAll`, `appsOnly`, and `sitesOnly` label the switcher filter. `showingApps` and `showingSites` supply the filtered result line ("Showing all Sites: " plus the count). Sites render in the order supplied; that order is the default directory order. Demo copy uses “Browse government apps and sites”, the longer intro line, and search placeholder “Start typing...”.
- `languages`, `language`, `onLanguageChange`.
- `colorScheme`, `onColorSchemeChange` (`light` | `dark` | `system`).
- `onNavigate(href)` for in-app switcher tiles.
- `flagSrc` for the official-website banner.
- `actions` (ReactNode): search, sign-in, or account controls. From the `sm` breakpoint (640px) up, the header renders this slot in the bar. Below 640px, the bar does not render it, and the mobile menu renders it instead while the menu is open, unless you set `mobileActions`. Each action is mounted once, so use stateful controls only through one of these slots. The header fades this slot while overlays are open.
- `mobileActions`: optional actions inside the mobile menu below 640px. Pass a React node, or a function that receives `{ closeMenu }`. Pass `null` to show no actions in the menu. When you omit `mobileActions`, the menu uses `actions`. Static `actions` and static `mobileActions` close the menu when you activate a button or link that is not disabled, pending, or a popup trigger. Pass a function when you want to call `closeMenu` yourself.
- `barActions` (ReactNode): optional compact controls that stay in the header bar at every width. The header renders them after `actions` and before the mobile menu button. Use them for signed-in notification and account triggers when search moves into the mobile menu.
- Optional `renderNavLink` for framework routers.
- Optional `onOverlayChange({ switcherOpen, switcherRendered, mobileMenuVisible })` for page-shell chrome coordination. Fade main/footer while `switcherOpen || mobileMenuVisible`; hide notices while `switcherRendered || mobileMenuVisible`.
- Optional ref handle: `closeOverlays()` and `focusLogo()`. `focusLogo` skips moving focus when another control already owns it (for example a search palette).

Keep labels, routing, authentication, API calls, account panels, and persistence in the application. Put router render callbacks in a client adapter.

## Accessibility and responsive behavior

Keep the skip link as the first tab stop. It shows only while focused, sits at the inline start edge in English/LTR and Dhivehi/RTL, and is inert while the app switcher or mobile menu is open because the main landmark is inert then. Preserve the header landmark, dialog semantics when the app switcher expands, Escape dismissal, and focus return to the logo trigger. Apps and sites are a React Aria listbox in a grid for Show all, Apps only, and Sites only. The card body scrolls. "Scroll to view more" is a button shown only while that body is at the top and more tiles sit below. While it is hidden it is removed from pointer and keyboard access. Arrow keys move the highlight (hover treatment, without a focus ring) and Enter opens the highlighted app or site. Link groups and language controls must keep readable names in English/LTR and Dhivehi/RTL. The official banner shows the target language as a direct switch for the two configured languages. Respect `prefers-reduced-motion` (the scroll control still appears, and its scroll is instant). Desktop navigation is shown from 1121px wide. At 1120px and below, the header uses the mobile menu. Below 640px, `actions` render inside that menu instead of the header bar. From 640px up, `actions` stay in the bar, and the open menu does not repeat them. When a mobile-menu action closes the menu, focus returns to the menu button unless the action moved focus elsewhere. `barActions` stay in the bar at every width. Manual screen-reader and device testing remains part of adopting an experimental block.

## Updating your copy

1. Run `veli status` and read the new block changelog and dependency requirements. Updating Veli UI alone does not update this source.
2. Run `veli update site-header`. The CLI verifies both releases and performs a three-way merge using your saved original, customized working file, and the new canonical source.
3. Resolve any labelled conflicts, then run `veli update --continue site-header`; use `--abort` to restore the pre-update working copy.
4. Run your application's build, interaction, and accessibility checks and commit the updated working copy and baseline together.
