import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const pageSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
});

const docsCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
  schema: pageSchema,
});

const foundationsCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/foundations' }),
  schema: pageSchema,
});

const patternsCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/patterns' }),
  schema: pageSchema,
});

export const collections = {
  docs: docsCollection,
  foundations: foundationsCollection,
  patterns: patternsCollection,
  guides: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' }),
    schema: pageSchema,
  }),
};
