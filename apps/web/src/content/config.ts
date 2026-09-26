import { z, defineCollection } from 'astro:content';

const pageSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
});

const docsCollection = defineCollection({
  type: 'content',
  schema: pageSchema,
});

const foundationsCollection = defineCollection({
  type: 'content',
  schema: pageSchema,
});

const patternsCollection = defineCollection({
  type: 'content',
  schema: pageSchema,
});

export const collections = {
  docs: docsCollection,
  foundations: foundationsCollection,
  patterns: patternsCollection,
};
