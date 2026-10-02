import { getBlocks, blockMarkdown } from '@tradenetcorp/veli-blocks/catalog';

export const blocks = getBlocks();
export const blocksOverviewMarkdown = `# Veli Blocks

Editable compositions built from Veli primitives. Install tokens and primitives through npm; copy block source into your application and own its adaptations and updates.

Initialize a consuming application with \`pnpm dlx @tradenetcorp/veli init\`. Run \`veli add\` to browse and install blocks interactively, or \`veli add <id>\` for a specific block.

## Available blocks

${blocks.map(({ manifest }) => `- [${manifest.title}](/blocks/${manifest.id}/): ${manifest.description} (${manifest.status})`).join('\n')}

## Ownership and updates

Blocks are experimental and initially supported for internal teams with Veli package access. The CLI retains the exact source and receipt used for installation, reports available versions with \`veli status\`, and performs recoverable three-way updates with \`veli update\`.

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
    markdown: blockMarkdown(block),
  })),
];
