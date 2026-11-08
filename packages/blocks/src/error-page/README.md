## Core package baseline

Version 0.6.0 targets Veli React 0.19.x and tokens 0.11.x. Install the applicable new core versions
before adding or updating this application-owned source. The approved typography
metrics and subtle-button colors can change wrapping and element height. Previous
block archives retain their existing requirements.

## Ownership and prerequisites

An experimental composition of Veli typography and links with artwork from Basim Abdullah’s ENG-3733 prototype, adapted from [govmv-web PR #134](https://github.com/tradenetcorp/govmv-web/pull/134) at `e590a6786325fcda0c508e9fe8ca279e46670fd2`. The block contains no application routes, translations, authentication or connectivity policy. It never reloads the browser automatically or displays exception details.

## Installation

Follow the [Veli setup guide](/docs/), then install dependencies and copy the block:

```sh
corepack pnpm add @veli-design/react@0.19.0 @veli-design/tokens@0.11.0 react@19.2.6 react-dom@19.2.6 react-aria-components@1.22.0 motion@12.42.2
corepack pnpm dlx @veli-design/cli init
corepack pnpm dlx @veli-design/cli add error-page
```

Import the copied `error-page.tsx` directly. Use Tailwind 4 and import `tailwindcss`, `@veli-design/tokens/tailwind` and `@veli-design/react/tailwind` in your global stylesheet. Add an explicit `@source` if copied files are outside Tailwind’s source tree. Keep every artwork module listed in the manifest; no JSON-module compiler setting or runtime font sampling is needed.

Wrap the application in `VeliProvider` and follow the [provider guide](/docs/provider/) for language, direction, fonts and theme initialization. The block inherits `en`/`dv` and light/dark/system behavior without changing document attributes or saving preferences.

## API

`kind` selects `401`, `403`, `404`, `500`, `503`, or `offline` artwork. Applications supply `title`, `description`, `detail` and `artworkLabels: { changeStyle }`. Describe the illustration and style-change action in `changeStyle`. All labels must be translated. `description` preserves newlines. The example message module is application-owned sample content, not a translation service bundled into the block.

Optional `primaryAction`, `secondaryAction` and `report.action` use the same discriminated type:

- `{ type: 'link', label, href, target?, rel? }` navigates to an application-resolved URL.
- `{ type: 'button', label, onPress, isPending?, isDisabled? }` invokes an application callback. Pending disables activation and exposes `aria-busy`; applications manage asynchronous work and failures. Callback actions use Veli Link’s `onPress` without an `href`, keeping recovery sentences such as “Try again or Return home” inline. React Aria renders these as `<span role="link">` with Enter activation, rather than button semantics. The historical `type: 'button'` action discriminator selects callback behavior, not the rendered element. No primitive styles are overridden.

`actionSeparator` is shown only between two supplied actions. Omitted actions produce no separator. `report: { prompt, action }` supplies the optional row beneath `detail`. `renderLink` follows Veli Link’s render contract; forward every supplied prop including the ref. Put router callbacks in a Client Component adapter.

`headingLevel` defaults to `1` and also accepts `2` or `3`. `className` customizes the section. The block is content, not a full-page shell; applications own the `main` landmark, page metadata, navbar and utility footer. It has no dependency on the separate [page navigation footer](/blocks/page-navigation-footer/). Install and compose that block as a sibling when appropriate; omit it on an offline screen if its navigation would not help.

## Artwork and theming

`animation="auto"` is the default. The intro plays once, then the artwork stays still. Activate the artwork with a pointer, Enter or Space to cycle its five styles; each chosen style stays still until the next activation. Fine pointers also influence nearby dots. Reduced motion skips the intro and settles style changes immediately; turning reduced motion off does not replay the intro. `animation="static"` renders the first style without interactive controls.

Animation suspends for hidden tabs and offscreen artwork. Each instance releases its observers, listeners and animation frames on unmount or kind changes. Offline artwork is bundled with the component; other datasets load only when their state is displayed. Failed data loading or unavailable canvas leaves the heading and recovery content usable, without inactive artwork controls. This is not an offline cache or service worker.

The canvas resolves these optional CSS variables on its own element, falling back to Veli tokens in the current provider theme:

| Override              | Default token                        |
| --------------------- | ------------------------------------ |
| `--veli-error-ink`    | `--veli-color-primary-900`           |
| `--veli-error-lagoon` | `--veli-color-primary-alpha-300`     |
| `--veli-error-patch`  | `--veli-color-primary-alpha-400`     |
| `--veli-error-accent` | `--veli-color-button-accent-default` |

Set overrides on the block’s class or an ancestor. Colors are sampled during initialization, provider theme changes and resizing, not on every animation frame. Applications should retain sufficient visual contrast when rebranding.

## Accessibility and validation

The section is labelled by its heading. Canvas pixels are decorative; all information is also supplied as readable text. Controls have application-supplied accessible names. Translated copy wraps at narrow widths, and numerical artwork remains unmirrored in RTL. Keep keyboard focus and link/button semantics when adapting the source.

The consumer fixture covers all six states, EN/DV, themes, narrow screens, enlarged text, routing, pending actions, reduced motion, keyboard artwork interaction and artwork failure. Validate downstream fonts, content, screen readers and devices too.

## Source and updates

[Design reference](https://www.figma.com/design/UJmgh6ihn8EsMuOnwEJrOn/gov.mv?node-id=6811-253046). The checked-in distance fields preserve the supplied prototype’s five styles; do not replace the artwork with generated glyphs or remote Figma images.

Commit both the editable source and `.veli/blocks/error-page` receipt/baseline. Review the changelog, run `veli status`, then `veli update error-page`. Resolve any conflicts before `veli update --continue error-page`, or use `--abort` to restore your previous copy. Run your application’s checks after updates.
