import type { Endnote, MergedEndnote } from './types';

// ---------------------------------------------------------------------------
//  Endnote pipeline
//
//  marked-footnote emits, per markdown block, an inline `<section
//  class="footnotes">` with an `<ol>` of `<li id="fn-…">` items. After
//  `suffixFootnoteIds()` rewrites those IDs to `fn-<lang>-<blockId>-<label>`
//  and `fnref-<lang>-<blockId>-<label>`, this module:
//
//    1. splits each block's HTML into body + inline footnote-section
//    2. extracts one `Endnote` per `<li>`
//    3. across the full article, merges EN/ZH halves into `MergedEndnote`
//       items keyed by a stripped-language `mergeKey` and assigns a 1-indexed
//       global `seqNum` in first-mention order
//    4. exposes `rewriteSupLabels()` so `BilingualBlocks` can replace the
//       per-block `<sup>` numbers with the article-wide `seqNum`
//
//  Two design constraints worth noting:
//
//  - We do NOT use a real DOM parser (no jsdom/cheerio dependency). The
//    regexes below are scoped tightly to marked-footnote's known output
//    shape; if marked-footnote upgrades and changes its markup, the audit
//    in GAP_AUDIT §16 calls for re-validation against live HTML.
//
//  - "Merge" means EN+ZH halves of the *same logical footnote* (`[^np]` and
//    `[^自然人]` written by the article author as two separate marked-
//    footnote definitions) end up sharing one `seqNum`. Numeric labels
//    (`[^1]` / `[^1]` written identically in both languages) merge for the
//    same reason: their mergeKey strips the `en-`/`zh-` segment.
// ---------------------------------------------------------------------------

/**
 * Split one block's already-suffixed HTML into its visible body and the
 * inline `<section class="footnotes">` block (if any). Returns the body
 * with the footnote section removed and the section itself for later
 * extraction. Both strings are trimmed.
 */
export function splitFootnotesFromHtml(html: string): {
  body: string;
  section: string | null;
} {
  // marked-footnote emits exactly one <section class="footnotes" ...> per
  // markdown block, always at the end. Non-greedy match stops at the first
  // closing </section>, which is safe because <section> is not nested by
  // marked-footnote inside the footnote block.
  const re = /<section\b[^>]*\bclass="footnotes"[^>]*>[\s\S]*?<\/section>/i;
  const m = html.match(re);
  if (!m || m.index === undefined) return { body: html.trim(), section: null };
  const section = m[0];
  const body = (html.slice(0, m.index) + html.slice(m.index + section.length)).trim();
  return { body, section };
}

/**
 * Extract one `Endnote` per `<li id="fn-…">` inside a footnote section.
 * The `<li>` inner HTML is preserved verbatim, including marked-footnote's
 * trailing `<a class="data-footnote-backref">↩</a>` (we keep it so the
 * `EndnotesSection` can render the back-ref column from the same content).
 */
export function extractEndnoteItems(
  section: string,
  lang: 'en' | 'zh',
  blockId: string,
): Endnote[] {
  const items: Endnote[] = [];
  // Captures: 1 = full rawId (fn-…), 2 = inner HTML up to </li>.
  // Using [\s\S]*? to span newlines; non-greedy so we stop at the first </li>.
  const re = /<li\b[^>]*\bid="(fn-[^"]+)"[^>]*>([\s\S]*?)<\/li>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(section)) !== null) {
    items.push({
      rawId: m[1],
      lang,
      blockId,
      contentHtml: m[2].trim(),
    });
  }
  return items;
}

/**
 * Across all blocks of one article: pair EN+ZH halves of each footnote
 * **by occurrence order within the same block**, assign a 1-indexed
 * `seqNum` in document order, and return both the merged list and the
 * per-rawId `seqMap` lookup used by `rewriteSupLabels()`.
 *
 * Why occurrence-order rather than ID-equality:
 *
 * marked-footnote slugifies non-ASCII labels to URL-encoded form
 * (`[^自然人]` → `id="footnote-%E8%87%AA%E7%84%B6%E4%BA%BA"`), so the
 * Chinese half of a logical footnote written as `[^自然人]` will never
 * share an ID-suffix with its English half written as `[^np]`. Pairing
 * by position is the only assumption that survives: the n-th footnote in
 * the EN block of `p1` corresponds to the n-th footnote in the ZH block
 * of `p1`. That convention is also how every bilingual legal text we've
 * looked at structures cross-language footnotes (EUR-Lex, JuriGlobe).
 *
 * `items` must already be in document order — for each block, EN items
 * pushed before ZH items, and blocks fed in source order. `parseBlocks()`
 * in laws.ts maintains this contract.
 *
 * Trade-off: if an author writes 3 EN footnotes but only 2 ZH ones for
 * the same block, the 3rd EN footnote ends up unpaired (zh half empty)
 * and seqNum keeps incrementing — which is the right behavior, the
 * EndnotesSection just shows an EN-only row in 双语 mode.
 */
export function buildEndnoteSeqMap(items: Endnote[]): {
  merged: MergedEndnote[];
  seqMap: Record<string, number>;
} {
  // Group by blockId, preserving the lang-then-occurrence order within
  // each block. Map preserves insertion order, so blocks come out in the
  // order their first item was seen — i.e. document order.
  const byBlock = new Map<string, Endnote[]>();
  for (const it of items) {
    let bucket = byBlock.get(it.blockId);
    if (!bucket) {
      bucket = [];
      byBlock.set(it.blockId, bucket);
    }
    bucket.push(it);
  }

  const merged: MergedEndnote[] = [];
  const seqMap: Record<string, number> = {};
  let nextSeq = 1;

  for (const [blockId, bucket] of byBlock) {
    const ens = bucket.filter((i) => i.lang === 'en');
    const zhs = bucket.filter((i) => i.lang === 'zh');
    const max = Math.max(ens.length, zhs.length);
    for (let i = 0; i < max; i++) {
      const en = ens[i];
      const zh = zhs[i];
      const entry: MergedEndnote = {
        seqNum: nextSeq++,
        mergeKey: `${blockId || 'top'}-${i}`,
        blockId,
      };
      if (en) {
        entry.en = { rawId: en.rawId, contentHtml: en.contentHtml };
        seqMap[en.rawId] = entry.seqNum;
      }
      if (zh) {
        entry.zh = { rawId: zh.rawId, contentHtml: zh.contentHtml };
        seqMap[zh.rawId] = entry.seqNum;
      }
      merged.push(entry);
    }
  }

  return { merged, seqMap };
}

/**
 * Rewrite the inline `<sup>` reference labels in one block's body HTML so
 * the user sees the article-wide `seqNum` instead of marked-footnote's
 * per-block `1, 2, 3…` numbering.
 *
 * marked-footnote 1.x emits the reference as:
 *
 *   <sup ...><a href="#fn-XXX" id="fnref-XXX" data-footnote-ref ...>3</a></sup>
 *
 * The label sits as the anchor's text content. We replace ONLY when the
 * href targets `#fn-…` (i.e. forward refs into the footnote list) — the
 * back-ref `<a href="#fnref-…">↩</a>` inside endnotes section is untouched
 * because it points at `#fnref-`, not `#fn-`.
 */
export function rewriteSupLabels(
  html: string,
  seqMap: Record<string, number>,
): string {
  return html.replace(
    /(<a\b[^>]*\bhref="#)(fn-[^"]+)("[^>]*>)([^<]+)(<\/a>)/g,
    (full, head, fnId, mid, _label, tail) => {
      const seq = seqMap[fnId];
      return seq === undefined ? full : `${head}${fnId}${mid}${seq}${tail}`;
    },
  );
}
