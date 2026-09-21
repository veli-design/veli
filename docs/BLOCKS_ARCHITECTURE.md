# Veli Blocks architecture

Blocks are application-owned, editable React source. Veli maintains the
reference implementation in the private `packages/blocks` workspace; consumers
install Veli tokens and primitives, copy a block into their application, and
own adaptations and updates. The catalog uses the same source for previews,
displayed code, downloads, and validation.

Each download includes original source and a receipt under `.veli/blocks/<id>`
so consumers can compare upstream changes with their customized copy. See
[Blocks versioning and lifecycle](BLOCKS_VERSIONING.md) for source versions and
lifecycle statuses.
