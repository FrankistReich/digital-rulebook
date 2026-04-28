// ---------------------------------------------------------------------------
//  Astro 5 collection declarations
// ---------------------------------------------------------------------------
//
//  Astro 5 deprecated implicit content-folder collections. Without this file
//  the build emits:
//
//    Auto-generating collections for folders in "src/content/" that are not
//    defined as collections. This is deprecated...
//
//  We don't actually use Astro's `getCollection()` API for the bilingual law
//  data — `src/lib/laws.ts` does its own block-aware loader via
//  `import.meta.glob` so it can parse the `:::en` / `:::zh` fences and
//  build the deep-link block IDs that the loader emits. This file's only job
//  is to silence the deprecation warning by declaring the `laws` collection
//  with a permissive schema.
//
//  If a future feature needs `getCollection('laws')` (e.g., a typed list of
//  every article across every law for a global search), tighten the schema
//  then. For now `z.object({}).passthrough()` accepts whatever frontmatter
//  the .md files carry — DR-native flat keys, skill-style nested keys, or
//  the new tail-paragraph blocks introduced in Article 6.
// ---------------------------------------------------------------------------

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const laws = defineCollection({
  // Glob both subfolders so each .md file lands as one entry; meta.json /
  // chapters.json are intentionally excluded — they're consumed directly by
  // `lib/laws.ts` via `import.meta.glob`, not via the collection API.
  loader: glob({
    pattern: '**/{recitals,articles}/*.md',
    base: './src/content/laws',
  }),
  schema: z.object({}).passthrough(),
});

export const collections = { laws };
