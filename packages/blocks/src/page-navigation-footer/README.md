## Core package baseline

Version 0.3.0 targets Veli UI 0.17.x and tokens 0.10.x. Install the applicable new core versions
before adding or updating this application-owned source. The approved typography
metrics and subtle-button colors can change wrapping and element height. Previous
block archives retain their existing requirements.

## Ownership and prerequisites

This experimental block renders an inner page navigation section: organization identity, optional description/address, navigation groups, and social/contact links. It is separate from the compact [site footer](/blocks/site-footer/) and can be used on error pages or other application pages.

Logos, organization details, link labels, icons and destinations come from the consuming application. The block supplies the reference EN/DV section headings using Veli provider language. The block does not bundle or default to the Maldives government emblem.

## Installation

Follow the [Veli setup guide](/docs/), then install dependencies and copy the block:

```sh
corepack pnpm add @tradenetcorp/veli-ui@0.17.0 @tradenetcorp/veli-tokens@0.10.0 react@19.2.6 react-dom@19.2.6 react-aria-components@1.19.0 @phosphor-icons/react@2.1.10
corepack pnpm dlx @tradenetcorp/veli init
corepack pnpm dlx @tradenetcorp/veli add page-navigation-footer
```

Import the copied `page-navigation-footer.tsx` directly. Use Tailwind 4 and import `tailwindcss`, `@tradenetcorp/veli-tokens/tailwind` and `@tradenetcorp/veli-ui/tailwind` in your global stylesheet. Files outside Tailwind’s normal source tree require an explicit `@source` path.

Wrap the application in `VeliProvider`. Follow the [provider guide](/docs/provider/) for fonts, direction and theme initialization. This block inherits language and color scheme without changing document attributes or persisting preferences. It does not require the error-page block.

## API

Supply a translated section `label` and optional `identity: { logo?, name, description? }`. `logo` is application-supplied React content, allowing a local image, an SVG component or theme-aware branding. Give informative logos an accessible name or use empty alt text when adjacent organization text already supplies it. Set its intrinsic dimensions in the application; the block caps the mobile logo at 48px wide and preserves its aspect ratio. `description` preserves line breaks for an address and can be omitted entirely.

`internalLinks` and `externalLinks` are ordered arrays of `{ id, label, href, target?, rel? }`. IDs must be stable and unique within each list. Empty lists are omitted. The headings are fixed: “Jump to” / “ބައިތަކަށް ދިއުން” and “Useful links” / “ބޭނުންތެރި ލިންކުތައް”. External resources always show a directional marker that inherits Veli Link’s color. Internal links can additionally set `external` when a destination needs a marker. A marker does not imply opening a new tab. Explicit `target="_blank"` defaults to `rel="noopener noreferrer"` unless the application supplies `rel`.

`socialLinks` accepts the same link data plus a decorative React `icon`. Supply a translated `socialLabel` whenever social links exist. Each link’s `label` is its accessible name. No social network, email address or icon is hardcoded into the block. Use bold Phosphor icons to match the examples; other icon libraries remain supported.

`renderLink` follows Veli Link’s renderer contract; forward all supplied props including the ref. Ordinary anchors work without an adapter. `className` customizes the outer section.

## Responsive behavior and accessibility

The section contains a divider and a centered content area capped at 936px. At tablet/desktop sizes (at least 700px of section content, including a 768px viewport), identity/social content sits beside two navigation columns. Smaller screens stack the same data. Identity text is capped at 361px in EN and 300px on mobile in DV, with natural wrapping for longer names and addresses. Logical alignment and external-link arrows follow LTR/RTL. Labels, addresses and groups wrap without clipping, including enlarged text.

DOM order follows the localized reference: identity, social links, navigation in EN; identity, navigation, social links in DV. Each language retains its DOM order across breakpoints, so keyboard order never changes with the layout. The section uses a translated accessible name and separately named navigation landmarks. It deliberately does not create a page-level `contentinfo` landmark, so it can coexist with the utility footer.

Do not substitute breakpoint-specific organization data or hide links on small screens. Applications can omit optional address, logo, social links, or groups independently. The entire block is omitted when no content is supplied.

The reference `text-base-subtle` heading color does not meet AA text contrast at the English 18px and mobile Dhivehi 15px sizes. The consumer accessibility checks intentionally flag this design limitation; choose a darker local heading token when AA contrast is required.

The fixture exercises standalone use, composition with error content and the utility footer, EN/DV, light/dark themes, long labels, enlarged text, keyboard navigation, external links and a supplied logo. Applications own validating their fonts, translations, branding and downstream accessibility.

## Design reference and updates

Based on the [inner navigation footer](https://www.figma.com/design/UJmgh6ihn8EsMuOnwEJrOn/gov.mv?node-id=6811-247349) and its mobile/Dhivehi counterparts. Ministry details and the emblem shown there are example application content.

Commit the editable source and `.veli/blocks/page-navigation-footer` baseline together. Run `veli status`, review the changelog, and apply `veli update page-navigation-footer`. Resolve conflicts and use `veli update --continue page-navigation-footer`, or `--abort` to restore the previous copy. Validate your application after updating.

## Link styling decision

Navigation links use the existing Veli Link `secondary` intent and `hover` underline. The block does not override label or arrow colors; Link controls their default, hover, pressed and disabled styling. Directional mirroring remains part of the footer’s RTL composition.

The GOV.MV Figma footer differs: its EN instances override the shared Default Link to use strong label text and base icon colors; desktop DV rows are detached frames with that treatment, while mobile DV instances retain link-colored arrows. The block deliberately follows the current Veli Link variant rather than reproducing these local design overrides. No Link primitive change is included.

## Social control design differences

Social/contact destinations use Veli `Button as="a"`, `iconOnly`, `size="md"`, `intent="secondary"`, and `appearance="transparent"`. Standard Button styling owns the background, foreground, focus, hover and pressed states; the block does not override primitive styles. `renderLink` is also forwarded to these anchors for application routing.

Designer follow-up (2026-10-18): GOV.MV Figma uses secondary/transparent/md Button instances with hidden labels, but overrides their sizes and fills. Facebook/X are 48px controls with 20px icons; email/website are 44px controls with 16px icons. Stock Veli md is 44px; lg is 52px, so there is no stock 48px size. The block uses md consistently. Icon content belongs to the application. Supply explicit dimensions to prevent language-specific typography from changing icon size; the Phosphor examples supply `size={16}`.

Figma desktop EN/DV and mobile DV override the background to neutral/alpha/200 (light 5%, dark 4%). Mobile EN instead uses neutral/alpha/300 (light 9%, dark 38%). Veli secondary/transparent uses the opaque button-secondary-subtle semantic token. The block retains that default pending design-system reconciliation. Figma Facebook is Regular while the other three are Bold; examples retain all Bold following product review. Mobile EN also has a legacy icon foreground binding that does not switch correctly with dark mode.

## Divider design review

The block uses the existing Veli `Divider appearance="muted"` without a color, opacity or thickness override. Figma also uses the shared horizontal Divider, no text, Muted variant (component 3677:34419). Both bind to semantics/border/base/muted → brand/neutral/alpha/400 → sage/alpha/400: approximately rgba(17,32,0,0.13) in light and rgba(60,63,61,0.39) in dark.

The desktop EN/DV references additionally apply a 1px inside top stroke with the same muted token to the Navigation Container at the exact Divider position. This overlapping border/Divider treatment can make the reference appear stronger. Mobile references use a single Divider, and fractional Figma coordinates can affect raster sharpness. Retain one standard Veli Divider pending designer confirmation of the intended desktop layering; do not compensate with a stronger token or primitive override.
