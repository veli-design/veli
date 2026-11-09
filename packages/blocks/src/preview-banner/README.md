## Core package baseline

Version 0.7.0 targets Veli React 0.20.x and tokens 0.11.x. Install the applicable new core versions
before adding or updating this application-owned source. The approved typography
metrics and subtle-button colors can change wrapping and element height. Previous
block archives retain their existing requirements.

## Ownership and prerequisites

This experimental block is editable source for applications using Veli's public npm packages. Install tokens and primitives through the existing [Veli setup guide](/docs/). Do not install the private blocks workspace.

`PreviewBanner` is a floating fixed bottom banner with a measured scroll spacer so page content is not covered. It renders nothing when `notices` is empty, so site-shell only reserves bottom space when a banner is mounted with notices. Applications own draft-mode cookies, notice resolution, translations, and action URLs. Compose it in the [site-shell](/blocks/site-shell/) `notices` slot (or any flex column that should reserve bottom space).

## Installation

Public npm installation needs no credentials. Configure the compatible Blocks registry URL.

```sh
corepack pnpm add @phosphor-icons/react@2.1.10 @veli-design/react@0.20.0 @veli-design/tokens@0.11.0 react@19.2.6 react-dom@19.2.6 react-aria-components@1.22.0
```

Use Tailwind 4 with your framework's integration. In your global stylesheet:

```css
@import 'tailwindcss';
@import '@veli-design/tokens/tailwind';
@import '@veli-design/react/tailwind';
```

Initialize Veli Blocks and add the banner:

```sh
corepack pnpm dlx @veli-design/cli init
corepack pnpm dlx @veli-design/cli add preview-banner
```

The CLI copies `preview-banner.tsx` into the configured Blocks directory and retains originals under `.veli/blocks/preview-banner/`. Import the editable working copy directly and commit both it and `.veli`. Files outside Tailwind's normal source tree require an explicit `@source` path relative to your stylesheet.

Wrap the application in `VeliProvider` with `language="en"` or `language="dv"`, and `colorScheme="light"`, `"dark"`, or `"system"`. The block does not write document attributes or persist preferences.

## API

`PreviewBanner` is a client component.

| Prop      | Contract                                                                                                                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `notices` | Required serializable `{ id, title, message, previewStatus?, statusLabel?, action?: { href, label } }[]`. Empty arrays render nothing (no spacer).                                            |
| `hidden`  | Optional. When true, the fixed stack is inert, `aria-hidden`, and not visible, while the scroll spacer still reserves space. Use while a shell overlay (app switcher or mobile menu) is open. |

Notice actions use a native `Button as="a"` so exiting draft preview stays a full document navigation (for example clearing a server-side preview cookie). Supply translated labels and fully resolved URLs.

`previewStatus` of `draft` or `published` drives the outline status badge intent (`warning` / `positive`) and pulsing indicator color. Omit it for a neutral indicator. Exit actions render with a SignOut icon and secondary transparent (subtle) styling at every breakpoint. On small screens the card stacks ping/title/status above a message + exit row; from `lg` it is a single horizontal pill.

## Host adapter pattern

Keep `draftMode()`, exit-preview routes, and locale copy in the application. For gov.mv, map `getDraftModeNotices` into `notices` and wire `hidden` from site-header’s `onOverlayChange` (`switcherRendered || mobileMenuVisible`). Mount the banner in site-shell’s `notices` slot so the spacer participates in the page flex column only when notices are present.

## Accessibility and responsive behavior

Each notice is an `aside` labelled by its title. Below `lg` the card stacks the status indicator, meta row, and exit action; from `lg` up it becomes a single horizontal pill. The fixed region matches the floating header width and edge insets. The measured spacer includes safe-area padding so the footer is not covered. Pulsing indicators stop under `prefers-reduced-motion` (via `motion-safe:`). Manual screen-reader and device testing remains part of adopting an experimental block.

## Updating your copy

1. Run `veli status` and read the new block changelog and dependency requirements. Updating Veli UI alone does not update this source.
2. Run `veli update preview-banner`. The CLI verifies both releases and performs a three-way merge using your saved original, customized working file, and the new canonical source.
3. Resolve any labelled conflicts, then run `veli update --continue preview-banner`; use `--abort` to restore the pre-update working copy.
4. Run your application's build, interaction, and accessibility checks and commit the updated working copy and baseline together.

## Non-goals

The block does not enable draft mode, clear preview cookies, resolve CMS publication status, navigate, or translate copy. It contains no govmv-web, Payload, Next.js, environment-variable or service-client imports. It introduces no registry, CLI capability, or npm package.
