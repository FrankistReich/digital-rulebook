import matter from 'gray-matter';
import { marked } from 'marked';
import markedFootnote from 'marked-footnote';
import type {
  Law,
  LawMeta,
  Recital,
  Article,
  Chapter,
  ChapterGroup,
  ProvisionBlock,
  ProvisionKind,
  NeighborLink,
  Endnote,
} from './types';
import {
  splitFootnotesFromHtml,
  extractEndnoteItems,
  buildEndnoteSeqMap,
  rewriteSupLabels,
} from './endnotes';

// ---------------------------------------------------------------------------
//  Markdown loading
//
//  Each law lives at:
//    src/content/laws/<slug>/meta.json
//    src/content/laws/<slug>/chapters.json   (optional)
//    src/content/laws/<slug>/recitals/<n>.md
//    src/content/laws/<slug>/articles/<n>.md
//
//  Per-provision .md files use the heading-anchored bilingual format. Each
//  paragraph (Absatz) and letter point (litera) is its own block with a
//  stable ID, allowing direct deep-links like
//    /laws/gdpr/articles/6/#p1-a
//
//  Example article body:
//
//    ## Abs. 1 {#p1}
//
//    :::en
//    Processing shall be lawful only if and to the extent that ...
//    :::
//
//    :::zh
//    只有在符合以下至少一项条件且在相应范围内 ...
//    :::
//
//    ### lit. a {#p1-a}
//
//    :::en
//    the data subject has given consent ...
//    :::
//
//    :::zh
//    数据主体就一项或多项特定目的同意处理 ...
//    :::
//
//  Recitals usually have no headings — they're a single paragraph and the
//  EN/ZH blocks sit at the top level.
// ---------------------------------------------------------------------------

marked.use(markedFootnote());
marked.setOptions({ gfm: true, breaks: false });

const metaModules = import.meta.glob<{ default: LawMeta }>(
  '../content/laws/*/meta.json',
  { eager: true },
);
const chapterModules = import.meta.glob<{ default: Chapter[] }>(
  '../content/laws/*/chapters.json',
  { eager: true },
);
const recitalSources = import.meta.glob<string>(
  '../content/laws/*/recitals/*.md',
  { eager: true, query: '?raw', import: 'default' },
);
const articleSources = import.meta.glob<string>(
  '../content/laws/*/articles/*.md',
  { eager: true, query: '?raw', import: 'default' },
);

function pickSlug(path: string): string {
  const m = path.match(/\/laws\/([^/]+)\//);
  if (!m) throw new Error(`Cannot derive law slug from path: ${path}`);
  return m[1];
}
function pickNumberFromPath(path: string): number {
  const m = path.match(/\/(\d+)\.md$/);
  if (!m) throw new Error(`Cannot derive provision number from path: ${path}`);
  return Number(m[1]);
}

// ---------------------------------------------------------------------------
//  Markdown → HTML, with footnote-id namespacing
// ---------------------------------------------------------------------------

/**
 * marked-footnote emits IDs like `footnote-1` / `footnote-ref-1` (numeric
 * labels) or `footnote-np` / `footnote-ref-np` (named labels — Article 1
 * uses `[^np]` / `[^自然人]` for bilingual notes). We rewrite both flavors
 * to a short prefix (`fn-` / `fnref-`) plus a `<lang>[-<blockId>]` segment
 * so footnotes from different blocks (and different languages of the same
 * block) can coexist in one DOM without clashing or breaking back-refs.
 *
 * Decision §16 #15 (2026-04-28): use `[^"]+` rather than `\d+` to cover
 * named footnotes too. The `-ref-` rewrite runs first so it can't be eaten
 * by the prefix-only rewrite.
 */
function suffixFootnoteIds(html: string, lang: 'en' | 'zh', blockId: string): string {
  const tag = blockId ? `${lang}-${blockId}` : lang;
  return html
    .replace(
      /(id|href)="(#?)footnote-ref-([^"]+)"/g,
      `$1="$2fnref-${tag}-$3"`,
    )
    .replace(/(id|href)="(#?)footnote-([^"]+)"/g, `$1="$2fn-${tag}-$3"`);
}

/**
 * Render markdown to HTML, suffix footnote IDs, then split off the inline
 * `<section class="footnotes">` so the rendered body contains only running
 * prose. Any `<li>` items pulled out of that section are pushed into the
 * caller-supplied `endnotesOut` accumulator (Phase 2: aggregated and
 * rendered by `<EndnotesSection/>` instead of inline per-block).
 */
function mdToHtml(
  md: string,
  lang: 'en' | 'zh',
  blockId: string,
  endnotesOut?: Endnote[],
): string {
  if (!md.trim()) return '';
  const html = marked.parse(md) as string;
  const suffixed = suffixFootnoteIds(html, lang, blockId);
  const { body, section } = splitFootnotesFromHtml(suffixed);
  if (section && endnotesOut) {
    endnotesOut.push(...extractEndnoteItems(section, lang, blockId));
  }
  return body;
}

// ---------------------------------------------------------------------------
//  Block parser — splits an .md body into ProvisionBlocks
// ---------------------------------------------------------------------------

interface RawBlock {
  id: string;
  level: number;
  heading?: string;
  en: string[];
  zh: string[];
}

const HEADING_RE = /^(#{2,4})\s+(.+?)\s+\{#([\w-]+)\}\s*$/;

function makeTopBlock(): RawBlock {
  return { id: '', level: 0, en: [], zh: [] };
}

function parseBlocks(
  content: string,
  endnotesOut?: Endnote[],
): ProvisionBlock[] {
  const lines = content.split('\n');
  const out: ProvisionBlock[] = [];
  let cur: RawBlock | null = null;
  let cap: 'en' | 'zh' | null = null;

  const ensure = () => { if (!cur) cur = makeTopBlock(); };
  const flushBlock = () => {
    if (!cur) return;
    const enMd = cur.en.join('\n').trim();
    const zhMd = cur.zh.join('\n').trim();
    if (enMd || zhMd || cur.heading) {
      out.push({
        id: cur.id,
        level: cur.level,
        heading: cur.heading,
        // Order matters: feed EN before ZH for each block so the EN reference
        // wins the merge order in `buildEndnoteSeqMap()`.
        content_en: mdToHtml(enMd, 'en', cur.id, endnotesOut),
        content_zh: mdToHtml(zhMd, 'zh', cur.id, endnotesOut),
      });
    }
    cur = null;
  };

  for (const raw of lines) {
    const line = raw.replace(/\r$/, '');

    const m = line.match(HEADING_RE);
    if (m) {
      cap = null;
      flushBlock();
      cur = {
        id: m[3],
        level: m[1].length - 1,
        heading: m[2].trim(),
        en: [],
        zh: [],
      };
      continue;
    }

    if (/^\s*:::\s*en\s*$/.test(line)) { ensure(); cap = 'en'; continue; }
    if (/^\s*:::\s*zh\s*$/.test(line)) { ensure(); cap = 'zh'; continue; }
    if (/^\s*:::\s*$/.test(line))      { cap = null;            continue; }

    if (cap && cur) {
      if (cap === 'en') cur.en.push(line);
      else cur.zh.push(line);
    }
  }
  flushBlock();
  return out;
}

/**
 * Concatenate per-block HTML for listing-page previews. Headings are stripped —
 * we just want the running body text.
 */
function joinPreview(blocks: ProvisionBlock[], lang: 'en' | 'zh'): string {
  return blocks
    .map((b) => (lang === 'en' ? b.content_en : b.content_zh))
    .filter(Boolean)
    .join('\n');
}

// ---------------------------------------------------------------------------
//  Frontmatter normalization — accept both DR-native and skill-style keys
//
//  The gdpr-bilingual-formatter skill produces frontmatter shaped like:
//    article: 6
//    title:
//      en: "Lawfulness of processing"
//      zh: "处理的合法性"
//    related: [gdpr-art5, gdpr-art7]
//    recitals: [40, 41, 42]
//
//  DR's native shape is flat:
//    number: 6
//    title_en: "Lawfulness of processing"
//    title_zh: "处理的合法性"
//    related: [5, 7]
//    related_recitals: [40, 41, 42]
//
//  This normalizer accepts either, so a file produced by the skill can be
//  dropped into src/content/laws/<slug>/articles/ with no conversion. Fields
//  that exist only in the skill's frontmatter (`law`, `chapter`,
//  `chapter_title`, `section`, ...) are intentionally dropped here — DR
//  derives them from the file path and chapters.json.
// ---------------------------------------------------------------------------
interface ArticleFrontmatter {
  number?: number;
  title_en?: string;
  title_zh?: string;
  last_reviewed?: string;
  source_version?: string;
  related?: number[];
  related_recitals?: number[];
  translation_notes?: string;
}

function asString(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

function normalizeRelatedNumbers(raw: unknown): number[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const nums: number[] = [];
  for (const item of raw) {
    if (typeof item === 'number' && Number.isFinite(item)) {
      nums.push(item);
    } else if (typeof item === 'string') {
      // Strip any prefix like "gdpr-art" — keep the trailing digits.
      const m = item.match(/(\d+)\s*$/);
      if (m) nums.push(Number(m[1]));
    }
  }
  return nums.length > 0 ? nums : undefined;
}

function normalizeArticleFrontmatter(data: Record<string, unknown>): ArticleFrontmatter {
  const title = (data.title as { en?: unknown; zh?: unknown } | undefined) ?? undefined;

  const numberCandidate =
    typeof data.number === 'number' ? data.number :
    typeof data.article === 'number' ? data.article :
    undefined;

  return {
    number: numberCandidate,
    title_en: asString(data.title_en) ?? asString(title?.en),
    title_zh: asString(data.title_zh) ?? asString(title?.zh),
    last_reviewed: asString(data.last_reviewed),
    source_version: asString(data.source_version),
    related: normalizeRelatedNumbers(data.related),
    // Skill calls this field `recitals`; DR uses `related_recitals` to avoid
    // collision with the recitals/ folder. Accept either.
    related_recitals:
      normalizeRelatedNumbers(data.related_recitals) ??
      normalizeRelatedNumbers(data.recitals),
    translation_notes: asString(data.translation_notes),
  };
}

// ---------------------------------------------------------------------------
//  Build the in-memory law catalog
// ---------------------------------------------------------------------------

function loadAll(): Law[] {
  const bySlug = new Map<
    string,
    { meta?: LawMeta; recitals: Recital[]; articles: Article[]; chapters: Chapter[] }
  >();

  const ensure = (slug: string) => {
    let entry = bySlug.get(slug);
    if (!entry) {
      entry = { recitals: [], articles: [], chapters: [] };
      bySlug.set(slug, entry);
    }
    return entry;
  };

  for (const [path, mod] of Object.entries(metaModules)) {
    ensure(pickSlug(path)).meta = mod.default;
  }
  for (const [path, mod] of Object.entries(chapterModules)) {
    ensure(pickSlug(path)).chapters = [...mod.default].sort(
      (a, b) => a.number - b.number,
    );
  }

  for (const [path, raw] of Object.entries(recitalSources)) {
    const slug = pickSlug(path);
    const fallback = pickNumberFromPath(path);
    const { data, content } = matter(raw);
    // Recitals don't currently render an EndnotesSection (Phase 2 target is
    // articles only). Pass no accumulator so any inline footnotes in a recital
    // are still suffixed and split, but simply discarded — no aggregation.
    const blocks = parseBlocks(content);
    const d = data as { number?: number; recital?: number; article?: number };
    const number = d.number ?? d.recital ?? d.article ?? fallback;
    ensure(slug).recitals.push({
      number,
      blocks,
      content_en: joinPreview(blocks, 'en'),
      content_zh: joinPreview(blocks, 'zh'),
    });
  }

  for (const [path, raw] of Object.entries(articleSources)) {
    const slug = pickSlug(path);
    const fallback = pickNumberFromPath(path);
    const { data, content } = matter(raw);

    // Phase 2: collect all footnote items across blocks so we can build a
    // single article-wide seqMap, then rewrite each block's `<sup>` labels
    // to use the global sequence number instead of marked-footnote's
    // per-block 1..N.
    const endnoteItems: Endnote[] = [];
    const blocks = parseBlocks(content, endnoteItems);
    const { merged, seqMap } = buildEndnoteSeqMap(endnoteItems);
    if (merged.length > 0) {
      for (const b of blocks) {
        b.content_en = rewriteSupLabels(b.content_en, seqMap);
        b.content_zh = rewriteSupLabels(b.content_zh, seqMap);
      }
    }

    const fm = normalizeArticleFrontmatter(data as Record<string, unknown>);
    ensure(slug).articles.push({
      number: fm.number ?? fallback,
      title_en: fm.title_en ?? '',
      title_zh: fm.title_zh ?? '',
      blocks,
      content_en: joinPreview(blocks, 'en'),
      content_zh: joinPreview(blocks, 'zh'),
      last_reviewed: fm.last_reviewed,
      source_version: fm.source_version,
      related: fm.related,
      related_recitals: fm.related_recitals,
      translation_notes: fm.translation_notes,
      endnotes: merged.length > 0 ? merged : undefined,
      endnoteSeqMap: merged.length > 0 ? seqMap : undefined,
    });
  }

  const laws: Law[] = [];
  for (const [slug, entry] of bySlug) {
    if (!entry.meta) throw new Error(`Missing meta.json for law "${slug}"`);
    laws.push({
      ...entry.meta,
      recitals: entry.recitals.sort((a, b) => a.number - b.number),
      articles: entry.articles.sort((a, b) => a.number - b.number),
      chapters: entry.chapters,
    });
  }

  return laws.sort((a, b) => {
    if (a.id === 'gdpr') return -1;
    if (b.id === 'gdpr') return 1;
    return a.in_force_date.localeCompare(b.in_force_date);
  });
}

const ALL_LAWS = loadAll();

export function getAllLaws(): Law[] {
  return ALL_LAWS;
}

export function getLaw(slug: string): Law | undefined {
  return ALL_LAWS.find((l) => l.slug === slug);
}

export function getNeighbors(
  law: Law,
  kind: ProvisionKind,
  number: number,
): { prev?: NeighborLink; next?: NeighborLink } {
  const list = kind === 'recital' ? law.recitals : law.articles;
  const idx = list.findIndex((p) => p.number === number);
  if (idx === -1) return {};

  const folder = kind === 'recital' ? 'recitals' : 'articles';
  const labelEn = kind === 'recital' ? 'Recital' : 'Article';
  const labelZhPrefix = '第 ';
  const labelZhSuffix = kind === 'recital' ? ' 段' : ' 条';

  const make = (n: number): NeighborLink => ({
    href: `/laws/${law.slug}/${folder}/${n}/`,
    label_en: `${labelEn} ${n}`,
    label_zh: `${labelZhPrefix}${n}${labelZhSuffix}`,
  });

  return {
    prev: idx > 0 ? make(list[idx - 1].number) : undefined,
    next: idx < list.length - 1 ? make(list[idx + 1].number) : undefined,
  };
}

export function getChapterFor(law: Law, articleNumber: number): Chapter | undefined {
  return law.chapters.find(
    (c) => articleNumber >= c.from && articleNumber <= c.to,
  );
}

export function groupArticlesByChapter(law: Law): ChapterGroup[] {
  const groups: ChapterGroup[] = law.chapters.map((chapter) => ({
    chapter,
    articles: law.articles.filter(
      (a) => a.number >= chapter.from && a.number <= chapter.to,
    ),
  }));

  const orphan = law.articles.filter((a) => !getChapterFor(law, a.number));
  if (orphan.length > 0) {
    groups.push({
      chapter: {
        number: 0,
        roman: '—',
        title_en: 'Unassigned',
        title_zh: '未分类',
        from: 0,
        to: 0,
      },
      articles: orphan,
    });
  }

  return groups.filter((g) => g.articles.length > 0);
}
