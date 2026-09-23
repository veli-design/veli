import { getBlocks, blockMarkdown } from '@tradenetcorp/veli-blocks/catalog';

export const blocks = getBlocks();
export const blocksOverviewMarkdown = `# Veli Blocks

Editable compositions built from Veli primitives. Install tokens and primitives through npm; copy block source into your application and own its adaptations and updates.

## Available blocks

${blocks.map(({ manifest }) => `- [${manifest.title}](/blocks/${manifest.id}/): ${manifest.description} (${manifest.status})`).join('\n')}

## Ownership and updates

Blocks are experimental and initially supported for internal teams with Veli package access. Each download includes source, setup guidance, and a versioned baseline with a receipt. Retain that baseline before customizing. Review upstream changes against both the original and your adapted copy; apply updates deliberately and test your application.

Primitives remain maintained npm dependencies. Updating a primitive does not automatically update copied composition logic. Registry tooling and automatic update merging are outside this initial release.
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
