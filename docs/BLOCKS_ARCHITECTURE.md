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
archives under `/api/blocks/v1`. The `@tradenetcorp/veli` CLI validates the
catalog, archive, receipt, and individual file hashes before placing editable
source in an application-selected directory. It retains canonical originals in
`.veli/blocks/<id>` and uses them as the base for three-way updates.

Interactive developers authenticate through the existing Cloudflare Access
identity flow using `cloudflared`; the CLI reuses its short-lived token without
copying it into project configuration. Non-interactive jobs must inject a
Cloudflare Access service-token pair. Removing the Access gate when Veli becomes
public does not change the catalog protocol or project format.

Updates never silently replace customized source. Clean changes merge into the
working copy. Conflicts retain the installed baseline and a rollback snapshot
until the developer continues or aborts the transaction.
