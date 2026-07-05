# PD-442 Figma Color Name Mismatch Note

Status: discussion note  
Audience: design and engineering  
Related work: PD-442 token hierarchy refactor

## Summary

The latest TokensBruecke export includes the new color hierarchy and most of the new color names, but a few component-level color references still use older color labels. Engineering can normalize these names during build, but the mismatch should be discussed with design so the Figma source and generated code vocabulary stay aligned over time.

This note focuses only on naming mismatches. It does not propose changing the approved color values.

## Expected New Color Names

| Previous name     | New name          |
| ----------------- | ----------------- |
| `cool gray`       | `slate`           |
| `gray`            | `ash`             |
| `warm gray`       | `stone`           |
| `green gray`      | `sage`            |
| `success` palette | `emerald` palette |
| `turquoise`       | `teal`            |
| `pink`            | `magenta`         |

The important distinction is that `success` remains a semantic role, while `emerald` is the primitive color family used by that role.

## Mismatches Found In The Export

The raw DTCG export in `packages/tokens/src/design.tokens.json` still contains a few older labels in component-scoped color tokens.

| Export path               | Current exported name | Preferred generated name |
| ------------------------- | --------------------- | ------------------------ |
| `color.components.status` | `pink-subtle`         | `magenta-subtle`         |
| `color.components.status` | `pink-emphasis`       | `magenta-emphasis`       |
| `color.components.status` | `turquoise-subtle`    | `teal-subtle`            |
| `color.components.status` | `turquoise-emphasis`  | `teal-emphasis`          |
| `color.components.avatar` | `success green`       | `emerald`                |
| `color.components.avatar` | `pink`                | `magenta`                |
| `color.components.avatar` | `turquoise`           | `teal`                   |

These names appear to be component token labels rather than primitive palette names. The token values can still resolve correctly, but the exported names create two vocabularies for the same colors.

## Why Engineering Is Normalizing This

For the current implementation, engineering keeps the DTCG export faithful to Figma and normalizes the names in `packages/tokens/prebuild.js` before Terrazzo generates CSS and Tailwind utilities.

That means Figma can still export:

```text
color.components.avatar.success green
```

while code receives:

```text
--color-avatar-emerald
bg-avatar-emerald
```

This avoids manually editing the export, which would make future Figma diffs harder to trust.

## Current Build Behavior

The build bridge currently does four things:

1. Removes structural Figma groups from generated paths.
   - `color.primitives.slate.500` becomes `color.slate.500`
   - `color.brand.primary.800` becomes `color.primary.800`
   - `color.semantics.bg.surface.base` becomes `color.bg.surface.base`
   - `color.components.button.primary.default` becomes `color.button.primary.default`
2. Converts older color labels to the approved code-facing names.
   - `success green` / `success-green` becomes `emerald`
   - `turquoise` becomes `teal`
   - `pink` becomes `magenta`
3. Keeps generated Tailwind names compact and consistent.
   - We avoid names like `bg-semantics-bg-surface-base`.
   - We generate names like `bg-surface-base`.
4. Keeps legacy generated aliases temporarily for compatibility.
   - Existing CSS names such as `--color-status-pink-subtle` can still resolve.
   - New source usage should move to names such as `--color-status-magenta-subtle`.

## Design Alignment Questions

These are the questions worth resolving with design before the next Figma export becomes the long-term source of truth:

1. Should all component-scoped color token names use the new primitive color vocabulary?
   - Example: `avatar/success green` should become `avatar/emerald`.
2. Should status decorative colors use `magenta` and `teal` in Figma token names?
   - Example: `status/pink-subtle` should become `status/magenta-subtle`.
3. Should `success` be reserved only for semantic role tokens?
   - Example: `color.brand.success` or `color.text.success.default` can remain `success`, but the primitive palette should be `emerald`.
4. Should structural group names remain only as Figma organization?
   - Example: `primitives`, `brand`, `semantics`, and `components` are useful in Figma, but should not be part of generated Tailwind utility names.

## Recommended Direction

Keep the structural groups in Figma for designer clarity, but align token labels inside those groups to the approved shared vocabulary:

| Figma group  | Recommended naming intent                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| `primitives` | Raw palette families such as `slate`, `ash`, `stone`, `sage`, `emerald`, `teal`, `magenta`            |
| `brand`      | Theme roles such as `neutral`, `primary`, `accent`, `success`, `caution`, `warning`, `danger`, `info` |
| `semantics`  | Application roles such as `bg`, `text`, `icon`, `border`, `effects`                                   |
| `components` | Component contracts that reference semantic or role tokens but use current vocabulary                 |

The build can continue to strip structural group names from generated code output. That lets designers keep a clear hierarchy in Figma while developers keep ergonomic Tailwind names.

## Temporary Engineering Guardrail

Until the Figma source is fully aligned, `packages/tokens/prebuild.js` should keep the normalization bridge so generated output remains stable:

```text
pink -> magenta
turquoise -> teal
success green -> emerald
```

Once the exported source no longer contains the older labels, we can remove the legacy normalization and keep only the structural group stripping.
