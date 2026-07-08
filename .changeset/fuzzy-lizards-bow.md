---
'@tradenetcorp/veli-tokens': minor
'@tradenetcorp/veli-ui': minor
---

Sync color tokens with the updated Figma variable hierarchy, rename the public color vocabulary to slate, ash, stone, sage, emerald, teal, and magenta, and remove resolved legacy color-name aliases from generated token output.

Emit dark-scoped token aliases for Tailwind color utilities and align caution color utility usage in Avatar and Badge.

Avoid the ambiguous `text-base` color shorthand for neutral Avatar initials so the 16px initials typography keeps its Figma-specified 10px font size.
