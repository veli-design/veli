# PD-442 Figma Color Name Mismatch Note

Status: discussion note, partially resolved in Figma  
Audience: design and engineering  
Related work: PD-442 token hierarchy refactor

## Summary

The latest TokensBruecke export includes the new color hierarchy and the agreed color names. A previous audit found a few component-level color references using older color labels. Those specific component color names have now been renamed in Figma and aligned in the checked-in token source, but a follow-up variable sweep found a few broader naming concerns that should be discussed before the next cleanup pass.

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

## Resolved Mismatches

These older component-scoped color labels were found in the raw DTCG export and have since been renamed in Figma.

| Status | Export path               | Previous exported name | Current Figma name |
| ------ | ------------------------- | ---------------------- | ------------------ |
| Done   | `color.components.status` | `pink-subtle`          | `magenta-subtle`   |
| Done   | `color.components.status` | `pink-emphasis`        | `magenta-emphasis` |
| Done   | `color.components.status` | `turquoise-subtle`     | `teal-subtle`      |
| Done   | `color.components.status` | `turquoise-emphasis`   | `teal-emphasis`    |
| Done   | `color.components.avatar` | `success green`        | `emerald`          |
| Done   | `color.components.avatar` | `pink`                 | `magenta`          |
| Done   | `color.components.avatar` | `turquoise`            | `teal`             |

The follow-up Figma sweep found no remaining exact matches for those old names and no aliases targeting variables with the older vocabulary.

## Pending Concerns From Follow-Up Sweep

These are not the same as the resolved `pink` / `turquoise` / `success green` mismatch. They are broader naming and hierarchy hygiene concerns to review later with design.

| Area                         | Current Figma name examples                                                             | Concern                                                                                                      | Possible direction                                                                                           |
| ---------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Root color token             | `white`                                                                                 | `white` is the only color variable outside the `primitives`, `brand`, `semantics`, or `components` grouping. | Consider `primitives/white` if design agrees that all raw palette values should live under `primitives`.     |
| Status component role naming | `components/status/cautious-subtle`, `components/status/cautious-emphasis`              | The agreed brand role is `caution`, while these component tokens use `cautious`.                             | Consider `components/status/caution-subtle` and `components/status/caution-emphasis`.                        |
| Default token casing         | `semantics/text/base/DEFAULT`, `semantics/bg/primary/DEFAULT`, `radius/DEFAULT`         | `DEFAULT` is useful for Tailwind output, but it is code-facing vocabulary inside Figma.                      | Decide whether Figma should keep uppercase `DEFAULT` or use lowercase `default` and let the build normalize. |
| Spaces in path segments      | `components/text input/*`, `components/text input/stroke default`, `shadow/depth 50`    | Spaces are readable in Figma but require build normalization for CSS and Tailwind output.                    | Consider `text-input`, `stroke/default`, and `depth-50` style naming if stricter token hygiene is desired.   |
| Exact base semantic aliases  | `semantics/text/base/DEFAULT`, `semantics/icon/base/default`; no exact `text/base` var. | Earlier discussion said `semantics/text/default` and `semantics/icon/default` should move to `base`.         | Confirm whether `base/DEFAULT` is the intended Figma shape or if an exact `base` leaf is preferred.          |

Current sweep counts:

| Check                            | Result |
| -------------------------------- | ------ |
| Local variable collections       | `11`   |
| Local variables                  | `922`  |
| Color variables                  | `797`  |
| Old color vocabulary matches     | `0`    |
| Alias targets using old names    | `0`    |
| Duplicate adjacent name segments | `0`    |
| Variables outside color roots    | `1`    |
| `cautious` status variables      | `2`    |

## Notes On Intentional Nuance

Some flagged items are not automatically bugs:

- Uppercase `DEFAULT` may intentionally preserve Tailwind default-token behavior.
- Spaces in Figma names may be acceptable if designers prefer readability and the build keeps normalizing them safely.
- `semantics/text/base/DEFAULT` may be the practical equivalent of `semantics/text/base` for generated code.

The next cleanup pass should only rename these if design and engineering agree that Figma should carry the stricter code-aligned vocabulary directly.

## Why Engineering Is Normalizing This

For the current implementation, engineering keeps the DTCG export faithful to Figma and normalizes structural and code-facing names in `packages/tokens/prebuild.js` before Terrazzo generates CSS and Tailwind utilities.

The seven older component color names have now been aligned in Figma and the checked-in token source. The build no longer needs the old color-name conversion bridge for those resolved labels.

## Current Build Behavior

The build bridge currently does three things:

1. Removes structural Figma groups from generated paths.
   - `color.primitives.slate.500` becomes `color.slate.500`
   - `color.brand.primary.800` becomes `color.primary.800`
   - `color.semantics.bg.surface.base` becomes `color.bg.surface.base`
   - `color.components.button.primary.default` becomes `color.button.primary.default`
2. Keeps generated Tailwind names compact and consistent.
   - We avoid names like `bg-semantics-bg-surface-base`.
   - We generate names like `bg-surface-base`.
3. Keeps Tailwind default-token output ergonomic.
   - Figma leaves such as `default` can emit `DEFAULT` where Tailwind should allow the shorter class name.
   - The build still adds lowercase default aliases where needed for CSS variable compatibility.

## Design Alignment Questions

These are the original questions that were resolved for the older color-name mismatch:

1. Should all component-scoped color token names use the new primitive color vocabulary?
   - Example: `avatar/success green` should become `avatar/emerald`.
2. Should status decorative colors use `magenta` and `teal` in Figma token names?
   - Example: `status/pink-subtle` should become `status/magenta-subtle`.
3. Should `success` be reserved only for semantic role tokens?
   - Example: `color.brand.success` or `color.text.success.default` can remain `success`, but the primitive palette should be `emerald`.
4. Should structural group names remain only as Figma organization?
   - Example: `primitives`, `brand`, `semantics`, and `components` are useful in Figma, but should not be part of generated Tailwind utility names.

The remaining open questions are listed in [Pending Concerns From Follow-Up Sweep](#pending-concerns-from-follow-up-sweep).

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

The old color-name bridge has been removed now that Figma and the checked-in token source use `magenta`, `teal`, and `emerald` directly.

Until the pending concerns are resolved, `packages/tokens/prebuild.js` should still keep structural group stripping, whitespace normalization, and default-token handling so generated output remains stable.
