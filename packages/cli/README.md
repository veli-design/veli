# Veli CLI

Install and manage editable Veli Blocks in an application while retaining the exact upstream source used for three-way updates.

## Private installation

Veli currently publishes to the private `@tradenetcorp` GitHub Packages scope. Configure package-read access as described in the Veli UI setup guide, then run:

```sh
corepack pnpm dlx @tradenetcorp/veli init
```

The CLI requires Node.js 24 or newer. It stores only the non-secret Veli Web URL and block destination in `.veli/config.json`.

## WFA access

Before using Veli Web, request access at [MINDCo WFA](https://wfa.mindco.mv/) with your company account. Choose one of the available durations (at most 24 hours) and enter the required reason. WFA grants access to your requesting IP, so run the CLI from the same network. To check access or get guided recovery instructions, run:

```sh
corepack pnpm dlx @tradenetcorp/veli auth login
```

The CLI sends ordinary HTTPS requests once WFA has granted access. No `cloudflared` login or Access token is required for developers. Request another WFA grant if it expires or your network/IP changes. The CLI stores no authentication secrets in the project.

For CI, DevOps must configure a Cloudflare Access **Service Auth** policy if service-token access is available, then inject both `CF_ACCESS_CLIENT_ID` and `CF_ACCESS_CLIENT_SECRET` from the CI secret store. Never commit either value. CI cannot use an interactive WFA approval.

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
