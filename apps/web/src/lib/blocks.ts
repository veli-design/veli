import { getBlocks, blockMarkdown } from '@tradenetcorp/veli-blocks/catalog';

export const blocks = getBlocks();

function showLifecycleStatus({ manifest }: (typeof blocks)[number]) {
  return manifest.id !== 'notification-tray' || manifest.status !== 'experimental';
}

export const blocksOverviewMarkdown = `# Veli Blocks

Editable compositions built from Veli primitives. Install tokens and primitives through npm; copy block source into your application and own its adaptations and updates.

## CLI setup

Use Node.js 24 or newer and run \`pnpm dlx @veli-design/cli init\` from your application's package directory. New projects default to \`https://veli.design\`; no registry URL argument is needed. Choose where to copy Blocks, then run \`pnpm dlx @veli-design/cli list\` to browse or \`pnpm dlx @veli-design/cli add\` to install interactively. Pass a Block ID to \`add\` for a specific block.

Initialization saves the registry URL and destination in \`.veli/config.json\`. Install and configure the React and token packages, styles and providers separately using the package setup documentation.

Existing projects keep their saved registry URL. For local or preview registries, use \`--web-url\` or \`VELI_WEB_URL\`; the flag takes precedence over the environment, which takes precedence over saved configuration. Command overrides do not rewrite an existing configuration. CLI 0.2.0 and older require \`--web-url https://veli.design\` when initializing.

Protected registries require authorized access from your network. The default URL does not bypass access protection. Use \`pnpm dlx @veli-design/cli auth status\` to check access before or after initialization. Public registries do not require an access grant.

## Available blocks

${blocks
  .map(
    (block) =>
      `- [${block.manifest.title}](/blocks/${block.manifest.id}/): ${block.manifest.description}${showLifecycleStatus(block) ? ` (${block.manifest.status})` : ''}`,
  )
  .join('\n')}

## Ownership and updates

Check each block’s lifecycle status and dependency requirements before adoption. The CLI retains the exact source and receipt used for installation, reports available versions with \`veli status\`, and performs recoverable three-way updates with \`veli update\`.

Primitives remain maintained npm dependencies. Updating a primitive does not automatically update copied composition logic. Application changes remain owned by the consuming project and are never silently overwritten.
`;
export const blockPages = [
  {
    id: 'blocks',
    title: 'Veli Blocks',
    description: 'Editable compositions built from Veli primitives.',
    markdown: blocksOverviewMarkdown,
  },
  ...blocks.map((block) => ({
    id: `blocks/${block.manifest.id}`,
    title: block.manifest.title,
    description: block.manifest.description,
    markdown: showLifecycleStatus(block)
      ? blockMarkdown(block)
      : blockMarkdown(block).replace(/^Status: \*\*experimental\*\* · /m, ''),
  })),
];
