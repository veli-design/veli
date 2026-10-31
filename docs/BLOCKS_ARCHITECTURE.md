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

Developers request a time-limited IP grant through MINDCo WFA, then the CLI
uses ordinary HTTPS requests from that network. It guides them back to WFA if
the grant expires. Non-interactive jobs can inject a Cloudflare Access
service-token pair only if DevOps configures a Service Auth policy. Removing
the Access gate when Veli becomes public does not change the catalog protocol
or project format.

Updates never silently replace customized source. Clean changes merge into the
working copy. Conflicts retain the installed baseline and a rollback snapshot
until the developer continues or aborts the transaction.
