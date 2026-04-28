# Digital Rulebook

Bilingual (English / 中文) reference for EU digital regulations. Currently
covers **GDPR**; the content model is designed to host additional regulations
(Data Act, AI Act, DSA, DMA, ...) under the same shape — drop a new folder
into `src/content/laws/` and they appear automatically.

Built with [Astro](https://astro.build) + [Tailwind CSS v4](https://tailwindcss.com),
self-hosted fonts, pure static output.

## Quick start

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output → ./dist
npm run preview
```

## Content model

Each law is a folder under `src/content/laws/<slug>/`:

```
src/content/laws/gdpr/
├── meta.json              ← law-level metadata (title, CELEX, dates, color)
├── chapters.json          ← chapter ranges (single source of truth per law)
├── recitals/
│   ├── 1.md
│   ├── 2.md
│   └── ...
└── articles/
    ├── 1.md
    ├── 2.md
    └── ...
```

### Per-provision Markdown format

Each `.md` file holds one recital or one article. Articles use **heading-anchored
bilingual blocks** so every paragraph and letter point is independently
deep-linkable; recitals are usually single paragraphs and skip the headings.

#### Article example — paragraphs and letters

````markdown
---
number: 6
title_en: "Lawfulness of processing"
title_zh: "处理的合法性"
source_version: "2018-05-25"
last_reviewed: "2026-04-28"
related: [5, 7, 9]
related_recitals: [40, 41, 42, 43]
---

## Abs. 1 {#p1}

:::en
Processing shall be lawful only if and to the extent that at least one of the following applies:
:::

:::zh
只有在符合以下至少一项条件且在相应范围内，处理才是合法的：
:::

### lit. a {#p1-a}

:::en
the data subject has given consent to the processing of his or her personal data for one or more specific purposes;
:::

:::zh
数据主体就一项或多项特定目的同意处理其个人数据；
:::

### lit. b {#p1-b}

:::en
processing is necessary for the performance of a contract...
:::

:::zh
为履行数据主体作为一方当事人的合同所必需……
:::
````

This renders as a deep-linkable URL structure:

- `/laws/gdpr/articles/6/` — full article
- `/laws/gdpr/articles/6/#p1` — Art. 6(1)
- `/laws/gdpr/articles/6/#p1-a` — Art. 6(1)(a) — opens **and highlights** that block

#### Recital example — top-level body, no heading

````markdown
---
number: 1
---

:::en
The protection of natural persons in relation to the processing of personal data is a fundamental right.
:::

:::zh
在个人数据处理方面保护自然人是一项基本权利。
:::
````

#### Heading conventions

| GDPR structural unit | Heading | Level | ID pattern | Example |
|---|---|---|---|---|
| Paragraph (Absatz) | `## Abs. {n}` | h2 | `{#p{n}}` | `## Abs. 1 {#p1}` |
| Letter point (litera) | `### lit. {x}` | h3 | `{#p{n}-{x}}` | `### lit. a {#p1-a}` |
| Numbered point | `### point ({i})` | h3 | `{#p{n}-{i}}` | `### point (1) {#p1-1}` |
| Sub-point (rare) | `#### point ({i})` | h4 | `{#p{n}-{x}-{i}}` | `#### point (i) {#p1-a-i}` |

`Abs.` (Absatz) and `lit.` (litera) are German legal abbreviations used as
language-neutral display labels — the actual translated text lives inside the
`:::en` / `:::zh` blocks.

#### Bilingual block rules

- Every block (paragraph, letter, sub-point, or top-level body) contains
  **exactly one `:::en` block followed by exactly one `:::zh` block**, in that
  order.
- IDs are strict lowercase, hyphenated. No `P1`, no `p1A`.
- IDs must be unique within a file.
- Once published, **never change an ID** — external citations depend on them.

#### Frontmatter fields

**Required:**

| Field | Used for |
|---|---|
| `number` | Provision number; falls back to filename if omitted (`12.md` → 12) |
| `title_en`, `title_zh` | Articles only — the article title (recitals omit titles) |

**Optional (skill-style metadata, articles only):**

| Field | Example | Used for |
|---|---|---|
| `source_version` | `"2018-05-25"` | Which consolidated version this text reflects |
| `last_reviewed` | `"2026-04-28"` | When the file was last touched. ISO date. |
| `related` | `[5, 7, 9]` | Related article numbers within the same law |
| `related_recitals` | `[40, 41, 42]` | Recital numbers explaining this article |
| `translation_notes` | `"非官方翻译……"` | Free-form note about translation status |

These metadata fields surface in the article footer as a small `<dl>` block.

#### Skill-format frontmatter is also accepted

If you author with the `gdpr-bilingual-formatter` skill, its native frontmatter
(nested `title.en` / `title.zh`, `article: N`, `recitals: [40, 41]`, related
IDs like `gdpr-art5`) is **normalized on load**. You can drop a skill-produced
file straight into `src/content/laws/gdpr/articles/` — rename `art-6.md` to
`6.md` and that's it. Fields the skill emits but DR derives elsewhere
(`law:`, `chapter:`, `chapter_title:`, `section:`) are silently ignored.

So both of these load identically:

```yaml
# DR-native
number: 6
title_en: "Lawfulness of processing"
title_zh: "处理的合法性"
related: [5, 7, 9]
related_recitals: [40, 41, 42]
```

```yaml
# skill output
article: 6
title:
  en: "Lawfulness of processing"
  zh: "处理的合法性"
law: gdpr               # ignored
chapter: 2              # ignored
chapter_title:          # ignored
  en: "Principles"
  zh: "原则"
related: [gdpr-art5, gdpr-art7, gdpr-art9]   # → [5, 7, 9]
recitals: [40, 41, 42]                        # → related_recitals: [40, 41, 42]
```

### Footnotes

Inside any `:::en` / `:::zh` block use Pandoc-style footnote syntax — `[^id]`
inline, `[^id]: text` for the definition. Each language has its own footnote
namespace, and the loader rewrites footnote IDs per-block-per-language so they
coexist in bilingual mode without collisions.

````markdown
:::en
This Regulation lays down rules relating to the protection of natural persons[^np] ...

[^np]: "Natural person" excludes legal persons. See Recital 14.
:::

:::zh
本条例制定有关在个人数据处理方面保护自然人[^自然人]……

[^自然人]: "自然人"不包括法人。参见序言第 14 段。
:::
````

The renderer emits superscript references inline and a footnote section at the
bottom of the column with back-reference arrows.

### `meta.json`

```json
{
  "id": "gdpr",
  "slug": "gdpr",
  "short_title": "GDPR",
  "title_en": "General Data Protection Regulation",
  "title_zh": "通用数据保护条例",
  "celex": "32016R0679",
  "official_url": "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
  "in_force_date": "2018-05-25",
  "description_en": "...",
  "description_zh": "...",
  "color": "#0b3d91"
}
```

### `chapters.json`

```json
[
  {
    "number": 1,
    "roman": "I",
    "title_en": "General provisions",
    "title_zh": "总则",
    "from": 1,
    "to": 4
  }
]
```

`from`/`to` are inclusive article-number ranges. Chapter info is **declared
once per law** — no need to repeat it in every article's frontmatter.

## Adding a new law

1. Create `src/content/laws/<slug>/meta.json` and (optional) `chapters.json`.
2. Drop `.md` files into `recitals/` and `articles/` following the format
   above.
3. The home page, law index, recital/article lists, and per-provision pages
   regenerate automatically on next `npm run dev` / `npm run build`.

## Language switcher

Three modes — **中文 / English / 中英对照** — toggle a class on `<html>`
(`lang-zh`, `lang-en`, `lang-both`). Both languages always exist in the HTML,
which keeps SEO clean and the switch instant. Preference is stored in
`localStorage` under `dr-lang`.

By convention, in **bilingual mode**:
- *Content* (article titles, descriptions, body text) shows both languages
  side-by-side.
- *Chrome* (UI labels, navigation, breadcrumbs, button text) shows **Chinese
  only** — `.lang-en-strict` hides the EN label.
- *Article number labels* (`Art. N`) show **English form only** —
  `.lang-zh-strict` hides the ZH label.

See `src/styles/global.css` (Language visibility section) for the rules.

## Sitemap & robots

- `@astrojs/sitemap` emits `sitemap-index.xml` + `sitemap-0.xml` at build.
- `public/robots.txt` references it.
- Set the production origin in `astro.config.mjs` (`site: ...`) before deploying.

## Fonts

Self-hosted via `@fontsource` packages — zero external requests, woff2 with
unicode-range subsetting so CJK glyphs lazy-load only what's actually rendered.

- **Body / UI**: Inter + Noto Sans SC (weights 400, 500, 700)
- **Headings**: Noto Serif + Noto Serif SC (weights 400, 600, 700)

## Project layout

- `src/content/laws/` — content (single source of truth: meta.json + chapters.json + .md files)
- `src/lib/laws.ts` — block-aware loader: parses frontmatter (gray-matter),
  extracts `## Abs. N {#pN}` / `### lit. x {#pN-x}` blocks, renders each
  `:::en` / `:::zh` pair through `marked` + `marked-footnote`, and namespaces
  footnote anchors per block per language.
- `src/components/BilingualBlocks.astro` — iterates blocks; each becomes a
  `<section id="...">` with heading above and EN/ZH side-by-side below.
- `src/pages/laws/[law]/...` — dynamic routes, statically pre-rendered
