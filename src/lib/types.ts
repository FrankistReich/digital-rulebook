export interface LawMeta {
  id: string;
  slug: string;
  short_title: string;
  title_en: string;
  title_zh: string;
  celex: string;
  official_url: string;
  in_force_date: string;
  description_en: string;
  description_zh: string;
  /** Hex accent color used for cards & headings. */
  color: string;
  /**
   * Total number of articles in the official text. When set, LawCard renders
   * coverage as `{written} / {total} articles` instead of just `{written}`,
   * signalling that the site is a living document. Omit if unknown.
   */
  total_articles?: number;
  /** Same idea for recitals. */
  total_recitals?: number;
}

/**
 * One structural unit inside an article (or a recital). Three levels exist:
 *
 *   level 0 — top-level body, no heading (recitals, definitional articles)
 *   level 1 — paragraph (Absatz),  heading like "Abs. 1",  id "p1"
 *   level 2 — letter point (litera), heading like "lit. a", id "p1-a"
 *   level 3 — sub-point (rare), heading like "point (i)",   id "p1-a-i"
 *
 * Each block carries its own already-rendered EN and ZH HTML so the page
 * template can lay them out side by side, anchored at the same vertical
 * position. Stable `id`s become URL fragments — citing
 * `/laws/gdpr/articles/6/#p1-a` deep-links straight to Art. 6(1)(a).
 */
export interface ProvisionBlock {
  /** Anchor ID such as "p1", "p1-a", "p1-a-i". Empty string for level-0 blocks. */
  id: string;
  /** 0 = body, 1 = paragraph, 2 = letter, 3 = sub-point. */
  level: number;
  /** Display label as written in the .md heading, e.g. "Abs. 1", "lit. a". */
  heading?: string;
  /** Rendered HTML, English. */
  content_en: string;
  /** Rendered HTML, Chinese. */
  content_zh: string;
}

export interface Recital {
  number: number;
  blocks: ProvisionBlock[];
  /** Concatenated plain-text-ish HTML (used by listing pages for previews). */
  content_en: string;
  content_zh: string;
}

export interface Article {
  number: number;
  title_en: string;
  title_zh: string;
  blocks: ProvisionBlock[];
  /** Concatenated HTML for listing-page previews. */
  content_en: string;
  content_zh: string;
  // ----- optional skill-style metadata -----
  /** ISO date when this file was last reviewed. */
  last_reviewed?: string;
  /** ISO date of the consolidated source version this text reflects. */
  source_version?: string;
  /** Numbers of related articles within the same law. */
  related?: number[];
  /** Recital numbers that explain or motivate this article. */
  related_recitals?: number[];
  /** Free-form note about translation status. */
  translation_notes?: string;
  // ----- Phase 2: build-time endnote aggregation -----
  /**
   * Footnotes pulled out of the inline `<section class="footnotes">` blocks
   * that `marked-footnote` emits per-block, merged across EN/ZH and
   * renumbered globally per article. Rendered by `<EndnotesSection/>` at
   * the end of the article body.
   */
  endnotes?: MergedEndnote[];
  /**
   * Map from raw footnote ID (e.g. `fn-en-p1-np`) to its global sequence
   * number within this article. Used by `BilingualBlocks` to rewrite the
   * inline `<sup>` label so the user sees `[3]` instead of marked-footnote's
   * raw 1-per-block numbering.
   */
  endnoteSeqMap?: Record<string, number>;
}

/**
 * One footnote item extracted from a single block's `<section class="footnotes">`.
 * One per language per block — i.e. the EN and ZH halves of the same logical
 * footnote (`[^np]` / `[^自然人]`) start as two separate `Endnote` objects and
 * get merged later by `buildEndnoteSeqMap()` into a single `MergedEndnote`.
 */
export interface Endnote {
  /** Suffixed ID such as `fn-en-p1-np` or `fn-zh-p1-1`. Unique per block + lang. */
  rawId: string;
  lang: 'en' | 'zh';
  /** Owning block's anchor (`p1`, `p1-a`, ...) — empty for level-0 blocks. */
  blockId: string;
  /** Inner HTML of the `<li>`, with the trailing `↩` back-ref still attached. */
  contentHtml: string;
}

/**
 * EN/ZH halves of a logical footnote, keyed by a shared global sequence number.
 * Built by `buildEndnoteSeqMap()` per article — order matches first-mention
 * sequence in document order, EN block scanned before ZH block within the same
 * provision block.
 */
export interface MergedEndnote {
  /** 1-indexed global sequence within the article. */
  seqNum: number;
  /** Lang-stripped key shared by EN+ZH halves, e.g. `fn-p1-np`. */
  mergeKey: string;
  /** Owning block's anchor for the context pill (`p1`, `p1-a`, ...). */
  blockId: string;
  en?: { rawId: string; contentHtml: string };
  zh?: { rawId: string; contentHtml: string };
}

export interface Chapter {
  number: number;
  roman: string;
  title_en: string;
  title_zh: string;
  from: number;
  to: number;
}

export interface Law extends LawMeta {
  recitals: Recital[];
  articles: Article[];
  chapters: Chapter[];
}

export interface ChapterGroup {
  chapter: Chapter;
  articles: Article[];
}

export type ProvisionKind = 'recital' | 'article';

export interface NeighborLink {
  href: string;
  label_en: string;
  label_zh: string;
}
