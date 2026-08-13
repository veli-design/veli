# Release & Publishing Setup

This monorepo uses [Changesets](https://github.com/changesets/changesets) for automated versioning and releases to GitHub Packages.

The publishable package versions are intentionally reset to `0.0.0` before the
first clean release. The committed initial changeset bumps both
`@tradenetcorp/veli-tokens` and `@tradenetcorp/veli-ui` to `0.0.1`.

## Architecture Overview

### Packages Published

- `@tradenetcorp/veli-tokens` - Design tokens (DTCG → CSS/Tailwind)
- `@tradenetcorp/veli-ui` - React components

### Apps (Not Published)

- `@tradenetcorp/veli-web` - Documentation site
- `@tradenetcorp/veli-storybook` - Component development

## Automated Release Workflow

```
1. Veli Bridge (Figma Plugin)
   ↓ Syncs design tokens to repository

2. Veli Bridge Bot (GitHub App)
   ↓ Creates PR with changeset file
   ↓ Sets version bump type (patch/minor/major)

3. Developer merges PR to main
   ↓ CI triggers build

4. Changesets Action
   ↓ Creates "Version Packages" PR
   ↓ Updates versions & CHANGELOG

5. Developer merges "Version Packages" PR
   ↓ CI triggers build + publish

6. Packages published to GitHub Packages
```

The release workflow in `.github/workflows/release.yml` is the release detector.
It runs on every push to `main` and delegates to `changesets/action@v1`:

- If `.changeset/*.md` files exist, it opens or updates a release PR.
- If the release PR has already versioned packages and removed consumed
  changesets, it runs `pnpm release` and publishes changed packages.
- If no publishable package changed, no package is published.

The packages remain connected to this repository, so GitHub renders the root
repository README on each package landing page and inherits repository access
permissions. Package manifests use `repository.directory` to identify their
source folders, and the root README links to each package's stable documentation.

For an individual version, the publish command temporarily stages that exact
changelog section as the package artifact's README. GitHub Packages therefore
shows release-specific **About this version** content, while Changesets Action
uses the same section for the release pull request and GitHub Release body. The
tracked package README is restored whether publishing succeeds or fails.

## How Selective Releases Work

**Changesets determines what to publish based on changeset files:**

- Only packages mentioned in `.changeset/*.md` files get versioned
- Only versioned packages get published
- App packages are ignored via `.changeset/config.json`

**Example scenarios:**

- Token sync only → Only `@tradenetcorp/veli-tokens` publishes
- Token + UI changes → Both packages publish
- Web site changes → Nothing publishes (ignored by config)

## Manual Testing

```bash
# Create a guided changeset
pnpm changeset

# Check changeset status against main
pnpm changeset status --since main

# View changeset files
cat .changeset/*.md
```

## Changeset Format

**File location:** `.changeset/[unique-id].md`

Use `pnpm changeset` to create a valid file. Each releasing changeset has one or
more [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) categories and
user-facing bullets. See [Changelog authoring](./CHANGELOG_AUTHORING.md)
for the category and SemVer rules.

**Patch fix:**

```markdown
---
'@tradenetcorp/veli-tokens': patch
---

### Fixed

- Correct the generated Figma token value for the surface border.
```

**Minor feature:**

```markdown
---
'@tradenetcorp/veli-tokens': minor
---

### Added

- Add success-state color tokens.
```

**Major removal for an already stable package:**

```markdown
---
'@tradenetcorp/veli-tokens': major
---

### Removed

- Remove deprecated token values. Update consumers to the documented replacements.
```

Packages on the pre-stable `0.x` line use `minor` for breaking changes. The guided creator and
CI validation reject a `major` changeset for those packages because it would promote them to
`1.0.0`. That promotion is reserved for an intentional stable-release change.

**Multiple packages:**

```markdown
---
'@tradenetcorp/veli-tokens': patch
'@tradenetcorp/veli-ui': patch
---

### Changed

- Update design tokens and their corresponding UI components.
```

## Build Pipeline

### Tokens Build (Terrazzo)

- **Input:** `packages/tokens/src/design.tokens.json` (DTCG format)
- **Process:** `pnpm build` → Runs Terrazzo plugins
- **Outputs:**
  - `dist/tokens.css` - CSS variables (`--color-*`, `--base-size-*`, etc.)
  - `dist/tailwind-theme.css` - Tailwind v4 theme file
- **Published files:** `dist/`, `src/design.tokens.json`

### UI Build (TypeScript)

- **Input:** `packages/ui/src/**/*.tsx`
- **Process:** `pnpm build` → TypeScript compilation
- **Published files:** Compiled TypeScript outputs

## Package Configuration

Both packages include `publishConfig`:

```json
{
  "publishConfig": {
    "@tradenetcorp:registry": "https://npm.pkg.github.com",
    "access": "restricted"
  }
}
```

The publishable packages are not marked `"private": true`; GitHub Packages
publishing is controlled by the package scope, registry, repository permissions,
and the release workflow token.

## Initial Clean Release Checklist

Before merging the first clean release PR:

1. Flatten `main` history to the agreed foundational commit or commits.
2. Force-push the cleaned `main` with lease protection.
3. Confirm stale pre-rename GitHub Releases, Git tags, and GitHub Package
   versions have been deleted.
4. Rename the GitHub repository to `veli` and update local remotes.
5. Merge the release-prep PR. The release workflow should open a Changesets
   version PR that bumps both packages from `0.0.0` to `0.0.1`.
6. Merge the Changesets version PR to publish the initial package versions.

## GitHub Actions Workflows

### CI Workflow (`.github/workflows/ci.yml`)

**Triggers:** On every pull request

- Installs dependencies
- Builds all packages
- Runs linting

### Release Workflow (`.github/workflows/release.yml`)

**Triggers:** On push to main branch

- Installs dependencies
- Builds all packages
- Runs Changesets action:
  - Creates "Version Packages" PR if changesets are pending
  - Publishes packages if versions already bumped
- Environment: Node 24, pnpm 10.24.0

## Installation by Consumers

Users installing from GitHub Packages need:

1. GitHub personal access token with `read:packages` scope
2. Configure `.npmrc`:

```
@tradenetcorp:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_TOKEN
```

Or via command line:

```bash
npm login --scope=@tradenetcorp --registry=https://npm.pkg.github.com
```

## Troubleshooting

### "No changesets found"

- Changesets action won't create version PR without changeset files
- Veli Bridge Bot must create `.changeset/*.md` in the PR

### "Version already exists"

- Delete the accidental GitHub Package version before attempting to publish the
  same semantic version again
- Confirm stale Git tags were removed locally and remotely

### "Publishing fails with 403"

- Check GitHub Actions has `packages: write` permission
- Verify package name matches scope: `@tradenetcorp/...`
- Ensure `GITHUB_TOKEN` has proper scopes

### "Build fails during publish"

- Verify Terrazzo config is correct: `packages/tokens/terrazzo.config.js`
- Check token file format: `packages/tokens/src/design.tokens.json`
- Review build output in Actions logs

### "Version PR never created"

- Check `.changeset/config.json` has correct package names
- Verify changeset files are committed in PR
- Ensure changeset format is valid YAML frontmatter

## Configuration Files

- **Root config:** `package.json`, `turbo.json`
- **Changesets config:** `.changeset/config.json`
- **Tokens build:** `packages/tokens/terrazzo.config.js`
- **GitHub Actions:** `.github/workflows/ci.yml`, `.github/workflows/release.yml`
- **NPM registry:** `.npmrc`

## Key Commands

```bash
# Development
pnpm dev        # Start all dev servers
pnpm build      # Build all packages (via Turbo)
pnpm lint       # Lint all packages

# Changesets (manual - mostly for testing)
pnpm changeset  # Create changeset interactively

# Release (automated via CI)
pnpm release    # Publish packages (runs via Actions)
```

## Next Steps

1. Configure GitHub Actions permissions in repository settings
2. Test with manual PR including changeset
3. Integrate Veli Bridge Bot to auto-create changesets
4. Monitor first few releases
5. Document any custom team workflows
