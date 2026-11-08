# Veli Design CLI

Install and manage editable Veli Design Blocks in an application while retaining the exact upstream source used for three-way updates.

## Installation

The public npm package is `@veli-design/cli`. Installing it needs no
package-read token or repository access:

```sh
npx @veli-design/cli --help
```

The CLI requires Node.js 24 or newer. Package installation and Blocks registry
access are separate. The registry is hosted with the documentation at
`https://veli.design`; while Cloudflare/WFA protection remains enabled, obtain
access from the network you will use for the CLI. React and tokens can be used
anonymously without the CLI or registry.

From your application's package directory, initialize the project:

```sh
npx @veli-design/cli init
```

New projects default to `https://veli.design` without asking for a registry URL.
Choose where to copy Blocks, then browse and install them:

```sh
npx @veli-design/cli list
npx @veli-design/cli add
```

The CLI stores only the non-secret Veli Design Web URL and block destination in
`.veli/config.json`. Initialization does not install or configure Veli React,
tokens, styles or providers; follow the [React setup guide](https://www.npmjs.com/package/@veli-design/react)
for those requirements.

### Registry overrides and existing projects

The URL precedence is `--web-url`, then `VELI_WEB_URL`, then the existing
`.veli/config.json` URL. The public default applies only when no URL is configured
for new setup or a pre-initialization access check. Existing projects keep their
saved registry and are not silently migrated. An override on a later command is
temporary; it does not rewrite configuration or installed Block baselines.

Use an explicit override for a local, preview or alternate registry:

```sh
npx @veli-design/cli --web-url http://localhost:4321 init
```

HTTPS is required except for localhost. Review existing copied source and `.veli`
baselines before deliberately switching an established project to another
registry. CLI 0.2.0 and older have no default; with those versions, pass
`--web-url https://veli.design` to `init` explicitly.

## Access while the registry is protected

The default URL does not grant or bypass access. While the site is protected,
request access at [workforce access](https://wfa.mindco.mv/) with an eligible
account. Choose one of the available durations (at most 24 hours) and enter the
required reason. WFA grants access to your requesting IP, so run the CLI from the
same network. To check access before or after initialization, run:

```sh
corepack pnpm dlx @veli-design/cli auth login
```

The CLI sends ordinary HTTPS requests once WFA has granted access. No `cloudflared`
login or Access token is required for developers. Request another WFA grant if it
expires or your network/IP changes. Once the site is publicly accessible, no WFA
step is needed. The CLI stores no authentication secrets in the project.

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
