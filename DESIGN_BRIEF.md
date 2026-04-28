# Digital Rulebook — Design Handoff Brief

**Audience:** another Claude conversation tasked with iterating on the visual
design. This file is the single source of truth for "what the project is, what's
been decided, and what's open." Paste it as your first context message and
attach the project folder.

---

## 1. Mission & audience

**What it is**: a bilingual (English / 中文) reference website for EU digital
regulations. Currently scoped to **GDPR** (Regulation 2016/679); future
regulations (Data Act, AI Act, DSA, DMA) will live under the same content
model.

**Who reads it**:

- **Lawyers / compliance professionals** — quick lookup, accurate citations,
  paragraph-precise links. Often arrive from search engines or LLM citations,
  read one provision, leave.
- **Students / researchers** — extended reading, cross-reference between
  related articles + recitals, switch languages.
- **Chinese-speaking practitioners working with EU law** — need the bilingual
  side-by-side; English-only EU sources don't serve them; Chinese-only
  translations lack authority.

**Core value props** (already shipped):

1. Side-by-side EN/ZH per paragraph, not per article — so reader's eyes don't
   scan two whole columns to find the matching sentence.
2. **Deep linking down to the letter level** — `/laws/gdpr/articles/6/#p1-a`
   lands directly on Art. 6(1)(a) and highlights it. This is the main
   differentiator vs gdpr-info.eu.
3. Three language modes (中 / EN / 中英), persisted via `localStorage`,
   instant client-side switch (no URL change, both languages always in HTML →
   SEO + LLM citation friendly).

---

## 2. Current visual language (one-paragraph summary)

Restrained, modern legal-publication aesthetic. Navy blue (`#0b3d91`) as the
single accent color. Soft grays for borders and secondary text. Cream page
background. **Serif headings** (Noto Serif + Noto Serif SC), **sans body**
(Inter + Noto Sans SC) — the inversion of typical legal sites where the body
is serif. Section headings use small-caps mono eyebrow style for chrome
labels. Permalink `§` glyphs fade in on hover. Block-level `:target` highlight
is yellow with 2.4s fade-out animation.

Reference points: gdpr-info.eu (structure, restraint), but more modern; visual
density closer to Stripe Docs than to Wikipedia.

---

## 3. Tech stack & file layout

```
Astro 5 + Tailwind v4 (CSS-first config) + @fontsource (self-hosted)
Pure static output. Zero client-side framework. ~150 KB first-paint.
```

Key directories:

```
src/
├── content/laws/gdpr/        ← all content (loader auto-discovers)
│   ├── meta.json             ← law-level metadata
│   ├── chapters.json         ← chapter ranges (single source of truth)
│   ├── recitals/N.md         ← per-provision MD with bilingual blocks
│   └── articles/N.md
├── lib/
│   ├── types.ts              ← ProvisionBlock, Article, Recital, Law, ...
│   └── laws.ts               ← block-aware MD loader; chapter helpers
├── styles/global.css         ← @theme tokens + base + language visibility
├── components/               ← see §6
├── layouts/                  ← BaseLayout, ProvisionLayout
└── pages/
    ├── index.astro                          → /
    ├── about.astro                          → /about/
    ├── 404.astro
    └── laws/[law]/
        ├── index.astro                      → /laws/gdpr/
        ├── recitals/index.astro             → /laws/gdpr/recitals/
        ├── recitals/[id].astro              → /laws/gdpr/recitals/N/
        ├── articles/index.astro             → /laws/gdpr/articles/
        └── articles/[id].astro              → /laws/gdpr/articles/N/
```

---

## 4. Design tokens (verbatim from `src/styles/global.css`)

Tailwind v4 `@theme` block — CSS variables auto-emitted as classes
(`bg-[--color-brand]`, `text-[--color-ink-soft]`, etc.):

```css
@theme {
  /* Fonts */
  --font-sans:  "Inter", "Noto Sans SC", "PingFang SC", "Microsoft YaHei",
                ui-sans-serif, system-ui, sans-serif;
  --font-serif: "Noto Serif", "Noto Serif SC", Georgia, "Times New Roman",
                serif;

  /* Colors */
  --color-ink:         #0f172a;   /* main text */
  --color-ink-soft:    #475569;   /* secondary text */
  --color-rule:        #e2e8f0;   /* borders */
  --color-paper:       #ffffff;
  --color-cream:       #f8fafc;   /* page background */
  --color-brand:       #0b3d91;   /* navy blue, single accent */
  --color-brand-soft:  #eaf0fb;   /* hover/selected states */
  --color-accent:      #b91c1c;   /* not currently used */
}
```

Self-hosted font weights (only these are loaded — synthesis fills gaps):

- Inter / Noto Sans SC: **400, 500, 700**
- Noto Serif / Noto Serif SC: **400, 600, 700**

Note: a few elements use `font-semibold` (600) on sans → browser synthesizes
from 500 or 700. Visual diff is minor on Inter; can be cleaned up by changing
those instances to `font-bold` if a designer wants strict weight fidelity.

---

## 5. Bilingual visibility contract (CRITICAL — read before changing UI)

`<html>` always carries one of three classes: `lang-en`, `lang-zh`, or
`lang-both` (default). Both languages are always in the HTML; CSS hides the
unwanted one.

**Four utility classes** govern how each piece of text behaves:

| Class | EN mode | ZH mode | 中英 mode | Use for |
|---|:-:|:-:|:-:|---|
| `.lang-en-only` | shown | hidden | **shown** | Content (titles, body, descriptions) — both shown when bilingual |
| `.lang-zh-only` | hidden | shown | **shown** | (paired with `.lang-en-only`) |
| `.lang-en-strict` | shown | hidden | **hidden** | Chrome (UI labels, breadcrumbs, section headings, button text) — only ZH wins in bilingual |
| `.lang-zh-strict` | hidden | shown | **hidden** | (paired with `.lang-en-only` for "EN wins in bilingual" cases — currently only `Art. N` labels) |

**Rules of thumb the next designer should preserve:**

- Substantive content (article body, recital body, hero copy, About page,
  feature card descriptions, footer disclaimer) → use `lang-en-only` +
  `lang-zh-only` so bilingual mode shows both.
- UI chrome (nav, breadcrumbs, "Previous/Next", section labels like
  "Recitals" / "Articles", LawCard counts, empty states, button text, page
  titles for 404/About) → use `lang-en-strict` + `lang-zh-only` so bilingual
  mode shows ZH only.
- The `Art. N` article-number label is the **single special case**: uses
  `lang-en-only` + `lang-zh-strict` so bilingual mode shows English `Art. N`.
  Rationale: the user explicitly chose this. EN form is more compact and
  universally readable for citation contexts. Don't quietly change it.

These rules are documented in `src/styles/global.css` under "Language
visibility". The CSS rules are short — read them.

---

## 6. Component inventory

All `.astro` files. Props shown for non-trivial cases.

| Component | Props | Purpose |
|---|---|---|
| `BaseLayout` | `title, description?, path?` | HTML shell, font links, sticky header, FOUC-prevention inline script for language preference |
| `Header` | — | Sticky top bar with logo, law links, About, mobile menu, LangSwitcher |
| `Footer` | — | Copyright + disclaimer (small chrome) |
| `LangSwitcher` | — | 中 / EN / 中英 three-state toggle, persists to localStorage `dr-lang` |
| `LawCard` | `law` | Home page card showing one law with counts, dates, color dot |
| `ProvisionLayout` | `law, kind, number, titleEn, titleZh, blocks, metadata?, path` | Article/recital page chrome: TOC sidebar, breadcrumb, eyebrow, chapter line, h1, body (`<BilingualBlocks>`), metadata `<aside>`, prev/next |
| `BilingualBlocks` | `blocks: ProvisionBlock[]` | The body. For each block, renders a `<section id="...">` with optional heading + 2-column EN/ZH grid |
| `TocSidebar` | `law, kind, current?` | Sticky sidebar listing all recitals (flat) or articles (grouped by chapter) |
| `PrevNextNav` | `prev?, next?` | Bottom-of-page paginated cards |

Layout grid (`ProvisionLayout`): `md:grid-cols-[260px_1fr]` — sidebar left,
content right. Stacks on mobile.

---

## 7. Pages — visual responsibilities

| Route | What's there | Visual priority |
|---|---|---|
| `/` | Hero ("A clean bilingual reference..."), 1 LawCard for GDPR, 3 feature blurbs | Marketing-ish — should feel inviting, high-quality, low-pressure |
| `/about/` | h1 + 3 paragraphs of explanatory copy | Plain reading page |
| `/laws/gdpr/` | CELEX badge, h1, description, 2-column directory: Recitals (numbered list w/ previews) + Articles (grouped by chapter, with titles) | Densest "directory" view — needs to scan well at 99 articles + 173 recitals |
| `/laws/gdpr/recitals/` | Standalone recitals list page (similar to the law-page recitals column but full-width) | Low priority — most users navigate from /laws/gdpr/ |
| `/laws/gdpr/articles/` | Standalone articles list page | Same |
| `/laws/gdpr/articles/N/` | TOC sidebar + breadcrumb + eyebrow + chapter line + h1 (Article title bilingual) + per-block side-by-side EN/ZH + metadata `<dl>` + prev/next | **Most important page** — this is where 80% of reading happens |
| `/laws/gdpr/recitals/N/` | Same shape, no chapter line | Recitals are usually one block (no Abs. headings) |
| `/404` | Error page | Plain |

---

## 8. Block + deep-link contract (don't break this)

Each provision MD file parses into an array of `ProvisionBlock`:

```ts
interface ProvisionBlock {
  id: string;                    // 'p1', 'p1-a', 'p1-a-i'; '' for top-level
  level: number;                 // 0 (body) | 1 (Abs.) | 2 (lit.) | 3 (point)
  heading?: string;              // 'Abs. 1', 'lit. a' — language-neutral label
  content_en: string;            // rendered HTML
  content_zh: string;
}
```

`BilingualBlocks` renders each as `<section id={block.id}>`. Heading element
`<h2>` (level 1) / `<h3>` (level 2) / `<h4>` (level 3) sits **above** the
2-column grid (heading is full-width, EN/ZH below).

**Constraints to preserve:**

1. **`section[id]` is the deep-link target** — `:target` selector lights it
   up. Currently a yellow background + outline that fades in 2.4s. If you
   change the highlight, keep `:target` working.
2. **`scroll-mt-24`** on each block — accounts for the sticky header so the
   anchored block isn't hidden behind it after scroll.
3. **Permalink `§`** appears in heading, fades in on `:hover` and `:focus-within`
   on the parent `<section>`. Lower priority — feel free to redesign, just
   keep some affordance for "click to copy URL to this provision".
4. **Heading text is verbatim from MD** — `Abs. 1`, `lit. a`. Don't translate
   in CSS. They're decorative German legal abbreviations and the actual text
   is in the EN/ZH blocks below.

Footnote anchor IDs are namespaced per-block-per-language (e.g.
`footnote-en-p1-1`) so multiple blocks with footnotes can coexist in the
bilingual DOM. Don't unify these.

---

## 9. What's working well (don't regress)

- Reading rhythm in side-by-side mode — eyes find matching paragraphs
  immediately because each `## Abs. N` block starts a fresh aligned row.
- Language switch is instant, no FOUC (inline script in `<head>` reads
  localStorage before paint).
- Mobile shows EN above ZH (column → row reflow), TOC collapses inside
  `<details>`. Tested on 380px viewport mentally; not yet tested with a
  designer.
- The cream/navy palette doesn't compete with content. Content is the star.
- gdpr-info.eu inspiration is felt but the site looks 10 years newer.

---

## 10. Open design questions (suggested iteration targets)

Listed in priority order — high-value first.

### Q1. Mobile information density on article pages

`ProvisionLayout` on `<md` shrinks the TOC sidebar into a `<details>` block
above the article. That works but the TOC can become long (99 articles in 11
chapters) and consumes a lot of attention before the actual article appears.

**Question**: should mobile use a different pattern — sticky bottom bar
"Jump to chapter ▾", or a slide-out drawer triggered from the header? What's
the cleanest mobile reading flow for legal text?

### Q2. Block heading visual weight

Currently `## Abs. 1 {#p1}` and `### lit. a {#p1-a}` render as small uppercase
mono eyebrows in brand color (~11px, 0.12em letter-spacing). This is
restrained but can feel under-articulated when scrolling through a long
article — the eye doesn't latch onto section breaks.

**Question**: should paragraph headings be visually heavier (larger, bolder,
or with a horizontal rule above)? The risk: too much chrome competes with
content. The opportunity: scanning for "Art. 6(1)(b)" in a 2000-word article
becomes much faster.

### Q3. Side-by-side column rhythm in EN/ZH bilingual mode

EN paragraph length ≠ ZH paragraph length (Chinese is ~30–40% shorter for the
same legal sentence). Right now the columns can feel uneven, with EN
overflowing 2 lines while ZH is 1.

**Question**: is there a typographic adjustment (different line-height,
different size, paragraph-end spacer) that makes left/right feel like
they're "moving together" even when length differs? Or should the layout
stay strictly grid-based?

### Q4. Permalink `§` discoverability

The `§` only fades in on hover. Touch users (mobile) never see it; they have
no obvious way to copy a deep link. Currently the URL bar update + manual
copy is the only path.

**Question**: should there be a permanent (subtle) chain icon next to each
block heading, or a "share this provision" button somewhere obvious on
mobile? GitHub's heading-permalink pattern, but adapted for legal text?

### Q5. First-paint feel on the home page

The hero block ("A clean, bilingual reference for EU digital regulations.")
is functional but generic. The page below — a single LawCard for GDPR —
feels sparse with only one card.

**Question**: should the home page lean more "publication" (showing recent
recitals or curated provisions on the front) or "directory" (current
approach, scaling up when more laws arrive)? What does the home page do best
when there are 1, 3, or 7 regulations in the catalog?

### Q6. Chapter heading in the article-page directory listing

On `/laws/gdpr/`, the right column shows articles grouped by chapter:

```
CH. I  General provisions / 总则
  Art. 1   主题与目标
  Art. 2   实质性适用范围
  ...
```

The chapter label is currently a small uppercase mono header with brand-color
roman numeral. With 11 chapters, scrolling through the full GDPR list, the
chapter dividers could be more anchored — e.g., sticky chapter sub-headers
(like iOS contacts list "A B C..."), or collapsible chapter groups.

**Question**: with full 99-article GDPR loaded, what's the best
"navigability" for the directory? Sticky sub-headers? Collapsible? Mini-map
on the side?

### Q7. Footnote presentation

Footnotes render as a `<section class="footnotes">` at the bottom of the
column they belong to (EN footnotes under EN, ZH footnotes under ZH), with a
small "NOTES / 脚注" auto-label. Visually they're small gray text with
back-reference arrows.

**Question**: this works for short articles. For long articles with 10+
footnotes, should footnotes appear in a side margin (like Tufte CSS), in a
hover popover, or stay as bottom-of-column? Mobile behavior?

### Q8. Typography hierarchy expansion

Current heading hierarchy is shallow:

- h1 (article title) — 2xl bold serif
- h2 (Abs.) — small uppercase eyebrow, mono, brand color
- h3 (lit.) — same as h2 but smaller and indented
- body — sans, 17px, 1.75 line-height

There's a gap: nothing visually strong between "h1 article title" and "small
chrome heading". For a long article, the eye needs more checkpoints.

**Question**: should there be an intermediate level (e.g., real serif h2 for
Abs., reserve uppercase mono only for lit./point)? Or is the restraint a
feature?

---

## 11. Constraints & non-goals (don't change these without asking)

- **Pure static output.** No SSR, no hydration, no client-side framework.
  Adding React/Vue/Solid for "dynamic UI" is a regression. If a feature
  needs JS, write a tiny `<script>` (see `LangSwitcher`).
- **Self-hosted fonts.** No Google Fonts CDN, no external font requests. The
  user explicitly chose this for privacy and reliability.
- **Zero tracking, zero analytics by default.** Don't add scripts.
- **Multi-law content model.** Don't hard-code GDPR-specific behavior in
  components or routes. The same components should render Data Act / AI Act
  later by adding folders under `src/content/laws/<slug>/`.
- **Flat frontmatter on .md files** (`title_en`, not `title.en`). The loader
  also accepts skill-format frontmatter (`article: 6`, nested `title.en/zh`,
  `gdpr-art5` IDs) and normalizes — don't break that compatibility layer in
  `lib/laws.ts`.
- **Deep-link IDs are public API.** Once published, `#p1-a` for Art. 6
  must keep referring to (1)(a) forever. External citations depend on it.

---

## 12. Stuff already considered and decided

So you don't waste time re-litigating:

- Three-mode language switch (中 / EN / 中英) over per-language URL routes:
  picked because both languages always in HTML helps SEO + LLM citation,
  switching is instant, sitemap is simpler.
- Block-anchored deep links (`/articles/6/#p1-a`) over per-paragraph URL
  routes: picked because section is one URL for SEO ranking + readers expect
  the whole article visible when they land on a citation.
- Article number `Art. N` (English) wins in bilingual mode; everything else
  chrome shows ZH: user's explicit aesthetic preference.
- Chapter information lives in `chapters.json` (one source per law), NOT in
  every article's frontmatter (skill format does the latter; we don't).
- Tailwind v4 over v3: CSS-first config is much cleaner.
- Astro over Next.js / SvelteKit: pure static SSG with zero JS by default.

---

## 13. How to use this brief in your design conversation

1. **Open a new Claude conversation** (claude.ai or wherever you're driving
   the design work).
2. **Attach the project folder** (or the relevant subset — at minimum
   `src/styles/global.css`, `src/components/`, `src/layouts/`, and a couple
   of representative pages so the model can see real markup).
3. **Paste this `DESIGN_BRIEF.md` as your first message**, then ask the
   specific design question. Examples:
   - "Pick three of the open questions in §10 and propose concrete redesigns.
     Show me CSS diffs and explain the trade-offs."
   - "Design a mobile-first reading flow for `/laws/gdpr/articles/6/`.
     Mock up the TOC drawer interaction."
   - "Critique the current visual hierarchy. What's under-articulated?
     What's over-decorated?"
4. **Iterate**. The design Claude will probably want screenshots of the live
   site at multiple viewport widths. Capture: home page, law landing,
   article page (all three language modes), 380px mobile of the article
   page, an article page with `:target` highlight active.

---

## 14. Quick reference — file paths the next designer will touch most

| Task | File |
|---|---|
| Color / font / spacing tokens | `src/styles/global.css` (`@theme` block) |
| Block heading + permalink + `:target` | `src/styles/global.css` (`.provision-block*` rules) |
| Side-by-side EN/ZH layout | `src/components/BilingualBlocks.astro` |
| Article page chrome | `src/layouts/ProvisionLayout.astro` |
| Sticky header | `src/components/Header.astro` |
| TOC sidebar | `src/components/TocSidebar.astro` |
| Home page hero + cards | `src/pages/index.astro` |
| Law landing directory | `src/pages/laws/[law]/index.astro` |
| Footnote styling | `src/styles/global.css` (`.legal .footnotes*`) |
| Bilingual class rules | `src/styles/global.css` ("Language visibility" comment) |

Good luck. The bones are good. Make it sing.
