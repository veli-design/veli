# Veli Design CLI

Install and manage editable Veli Design Blocks in an application while retaining the exact upstream source used for three-way updates.

## Installation

The prepared public npm package is `@veli-design/cli`; installation needs no package-read token after publication. Until then, use the local tarball rehearsal described in [the migration runbook](https://github.com/tradenetcorp/veli/blob/main/docs/NPM_MIGRATION.md). After publication, run:

```sh
corepack pnpm dlx @veli-design/cli init
```

The CLI requires Node.js 24 or newer. It stores only the non-secret Veli Design Web URL and block destination in `.veli/config.json`.

Package installation and Blocks registry access are separate. Configure the compatible new-scope Veli Design Web URL with `veli --web-url <url> init`. Do not point migrated consumers at the old-scope production catalog. Existing copied source and `.veli` baselines need the coordinated migration described in the runbook.

## WFA access

Before using Veli Design Web, request access at [workforce access](https://wfa.mindco.mv/) with your company account. Choose one of the available durations (at most 24 hours) and enter the required reason. WFA grants access to your requesting IP, so run the CLI from the same network. To check access or get guided recovery instructions, run:

```sh
corepack pnpm dlx @veli-design/cli auth login
```

The CLI sends ordinary HTTPS requests once WFA has granted access. No `cloudflared` login or Access token is required for developers. Request another WFA grant if it expires or your network/IP changes. The CLI stores no authentication secrets in the project.

For CI, configure a Cloudflare Access **Service Auth** policy if service-token access is available, then inject both `CF_ACCESS_CLIENT_ID` and `CF_ACCESS_CLIENT_SECRET` from the CI secret store. Never commit either value. CI cannot use an interactive WFA approval.

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

## Licence and assets

Original software and code examples use MIT; original non-software documentation
uses CC BY 4.0. Installed packages include the root `LICENSE` and
`licensing/LICENSING.md` with scope and attribution information, the complete
CC BY text, and applicable third-party notices. See the
[repository licensing map](https://github.com/tradenetcorp/veli/blob/main/LICENSING.md)
for source policy and asset details (repository access required).
Original project work is copyright © 2026 Government of the Republic of Maldives.
Developed by MINDCo.
Fonts, government/brand imagery and copied Block SVGs are not included or
licensed by these npm packages; registry/hosted-site assets are separate.
