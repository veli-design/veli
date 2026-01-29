# Release & Publishing Setup

This monorepo uses [Changesets](https://github.com/changesets/changesets) for automated versioning and releases to GitHub Packages.

## Architecture Overview

### Packages Published

- `@tradenetcorp/coral-tokens` - Design tokens (DTCG → CSS/Tailwind)
- `@tradenetcorp/coral-ui` - React components

### Apps (Not Published)

- `@tradenetcorp/coral-web` - Documentation site
- `@tradenetcorp/coral-storybook` - Component development

## Automated Release Workflow

```
1. Coral Bridge (Figma Plugin)
   ↓ Syncs design tokens to repository

2. Coral Bridge Bot (GitHub App)
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

## How Selective Releases Work

**Changesets determines what to publish based on changeset files:**

- Only packages mentioned in `.changeset/*.md` files get versioned
- Only versioned packages get published
- App packages are ignored via `.changeset/config.json`

**Example scenarios:**

- Token sync only → Only `@tradenetcorp/coral-tokens` publishes
- Token + UI changes → Both packages publish
- Web site changes → Nothing publishes (ignored by config)

## Manual Testing

```bash
# Create a test changeset (interactive prompt)
pnpm changeset

# Check changeset status
pnpm changeset status

# Preview version bumps
pnpm changeset version --dry-run

# View changeset files
cat .changeset/*.md
```

## Changeset Format

**File location:** `.changeset/[unique-id].md`

**Patch version (token value updates):**

```markdown
---
'@tradenetcorp/coral-tokens': patch
---

Updated design tokens from Figma
```

**Minor version (new tokens added):**

```markdown
---
'@tradenetcorp/coral-tokens': minor
---

Added new color tokens for success states
```

**Major version (breaking changes):**

```markdown
---
'@tradenetcorp/coral-tokens': major
---

BREAKING: Removed deprecated token values
```

**Multiple packages:**

```markdown
---
'@tradenetcorp/coral-tokens': patch
'@tradenetcorp/coral-ui': patch
---

Updated design tokens and corresponding UI components
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

Currently set to `"private": true` for safety. Change to `"private": false` when ready to publish.

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
- Coral Bridge Bot must create `.changeset/*.md` in the PR

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
3. Integrate Coral Bridge Bot to auto-create changesets
4. Monitor first few releases
5. Document any custom team workflows
