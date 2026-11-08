# Cursor affordances

Interactive hosts in `@veli-design/react` set the cursor with a complete Tailwind utility in the recipe that already styles that host. `packages/react/tests/cursor-contract.test.mjs` names each host and checks the source.

Enabled menu, select, combobox, and calendar picker rows use cursor-default. Disabled rows use cursor-not-allowed and stay hit-testable.

A disabled Button stays hit-testable and uses cursor-not-allowed. Pending Button uses data-[pending]:cursor-wait.

Do not export a shared cursor string.

## Kind and state

| Kind        | Enabled                                | Disabled                                                           | Other states                                                                             |
| ----------- | -------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Pressable   | `cursor-pointer`                       | `cursor-not-allowed`, and the host stays hit-testable              | A pending button also sets `data-[pending]:cursor-wait`                                  |
| Text shell  | `cursor-text`                          | `cursor-not-allowed`                                               | Read-only text stays `cursor-text`                                                       |
| Option row  | `cursor-default`                       | `cursor-not-allowed`, and the row stays hit-testable               | Menu, select, combobox, and calendar picker rows share this kind                         |
| Specialized | The utility that the host already uses | The disabled utility that the recipe already uses, when it has one | `cursor-help`, `cursor-grab`, `cursor-grabbing`, `cursor-col-resize`, `cursor-ns-resize` |

Write the full utility in that recipe. Decorative layers such as ripples, selection indicators, and spinners may use `pointer-events-none`. A disabled host does not use `pointer-events-none`.

A product `className` can replace the cursor. An internal `MenuItem` does not take a `cursor-*` class.
