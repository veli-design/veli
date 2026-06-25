# PD-442 Token Hierarchy Refactor Proposal

Status: Proposal
Issue: PD-442
Last updated: 2026-06-25

## Summary

Veli already has many of the pieces needed for a themeable token system:

- Primitive palette tokens live under `color.cool gray`, `color.blue`, `color.success`, `color.orange`, `color.red`, and the extended color families.
- Semantic/application tokens already exist under groups such as `color.bg`, `color.text`, `color.icon`, `color.border`, and `color.status`.
- Component-scoped tokens already exist under groups such as `color.button`, `color.text input`, `color.switch`, `color.radio`, `color.checkbox`, `color.tooltip`, `color.calendar`, `color.modal`, `color.avatar`, and `color.popover`.

The missing architectural layer is a clear brand/theme tier between primitives and semantic tokens. Today, many semantic and component tokens point directly at palette scales such as `color.blue.800` or `color.cool gray.1100`. That works for a single Veli theme, but it makes multi-theme work more expensive because each theme change has to be reasoned through at many semantic and component points.

This proposal recommends a four-layer implementation model that maps to the three-tier themeable design-system idea in the issue:

```text
Primitive/global tokens
  -> Brand/theme tokens
  -> Semantic/application tokens
  -> Component-scoped tokens
```

Brad Frost's three-tier model describes brand definitions, high-level application variables, and component variables. In Veli terms, the current primitive palette is an additional lower-level source layer, so the practical architecture becomes four layers while preserving the same intent: theme decisions happen high in the hierarchy, and components inherit those decisions instead of encoding brand color choices directly.

## Research Notes

### Brad Frost: multi-tier variables

Reference: <https://bradfrost.com/blog/post/creating-themeable-design-systems/>

Brad Frost's model separates:

- Brand definitions: raw brand attributes such as brand colors and fonts.
- High-level application variables: reusable UI roles such as primary action background or subtle border.
- Component variables: component-local variables mapped from the higher-level application roles.

The useful lesson for Veli is that component tokens should not be the primary place where brand decisions happen. Component tokens should usually be durable mappings from the component's anatomy to semantic roles.

### shadcn/ui: compact theme roles and foreground pairs

Reference: <https://ui.shadcn.com/docs/theming>

shadcn/ui uses CSS variables for roles such as `background`, `foreground`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, and `ring`. It also pairs many background roles with foreground roles, for example `primary` and `primary-foreground`.

The useful lesson for Veli is not to copy the exact token names, but to preserve the pairing concept: themeable surface tokens need explicit on-surface text/icon tokens so designers and engineers do not repeatedly solve contrast at component level.

### Carbon: core tokens and component tokens

Reference: <https://carbondesignsystem.com/elements/color/tokens/>

Carbon separates reusable core color roles from component tokens. Its core tokens are grouped by common UI application areas such as background, layer, field, border, text, link, icon, support, and focus.

The useful lesson for Veli is that semantic tokens should be broad enough for many components to share. If a token name only makes sense for one component, it belongs in the component layer. If it describes a reusable UI role, it belongs in the semantic layer.

### Atlassian: themes as token value collections

Reference: <https://atlassian.design/foundations/tokens/design-tokens/>

Atlassian defines a theme as a collection of token values that produces a particular look or style. Their naming guidance also emphasizes that token names should describe intended use, not just visual appearance.

The useful lesson for Veli is that `Light` and `Dark` should be treated as modes of a theme, while future brand themes should be parallel value collections that keep the same public token roles.

## Current Veli Audit

Source audited: `packages/tokens/src/design.tokens.json`

Current token build path:

```text
Figma variables and styles
  -> TokensBruecke DTCG export
  -> packages/tokens/prebuild.js
  -> .cache/design.tokens.normalized.json
  -> Terrazzo
  -> packages/tokens/postbuild.js
  -> dist/tokens.css
  -> dist/tailwind-theme.css
```

Important current build constraints:

- Figma export remains the source into `packages/tokens/src/design.tokens.json`.
- `packages/tokens/prebuild.js` normalizes legacy aliases, color aliases, token key casing, and OKLCH values before Terrazzo runs.
- Terrazzo emits the CSS and Tailwind outputs.
- `packages/tokens/postbuild.js` keeps Tailwind v4 variable naming aligned, adds dark-mode CSS structure, normalizes typography utilities, and preserves Veli's runtime dark-mode contract.
- Veli's current dark-mode contract is class-driven: light variables by default, dark overrides under `:where(.dark, .dark *)`.

### Current color inventory

| Layer today          | Current examples                                                                                                                                                       | Notes                                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Primitive palette    | `color.cool gray`, `color.blue`, `color.success`, `color.orange`, `color.red`, `color.green`, `color.indigo`, `color.pink`, `color.white`                              | These are the raw material collections. Many have numeric steps and alpha steps.                       |
| Semantic/application | `color.bg`, `color.text`, `color.icon`, `color.border`, `color.status`                                                                                                 | These are mostly Tier 2 already, but many still reference primitives directly.                         |
| Component-scoped     | `color.button`, `color.text input`, `color.switch`, `color.radio`, `color.checkbox`, `color.tooltip`, `color.calendar`, `color.modal`, `color.avatar`, `color.popover` | These are Tier 3 already, but many still reference primitives or lower-level semantics inconsistently. |

### Examples of current direct palette coupling

| Current token                           | Current value pattern        | Refactor direction                                                      |
| --------------------------------------- | ---------------------------- | ----------------------------------------------------------------------- |
| `color.bg.primary.DEFAULT`              | `{color.blue.800}`           | Point to `color.theme.primary.default`.                                 |
| `color.bg.secondary.DEFAULT`            | `{color.cool gray.1100}`     | Point to `color.theme.secondary.default`.                               |
| `color.text.primary.default`            | `{color.blue.900}`           | Point to a semantic foreground role derived from `color.theme.primary`. |
| `color.border.focus`                    | `{color.blue.700}`           | Point to a focus/ring semantic derived from the active theme.           |
| `color.button.primary.default`          | `{color.blue.800}`           | Point to `color.bg.primary.default`.                                    |
| `color.radio.container-selected-border` | `{color.blue.800}`           | Point to an interactive border semantic.                                |
| `color.checkbox.container-checked-bg`   | `{color.bg.primary.DEFAULT}` | This is already closer to the target direction.                         |

The current setup is not broken. It is simply missing a documented and enforceable boundary for where brand choices live.

## Proposed Architecture

### Target hierarchy

```text
Layer 0: Primitive/global tokens
  color.blue.800
  color.cool gray.1100
  radius.md
  spacing.4

Layer 1: Brand/theme tokens
  color.theme.primary.default
  color.theme.secondary.default
  color.theme.accent.default
  color.theme.base.surface

Layer 2: Semantic/application tokens
  color.bg.primary.default
  color.text.default.strong
  color.border.focus
  color.field.border.pressed

Layer 3: Component-scoped tokens
  color.button.primary.default
  color.checkbox.container.checked.bg
  color.tooltip.bg.large.primary
```

### Dependency rule

Token references should flow downward only:

```text
primitive/global
  -> brand/theme
  -> semantic/application
  -> component-scoped
```

Allowed references:

- Brand/theme tokens reference primitive/global tokens.
- Semantic/application tokens primarily reference brand/theme tokens.
- Semantic/application tokens may reference primitive/global tokens only when the role is not brand-controlled.
- Component-scoped tokens reference semantic/application tokens.
- Component-scoped tokens may reference brand/theme tokens only for rare brand-expressive anatomy that does not have a reusable semantic role.

Avoid:

- Component tokens pointing directly to primitives for common roles.
- Semantic tokens pointing to component tokens.
- Primitive tokens referencing anything higher in the hierarchy.
- Theme names leaking into component APIs.

### Layer 0: primitive/global tokens

Primitive tokens stay close to the current source shape.

Examples:

```text
color.cool gray.100
color.cool gray.1200
color.cool gray.alpha.300
color.blue.800
color.blue.alpha.400
color.red.900
color.white
spacing.4
radius.md
font.sans
```

Recommended rules:

- Primitive color tokens should remain palette facts, not usage guidance.
- Primitive color tokens can keep numeric steps.
- Primitive names should not include UI roles such as button, field, focus, or selected.
- Non-color foundations such as spacing, radius, typography, blur, and shadow can remain primitive or semantic according to their existing architecture. PD-442 should focus on color first.

### Layer 1: brand/theme tokens

Brand/theme tokens define the theme's expressive raw materials.

Recommended first-pass groups:

```text
color.theme.primary.default
color.theme.primary.hover
color.theme.primary.pressed
color.theme.primary.subtle.default
color.theme.primary.subtle.hover
color.theme.primary.subtle.pressed
color.theme.primary.foreground

color.theme.secondary.default
color.theme.secondary.hover
color.theme.secondary.pressed
color.theme.secondary.subtle.default
color.theme.secondary.subtle.hover
color.theme.secondary.subtle.pressed
color.theme.secondary.foreground

color.theme.accent.default
color.theme.accent.hover
color.theme.accent.pressed
color.theme.accent.subtle.default
color.theme.accent.subtle.hover
color.theme.accent.subtle.pressed
color.theme.accent.foreground

color.theme.base.surface
color.theme.base.surface-raised
color.theme.base.surface-overlay
color.theme.base.muted
color.theme.base.strong
color.theme.base.foreground

color.theme.success.default
color.theme.warning.default
color.theme.danger.default
color.theme.info.default
```

Open naming decision for design review:

- `color.theme.*` is explicit and fits the issue language.
- `color.brand.*` may be clearer when multiple brands become a formal product requirement.
- `color.role.*` is less brand-specific, but may be too abstract for designer handoff.

Recommendation: use `color.theme.*` for the first refactor because the system already uses light/dark theme modes and the issue describes a themeable hierarchy.

### Layer 2: semantic/application tokens

Semantic tokens describe how color is used in the UI. They should be stable even if the brand/theme palette changes.

Recommended semantic groups:

| Group             | Purpose                                                   | Current nearby tokens                                                |
| ----------------- | --------------------------------------------------------- | -------------------------------------------------------------------- |
| `color.bg.*`      | Page, surface, action, selected, and feedback backgrounds | `color.bg`                                                           |
| `color.text.*`    | Text hierarchy and on-surface text                        | `color.text`                                                         |
| `color.icon.*`    | Icon hierarchy and on-surface icon colors                 | `color.icon`                                                         |
| `color.border.*`  | Borders, separators, outlines, focus rings                | `color.border`                                                       |
| `color.status.*`  | Status indicators and badges                              | `color.status`                                                       |
| `color.field.*`   | Reusable form field surfaces and strokes                  | currently mixed through `color.text input`                           |
| `color.overlay.*` | Overlay backdrops and elevated overlay surfaces           | currently split through `color.bg.surface.overlay-*`, modal, popover |

Suggested mapping examples:

```text
color.bg.primary.default
  -> color.theme.primary.default

color.bg.primary.hover
  -> color.theme.primary.hover

color.bg.secondary.default
  -> color.theme.secondary.default

color.text.primary.default
  -> color.theme.primary.text

color.text.default.strong
  -> color.theme.base.strong

color.border.focus
  -> color.theme.primary.focus

color.status.danger-emphasis
  -> color.theme.danger.default
```

Foreground/on-surface guidance:

- Add explicit foreground roles for high-emphasis surfaces, inspired by shadcn/ui's background and foreground pairing.
- Prefer semantic names for actual consumption, for example `color.text.on-primary`, `color.icon.on-primary`, or `color.fg.on-primary`.
- Do not make components infer foreground color from background token names.

### Layer 3: component-scoped tokens

Component tokens should describe component anatomy and states, then point to semantic tokens.

Suggested mapping examples:

```text
color.button.primary.default
  -> color.bg.primary.default

color.button.primary.hover
  -> color.bg.primary.hover

color.button.primary.subtle.default
  -> color.bg.primary.subtle.default

color.checkbox.container.checked.bg
  -> color.bg.primary.default

color.radio.container.selected.border
  -> color.border.interactive

color.switch.track.on.bg
  -> color.bg.success.default

color.tooltip.bg.large.primary
  -> color.bg.primary.strong

color.popover.bg.primary
  -> color.bg.primary.strong
```

Recommended rules:

- Component tokens are allowed when the component has real anatomy or state that needs a stable name.
- Component tokens should be generated for components that need design-level review, not for every single Tailwind utility used internally.
- Public component props such as `intent="primary"` and `appearance="fill"` should remain independent from the internal token hierarchy.

## Migration Strategy

### Phase 1: document and introduce aliases

Add `color.theme.*` aliases in the token source while preserving existing semantic and component token names.

Example:

```json
{
  "color": {
    "theme": {
      "primary": {
        "default": {
          "$type": "color",
          "$value": "{color.blue.800}"
        }
      }
    },
    "bg": {
      "primary": {
        "DEFAULT": {
          "$type": "color",
          "$value": "{color.theme.primary.default}"
        }
      }
    }
  }
}
```

Output compatibility goal:

- Existing utilities such as `bg-bg-primary-default`, `text-text-default-strong`, and `border-border-focus` continue to work.
- Existing CSS custom properties remain available.
- No component source changes are required in this phase.

### Phase 2: remap semantic tokens

Move semantic tokens to reference theme tokens wherever the theme tier covers the intended role.

Examples:

| Semantic token               | New reference                   |
| ---------------------------- | ------------------------------- |
| `color.bg.primary.DEFAULT`   | `color.theme.primary.default`   |
| `color.bg.primary.hover`     | `color.theme.primary.hover`     |
| `color.bg.secondary.DEFAULT` | `color.theme.secondary.default` |
| `color.text.primary.default` | `color.theme.primary.text`      |
| `color.border.focus`         | `color.theme.primary.focus`     |

Acceptance criteria:

- Light and dark modes still emit the same or intentionally reviewed visual values.
- Token output diffs are explainable as alias changes or approved value changes.
- Docs and Storybook still render existing component states.

### Phase 3: remap component tokens

Move component tokens to semantic references.

Examples:

| Component token                         | New reference                                      |
| --------------------------------------- | -------------------------------------------------- |
| `color.button.primary.default`          | `color.bg.primary.default`                         |
| `color.button.secondary.default`        | `color.bg.secondary.default`                       |
| `color.text input.stroke pressed`       | `color.border.focus` or `color.field.border.focus` |
| `color.radio.container-selected-border` | `color.border.interactive`                         |
| `color.checkbox.container-checked-bg`   | `color.bg.primary.default`                         |

Acceptance criteria:

- Component CSS class names do not change unless separately approved.
- Component stories should look unchanged for the default Veli theme.
- Component token references should no longer point to primitive palettes for common roles.

### Phase 4: add a second theme proof

Add a small second theme proof before declaring the architecture complete. The proof can be a non-shipping alternate theme in Storybook or docs.

The proof should demonstrate:

- primary, secondary, accent, and base can change at the theme layer.
- common semantic roles inherit the new theme.
- button, checkbox, radio, switch, tooltip, popover, and modal states update without component code changes.
- contrast-sensitive foreground pairs remain explicit and reviewable.

## Proposed Token Naming

### Theme token names

| Role      | Proposed tokens                                                                                                              |
| --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Primary   | `color.theme.primary.default`, `hover`, `pressed`, `subtle.default`, `subtle.hover`, `subtle.pressed`, `foreground`, `focus` |
| Secondary | `color.theme.secondary.default`, `hover`, `pressed`, `subtle.default`, `subtle.hover`, `subtle.pressed`, `foreground`        |
| Accent    | `color.theme.accent.default`, `hover`, `pressed`, `subtle.default`, `subtle.hover`, `subtle.pressed`, `foreground`           |
| Base      | `color.theme.base.surface`, `surface-raised`, `surface-overlay`, `muted`, `strong`, `foreground`, `foreground-muted`         |
| Feedback  | `color.theme.success.*`, `warning.*`, `danger.*`, `info.*`                                                                   |

### Semantic token names

Keep current semantic groups where possible:

```text
color.bg.*
color.text.*
color.icon.*
color.border.*
color.status.*
```

Consider adding or clarifying:

```text
color.field.*
color.overlay.*
color.focus.*
```

### Component token names

Keep current component token names for compatibility unless the names are already confusing or inconsistent. The first refactor should change references, not public CSS utility names.

Future cleanup candidates:

- Normalize spaces in source token names, such as `text input`, to canonical path segments before they become long-lived design handoff names.
- Decide whether component state names should use `selected` or `checked` based on component semantics.
- Align `DEFAULT` versus `default` casing at the source if Figma export constraints allow it.

## Design Review Questions

These should be resolved with designers before implementation:

1. Should `secondary` mean "neutral high-emphasis" or "second brand color"?
2. Does Veli need `accent` as a general interaction highlight, or should current blue primary also cover active accents?
3. Should `base` be the chosen gray family only, or should it include white, overlays, and inverse surfaces?
4. Do feedback roles such as success, warning, danger, and info belong in the brand/theme tier or remain semantic-only?
5. What is the minimum second-theme proof needed to validate the hierarchy?

## Implementation Guardrails

- Do not change component APIs for PD-442's first implementation pass.
- Do not rename generated CSS custom properties until aliases and migration docs exist.
- Do not replace all primitive references mechanically. Some semantic tokens may intentionally reference primitives when they are not brand-controlled.
- Keep dark-mode behavior class-driven through the existing `.dark` contract.
- Preserve Tailwind v4 output compatibility from `postbuild.js`.
- Use token build output diffs as review artifacts for designers and engineers.

## Acceptance Criteria For The Refactor Work

When the actual token refactor starts, it should be considered successful when:

- `color.theme.*` exists as the brand/theme tier.
- common semantic tokens reference `color.theme.*` where applicable.
- common component tokens reference semantic tokens instead of primitive palette tokens.
- existing component classes and public props continue to work.
- light and dark mode outputs are reviewed.
- at least one alternate theme proof demonstrates that theme-tier edits ripple through semantic and component tokens.

## Recommended Next Step

Create the theme tier as aliases first. That gives designers and engineers a concrete layer to review without destabilizing component output. Once the alias layer is accepted, remap semantic tokens in small groups, starting with primary, secondary, base surface, text, border, and focus.
