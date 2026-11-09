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

Veli Web publishes the authenticated catalog and immutable, content-addressed
archives under `/api/blocks/v1`. The `@veli-design/cli` CLI validates the
catalog, archive, receipt, and individual file hashes before placing editable
source in an application-selected directory. It retains canonical originals in
`.veli/blocks/<id>` and uses them as the base for three-way updates.

Protected registries require authorized access before the CLI can download
source. The CLI reports missing or expired access rather than bypassing it.
Non-interactive jobs can supply Cloudflare Access service credentials when
the registry operator supports them; keep credentials in the CI secret store.
Public registries use the same protocol and project format without an access
grant. See the [CLI guide](../packages/cli/README.md) for access checks.

Updates never silently replace customized source. Clean changes merge into the
working copy. Conflicts retain the installed baseline and a rollback snapshot
until the developer continues or aborts the transaction.
