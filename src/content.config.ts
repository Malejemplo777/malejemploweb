import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
  }),
});

// Spanish versions live in their own collection (served under /es/guias/).
// `translationOf` is the id of the English guide this one translates, which
// is what wires the language switcher and hreflang between the two.
const guidesEs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides-es' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    translationOf: z.string(),
  }),
});

export const collections = { guides, guidesEs };
