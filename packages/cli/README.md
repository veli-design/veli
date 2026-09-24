# Veli CLI

Install and manage editable Veli Blocks in an application while retaining the exact upstream source used for three-way updates.

## Private installation

Veli currently publishes to the private `@tradenetcorp` GitHub Packages scope. Configure package-read access as described in the Veli UI setup guide, then run:

```sh
corepack pnpm dlx @tradenetcorp/veli init
```

The CLI requires Node.js 24 or newer. It stores only the non-secret Veli Web URL and block destination in `.veli/config.json`.

## Cloudflare Access

Install `cloudflared`, then authenticate with the same company identity used for Veli Web:

```sh
corepack pnpm dlx @tradenetcorp/veli auth login
```

The browser login is currently valid for the 24-hour WFA Access session. Veli asks `cloudflared` for the cached, short-lived token when an endpoint is protected; the CLI does not persist that token itself.

For CI, configure a Cloudflare Access **Service Auth** policy and inject both `CF_ACCESS_CLIENT_ID` and `CF_ACCESS_CLIENT_SECRET` from the CI secret store. Never commit either value. Browser authentication is disabled in non-interactive environments.

## Commands

```sh
veli                     # interactive dashboard
veli list                # browse the catalog
veli add site-footer     # add canonical source and its baseline
veli status --check      # inspect all installed blocks and available updates
veli update site-footer  # perform a three-way update
veli restore site-footer # discard managed customizations and restore the baseline
veli doctor              # verify configuration, access, and receipt integrity
```

Run `veli <command> --help` for command-specific flags. Use `--cwd` when the target is a package inside a monorepo, `--json` for automation, and `--dry-run` before mutating lifecycle operations.

When an update conflicts, the CLI retains the installed baseline and a rollback snapshot. Resolve the labelled working-copy markers and run `veli update --continue <id>`, or run `veli update --abort <id>` to restore the pre-update working copy.
