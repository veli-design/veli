import { z, defineCollection } from 'astro:content';

const pageSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  animation: z
    .object({
      src: z.string(),
      label: z.string(),
    })
    .optional(),
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

const gettingStartedCollection = defineCollection({
  type: 'content',
  schema: pageSchema.extend({
    description: z.string(),
    order: z.number().int().positive(),
    navTitle: z.string().optional(),
  }),
});

export const collections = {
  docs: docsCollection,
  foundations: foundationsCollection,
  patterns: patternsCollection,
  'getting-started': gettingStartedCollection,
};
