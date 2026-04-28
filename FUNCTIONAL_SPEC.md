# Digital Rulebook — 功能说明书

**版本：** Phase 4 完成 + 上线前 bug 修复（2026-04-28）
**目标读者：** 接手二次开发的前端 / 全栈工程师
**配套文档：** [`README.md`](./README.md)（快速开始 + 内容模型语法）· [`DESIGN_BRIEF.md`](./DESIGN_BRIEF.md)（设计语言 + 开放问题）· [`GAP_AUDIT.md`](./GAP_AUDIT.md)（4 期实施日志 + 19 条决策日志）

本文档描述**当前生产代码的功能与约束**，是新工程师接手时第一份要读的东西。它不重复其他三份文档的内容，而是给一个总览 + 把所有"约定"集中说清楚。

---

## 目录

1. [项目定位](#1-项目定位)
2. [技术栈](#2-技术栈)
3. [架构与数据流](#3-架构与数据流)
4. [内容模型](#4-内容模型)
5. [URL 路由与深链契约](#5-url-路由与深链契约)
6. [双语可见性系统](#6-双语可见性系统)
7. [设计系统](#7-设计系统)
8. [组件清单](#8-组件清单)
9. [关键交互](#9-关键交互)
10. [脚注管线](#10-脚注管线)
11. [构建与部署](#11-构建与部署)
12. [已知限制与非目标](#12-已知限制与非目标)
13. [建议路线图](#13-建议路线图)
14. [文件地图](#14-文件地图)
15. [决策与历史](#15-决策与历史)

---

## 1. 项目定位

**一句话定义。** 欧盟数字监管法规的中英对照参考站点，可深链到任何条款的任意子段落。

**当前覆盖范围。** GDPR（Regulation EU 2016/679）—— 4 / 99 条文，3 / 173 序言。Article 6（处理的合法性）作为脚注 + 多 Abs. + 续段（UAbs.）的完整样本。

**目标用户三类：**

| 用户 | 阅读模式 | 关键诉求 |
|---|---|---|
| 律师 / 合规专员 | 单点查询，从搜索引擎 / LLM 引文落地，看一个条款就走 | 引文级别精准（`#p1-a` 直达 Art. 6(1)(a)）+ 翻译可信 |
| 学生 / 研究者 | 长读 + 跨条款交叉引用 + 切语言 | 三语切换 + related 链接 + 脚注交叉 |
| 中文从业者处理欧盟法 | 中英对照 | 双语并排（不是切换），EN-only 站不便、ZH-only 站缺权威 |

**核心价值主张三点。** 全部已在生产实现：

1. **段落级中英并排**——每个 Abs. 是独立的"对齐行"，肉眼不需要在两整篇之间往返
2. **字母级深链**——`/laws/gdpr/articles/6/#p1-a` 直接落到 Art. 6(1)(a) 并触发黄色 `:target` 闪烁。这是与 gdpr-info.eu 的核心差异
3. **三模式语言切换**（中 / EN / 中英），`localStorage` 持久化、客户端瞬时切换、不改 URL（两种语言都在 HTML 里 → SEO + LLM 引用友好）

**不是什么。** 详见 §12 "非目标"。简言之：不是 SaaS、不是 CMS、不是带搜索的法律数据库——是一个**精装的双语阅读站**。

---

## 2. 技术栈

```
Astro 5.5+               静态 SSG，零客户端框架
Tailwind CSS v4          CSS-first 配置（@theme 块），无 tailwind.config.js
@fontsource/*            自托管字体，零外部 CDN 请求
gray-matter              .md 前置 metadata 解析
marked + marked-footnote Markdown 渲染 + 脚注扩展
@astrojs/sitemap         编译期生成 sitemap-index.xml + sitemap-0.xml
TypeScript 5.6 strict    全部 .astro / .ts 类型检查
```

**关键决策已固化（不要轻易反转）：**

- 静态 SSG，零客户端框架（**不能加 React/Vue/Solid**——加了就是回归）
- 自托管字体（**不接 Google Fonts CDN**——隐私 + 可靠性双重选择）
- 零跟踪 / 零分析（默认无 Plausible / GA / Cloudflare Analytics 等）
- 多法规 ready：所有渲染逻辑参数化，加 Data Act / AI Act 不需要改代码
- 双语 fence 用 `:::en` / `:::zh`（不是 frontmatter 的 nested keys）

依赖 `package.json` 当前 11 个生产依赖，1 个开发依赖（typescript）。极简。

---

## 3. 架构与数据流

```
src/content/laws/gdpr/                    ← 源数据
├── meta.json                              法规元信息（标题、CELEX、生效日期、color）
├── chapters.json                          章节范围（CH. I-XI，单一来源）
├── recitals/                              序言 .md（每条一文件）
│   └── N.md
└── articles/                              条文 .md（每条一文件）
    └── N.md

src/lib/laws.ts                            ← 加载器 + 块解析器
   - import.meta.glob 自动发现所有 laws/*/meta.json + chapters.json + */*.md
   - 不依赖 Astro 的 getCollection() API（content.config.ts 只为消 deprecation）
   - 解析每个 .md 成 ProvisionBlock[]
   - 把 marked-footnote 的 footnote-ref/footnote- ID 改写成 fnref-/fn- + lang + blockId 命名空间
   - 在 article 级别合并 EN/ZH 脚注半 → MergedEndnote[] + seqMap

src/lib/endnotes.ts                        ← 脚注管线（独立模块）
   - splitFootnotesFromHtml: 抽出 inline <section class="footnotes">
   - extractEndnoteItems: 从该 section 提 <li id="fn-...">
   - buildEndnoteSeqMap: 按 (blockId, occurrenceIndex) 配对 EN/ZH 半 + 重编全文序号
   - rewriteSupLabels: 用全文 seqNum 替换 marked-footnote 的 per-block 1/2/3

src/pages/[...]/[...]/index.astro          ← getStaticPaths → 静态预渲染
   - 全部页面在 build time 生成 → /dist/**/index.html
   - 没有 SSR、没有 hydration、没有 client-side 路由

src/components/*.astro                     ← 渲染层
src/layouts/*.astro                        ← 页面骨架
src/styles/global.css                      ← 全局样式 + tokens

dist/                                      ← build 产物
├── _astro/                                hash 命名的 CSS / fonts / chunks
├── laws/gdpr/articles/N/index.html
├── laws/gdpr/recitals/N/index.html
├── sitemap-index.xml + sitemap-0.xml
└── ...
```

**渲染管线一遍走完：**

1. `npm run build` 触发 Astro
2. `import.meta.glob` 在 `src/lib/laws.ts` 内同步收集所有 `meta.json` / `chapters.json` / `recitals/*.md` / `articles/*.md`
3. 每个 .md 经 `parseBlocks()` → `mdToHtml()` → `suffixFootnoteIds()` → `splitFootnotesFromHtml()` → 拼成 `ProvisionBlock[]`
4. 文章级合并 EN/ZH 脚注半 → 计算 `seqMap` → 改写每个块的 `<sup>` 标签
5. 每个 `getStaticPaths` 函数把 laws/articles/recitals 转成路由
6. Astro 渲染每个路由对应的 `.astro` 文件 → 静态 HTML
7. Vite + Tailwind v4 打包 CSS（`@theme` block + 工具类 + 自定义 .dr-* 类）
8. `@astrojs/sitemap` 收集所有路由 → 输出 sitemap

**没有运行时 DB / API / serverless。** 修改任何内容（包括翻译）都要重新 build。这是设计选择——零运维负担，所有内容受 git 版本控制。

---

## 4. 内容模型

### 4.1 ProvisionBlock —— 数据模型核心

```typescript
interface ProvisionBlock {
  id: string;          // 'p1', 'p1-a', 'p1-a-i', 'p1-2'; '' 为 level-0 顶部
  level: number;       // 0 = body, 1 = Abs., 2 = lit., 3 = point
  heading?: string;    // 'Abs. 1', 'lit. a' —— 语言中性显示标签
  content_en: string;  // marked 渲染后的 HTML
  content_zh: string;
}
```

每个块对应一个 `<section id="...">`，是 `:target` 深链落点。

### 4.2 标题约定（HEADING_RE 正则）

`src/lib/laws.ts` 的 `HEADING_RE = /^(#{2,4})\s+(.+?)\s+\{#([\w-]+)\}\s*$/`

| 结构单位 | Markdown | level | id pattern | 例 |
|---|---|---|---|---|
| Paragraph (Absatz) | `## Abs. 1 {#p1}` | 1 | `pN` | `p1` |
| Letter point (litera) | `### lit. a {#p1-a}` | 2 | `pN-x` | `p1-a` |
| Numbered point (rare) | `### point (1) {#p1-1}` | 2 | `pN-i` | `p1-1` |
| Sub-point (very rare) | `#### point (i) {#p1-a-i}` | 3 | `pN-x-i` | `p1-a-i` |
| 续段（Phase 4 引入）| `## Abs. 1 — 2. UAbs. {#p1-2}` | 1 | `pN-k` | `p1-2` |

**续段约定**用于 paragraph 后 lit 列表后的第二 Unterabsatz，例如 GDPR Art. 6(1) 的"Point (f) shall not apply..."、Art. 6(3) 的"The purpose of the processing shall be..."。schema 不需要扩——`HEADING_RE` 已经允许任意标题文本。

`Abs.` / `lit.` / `UAbs.` 是德国法律惯用缩写（Absatz / litera / Unterabsatz），**作为语言中性标签**使用，所有语言模式下都显示这个原文。实际翻译在 `:::en` / `:::zh` 内。

### 4.3 双语 fence

每个 block 内必须严格出现 **一个 `:::en` 后跟一个 `:::zh`**，顺序固定。

```markdown
## Abs. 1 {#p1}

:::en
Processing shall be lawful only if and to the extent that...
:::

:::zh
只有在符合以下至少一项条件且在相应范围内……
:::
```

顶层（level 0，无标题）的 block 也是同样的 fence 规则——recital 通常是单 block 顶层。

### 4.4 脚注

`marked-footnote` 扩展，标准 Pandoc 风格：

```markdown
:::en
Processing requires consent[^consent].

[^consent]: "Consent" is defined in Article 4(11)...
:::

:::zh
处理需要同意[^同意]。

[^同意]: "同意"在第 4 条第（11）项被定义为……
:::
```

EN 和 ZH 各有独立命名空间。详见 §10。

### 4.5 frontmatter 字段

**必需：**

| 字段 | 用途 |
|---|---|
| `number` | 条款号；省略时 fallback 到文件名 |
| `title_en`, `title_zh` | 仅条文。序言无标题 |

**可选（仅条文）：**

| 字段 | 例 | 用途 |
|---|---|---|
| `source_version` | `"2018-05-25"` | 源版本（哪一个 consolidated text） |
| `last_reviewed` | `"2026-04-28"` | 最后校阅日期（ISO） |
| `related` | `[5, 7, 9]` | 同法规内相关条款号 |
| `related_recitals` | `[40, 41, 42]` | 解释这条的序言号 |
| `translation_notes` | `"非官方翻译……"` | 翻译说明（自由文本） |

`src/lib/laws.ts` 的 `normalizeArticleFrontmatter()` 兼容两种格式：DR 原生 flat keys 和 `gdpr-bilingual-formatter` skill 的 nested keys。新接手时不需要改这层兼容性，但**也不能删**——已经有第三方工具产物以 skill 格式 drop in 进 articles/ 目录的预期。

### 4.6 LawMeta（meta.json）

```typescript
interface LawMeta {
  id: string;              // 'gdpr'
  slug: string;            // 'gdpr' （用于 URL）
  short_title: string;     // 'GDPR'
  title_en: string;        // 'General Data Protection Regulation'
  title_zh: string;        // '通用数据保护条例'
  celex: string;           // '32016R0679'
  official_url: string;    // EUR-Lex 链接
  in_force_date: string;   // ISO 'YYYY-MM-DD'
  description_en: string;
  description_zh: string;
  color: string;           // hex 强调色（card 标识点 + 未来主题色）
  total_articles?: number; // 99 → 触发 LawCard 显 "4 / 99 articles"
  total_recitals?: number; // 173
}
```

`total_*` 字段未填时，LawCard 回落到只显当前数量（不显分母 + 不显 In progress 徽章）。

---

## 5. URL 路由与深链契约

### 5.1 路由表

| 路由 | 文件 | 内容 |
|---|---|---|
| `/` | `src/pages/index.astro` | Hero + LawCard 网格 + 三特性卡 |
| `/about/` | `src/pages/about.astro` | About 页 |
| `/404` | `src/pages/404.astro` | 找不到页面 |
| `/laws/[law]/` | `src/pages/laws/[law]/index.astro` | 法规 landing：CELEX + H1 + 描述 + 双列 directory（recitals 列 + articles 按章分组列）|
| `/laws/[law]/articles/` | `src/pages/laws/[law]/articles/index.astro` | 条文索引（按章分组）|
| `/laws/[law]/articles/[id]/` | `src/pages/laws/[law]/articles/[id].astro` | 条文详情（核心阅读页）|
| `/laws/[law]/recitals/` | `src/pages/laws/[law]/recitals/index.astro` | 序言索引（扁平列表 + preview）|
| `/laws/[law]/recitals/[id]/` | `src/pages/laws/[law]/recitals/[id].astro` | 序言详情 |
| `/sitemap-index.xml` | （Astro 自动）| 索引 |
| `/sitemap-0.xml` | （Astro 自动）| 当前 12 条 URL |
| `/robots.txt` | `public/robots.txt` | sitemap 引用 |

`trailingSlash: 'always'`（astro.config.mjs）—— 所有路由以 `/` 结尾，禁止有时带有时不带的不一致。

### 5.2 深链 ID 契约（**不可变公共 API**）

URL fragment 是**公共承诺**：

- `/laws/gdpr/articles/6/#p1` → Art. 6(1)
- `/laws/gdpr/articles/6/#p1-a` → Art. 6(1)(a)
- `/laws/gdpr/articles/6/#p1-2` → Art. 6(1) 的第 2 个 Unterabsatz

**一旦发布，永远不能改 ID。** 外部引文（律师备忘录、博客、LLM 输出）都依赖这个稳定性。如果某天发现某 ID 起得不好，**也要保留**——可以新加一个 alias，不能动旧的。

### 5.3 sitemap

`@astrojs/sitemap` 在 build 时收集**所有静态路由**（404 除外），用 `astro.config.mjs` 的 `site:` 作为前缀。当前生产前缀：`https://digital-rulebook.eu/`。

`changefreq: monthly`、`priority: 0.7`，配置中写死。如果未来想给条文页更高优先级（区分 hero vs body），改 sitemap 集成的 `customPages` 或 `serialize` 钩子。

`public/robots.txt` 引用 `https://digital-rulebook.eu/sitemap-index.xml` —— 改域名时**两处都要动**：astro.config.mjs `site` + robots.txt 一行。

---

## 6. 双语可见性系统

### 6.1 三模式

`<html>` 始终带一个 class：`lang-en` / `lang-zh` / `lang-both`。`<body>` 一直保留所有内容（EN 段 + ZH 段 + chrome），只靠 CSS 隐藏不需要的部分。**两种语言永远在 DOM 里**，这对 SEO 和 LLM 引用至关重要。

切换由 `LangSwitcher.astro` 的 inline `<script>` 处理：`localStorage` key `dr-lang`，`BaseLayout.astro` 顶部还有一段 inline FOUC 预防脚本（在 paint 前应用上次的 `lang-*`）。

### 6.2 工具类矩阵

四个工具类驱动所有显隐：

| 类 | EN 模式 | ZH 模式 | 中英模式 | 用于 |
|---|:-:|:-:|:-:|---|
| `.lang-en-only` | 显 | 隐 | **显** | 内容 EN 半（与 `.lang-zh-only` 配对，中英模式两半都显）|
| `.lang-zh-only` | 隐 | 显 | **显** | 内容 ZH 半 |
| `.lang-en-strict` | 显 | 隐 | **隐** | Chrome（导航、面包屑、按钮、TOC、行号、章节标签）|
| `.lang-zh-strict` | 隐 | 显 | **隐** | （配对，几乎不用——见决策 #3 例外）|

实现见 `src/styles/global.css` `Language visibility` 段：

```css
html.lang-en .lang-zh-only,
html.lang-en .lang-zh-strict,
html.lang-zh .lang-en-only,
html.lang-zh .lang-en-strict,
html.lang-both .lang-en-strict,
html.lang-both .lang-zh-strict {
  display: none !important;
}
```

### 6.3 决策规约

经过 4 次 Phase + 多轮决策修正，最终规则简化为：

- **正文（双语并排的内容）** 用 `lang-en-only` + `lang-zh-only`（"-only" 对）→ 中英模式两半都显
- **chrome（所有 UI 标签 + TOC + 编号）** 用 `lang-en-strict` + `lang-zh-only` → 中英模式只显 ZH

**所有 chrome 都走 ZH-strict 规则**——`Art. N` 编号、TOC 章节标题、TOC 文章标题、Recital N 标签、面包屑、按钮文字、PrevNextNav、404 / About 标题、所有 page H1 都已统一。这是 GAP_AUDIT 决策 #3 + #16 的最终形态。

### 6.4 在哪里小心

新工程师改任何 `<span>` 时记得检查它是 chrome 还是 content：

- "这是按钮 / 编号 / 导航 / 面包屑 → chrome → strict + only"
- "这是法律条款正文 / 段落标题 / 文章标题 / 段落内容 → content → only + only"

加新 .astro 时如果忘了写这两个 class 之一，那一段在中英模式会**两个语言并显或都不显**，这是 Phase 4 上线前刚发现的 bug（见决策 #17）—— 别重蹈覆辙。

---

## 7. 设计系统

### 7.1 颜色 tokens（global.css `@theme` block）

| Token | 值 | 用途 |
|---|---|---|
| `--color-ink` | `#0f172a` | 正文 |
| `--color-ink-soft` | `#475569` | 二级文本（描述、metadata）|
| `--color-ink-faint` | `#94a3b8` | 三级文本（TOC 非当前编号、↩ 箭头）|
| `--color-rule` | `#e2e8f0` | 边框 |
| `--color-rule-soft` | `#eef2f6` | 脚注虚线 |
| `--color-paper` | `#ffffff` | 卡片底 |
| `--color-cream` | `#f8fafc` | 页面底 |
| `--color-brand` | `#0b3d91` | navy 强调色（唯一品牌色）|
| `--color-brand-soft` | `#eaf0fb` | hover / active 浅底 |
| `--color-brand-deep` | `#082e6e` | 按钮 hover |
| `--color-target` | `#fef3c7` | `:target` 黄底 |
| `--color-target-rule` | `#f59e0b` | `:target` 橙描边 |
| `--color-accent` | `#b91c1c` | 备用红色（当前未用，保留）|

### 7.2 字号 tokens

| Token | 值 | 用途 |
|---|---|---|
| `--t-eyebrow` | `11px` | mono 小标签（Art. N pill、CELEX、Abs. 1）|
| `--t-meta` | `13px` | metadata、面包屑、footer |
| `--t-block-h` | `15px` | 段落 / 字母点标题（备用，当前 .provision-block__heading 用 11px）|
| `--t-body` | `16px` | 正文 |
| `--t-h2` | `22px` | section / Article H2 |
| `--t-h1` | `42px` | 文章 H1 + hero H1（决策 #1）|

行高：`--line-body: 1.65`、`--line-tight: 1.35`。

### 7.3 字体栈

```css
--font-sans:  "Inter", "Noto Sans SC", "PingFang SC", ...
--font-serif: "Noto Serif", "Noto Serif SC", Georgia, ...
--font-mono:  ui-monospace, "SF Mono", "Cascadia Code", Menlo, ...
```

**Sans / Serif 自托管**（@fontsource），权重 400/500/700（sans）+ 400/600/700（serif）。**Mono 用系统栈**——决策 #9 推迟到内容写完后再决定是否值得自托管 JetBrains Mono（约 +150 KB）。

### 7.4 自定义类清单

`global.css` 定义的 `.dr-*` / `.provision-*` / `.bilingual-*` / `.article-h1-*` / `.lang-*` 类。

**chrome 类**：`.dr-wordmark*`、`.dr-nav-link*`、`.dr-toc__*`、`.dr-eyebrow*`、`.dr-feature-h3`、`.dr-hero-h1`、`.dr-page-h1`、`.dr-section-h2`、`.dr-body`、`.dr-meta`、`.dr-coverage-pill`

**正文类**：`.provision-block`、`.provision-block__heading`、`.provision-block__permalink`、`.provision-block--lit`、`.provision-block--sub`、`.provision-block--retarget`、`.bilingual-col`

**脚注类**：`.dr-endnotes`、`.dr-endnotes__head`、`.dr-endnotes__title`、`.dr-endnotes__count`、`.dr-endnotes__grid`、`.dr-en-row`、`.dr-en-num`、`.dr-en-ctx`、`.dr-en-text`、`.dr-fn-back`

**互动类**：`.dr-toast`、`.dr-eyebrow-num`（pill）、`.article-h1-en`、`.article-h1-zh`

**lang 类**：`.lang-en-only`、`.lang-zh-only`、`.lang-en-strict`、`.lang-zh-strict`

每一类都有注释说明用途和位置。改动时先读注释。

---

## 8. 组件清单

### 8.1 Layouts

| 组件 | Props | 责任 |
|---|---|---|
| `BaseLayout.astro` | `title, description?, path?` | HTML 壳层、`<head>` 元数据、字体引入、FOUC 预防内联脚本、Header + Footer wrap |
| `ProvisionLayout.astro` | `law, kind, number, titleEn, titleZh, blocks, metadata?, endnotes?, path` | 条文 / 序言详情页骨架：TOC sidebar + 面包屑 + eyebrow（pill + CELEX）+ chapter line + 双语 H1 + BilingualBlocks + EndnotesSection + metadata `<dl>` + PrevNextNav |

### 8.2 Components

| 组件 | Props | 责任 | 注意 |
|---|---|---|---|
| `Header.astro` | — | sticky 顶栏，22×22 navy mark + 双行 wordmark + mono nav + ghost items（Data Act / AI Act）+ LangSwitcher + 移动汉堡菜单 | 决策 #6：ghost items 灰色不可点，加 law 后自动从 ghost 移到主 nav |
| `Footer.astro` | — | 版权 + 免责声明 | dr-meta 字号 |
| `LangSwitcher.astro` | — | 三按钮切换 + localStorage `dr-lang` + 设置 `<html>` class | 内联 `<script>`，不依赖任何框架 |
| `LawCard.astro` | `law` | 首页法规卡片：色点 + CELEX + 覆盖率徽章 + 标题 + 描述 + 进度行（"4 / 99 条文"）| 当 `total_*` 设了且未达 100% 时显 `.dr-coverage-pill` "持续补充中" |
| `BilingualBlocks.astro` | `blocks` | 主体内容：每块 `<section id>` + 左外边距 SVG permalink button + 标题（mono eyebrow）+ 双列 EN/ZH grid + clipboard JS + retarget 重启动画 | 列上必须挂 `lang-en-only` / `lang-zh-only`（决策 #17 修复）|
| `EndnotesSection.astro` | `endnotes, blocks` | 端部脚注汇总：双列 EN/ZH grid + 全文统一 seqNum + 上下文 pill（[ABS. 1] 等）+ ↩ 跳回 | `splitBackRef()` 把 marked-footnote 的尾部 ↩ anchor 抽出到第三 grid column |
| `TocSidebar.astro` | `law, kind, current?` | 左侧导航：sticky + scrollable + bare list（无卡片）+ mono 章节标题 + 当前项 navy 左竖线 | 文章标题用 chrome 规则（决策 #16，中英模式只显 ZH）|
| `PrevNextNav.astro` | `prev?, next?` | 文章底部前后翻页卡 | 全 chrome 规则 |

### 8.3 lib（不是组件但属架构）

| 文件 | 责任 |
|---|---|
| `src/lib/types.ts` | 所有 TypeScript 接口（Law, LawMeta, ProvisionBlock, Article, Recital, Endnote, MergedEndnote, Chapter, ChapterGroup, NeighborLink, ProvisionKind）|
| `src/lib/laws.ts` | 加载器 + 块解析 + frontmatter 标准化 + neighbor lookup + 章节分组 |
| `src/lib/endnotes.ts` | 脚注管线（split / extract / merge / rewrite）|

### 8.4 内容文件

| 文件 / 目录 | 责任 |
|---|---|
| `src/content.config.ts` | 显式声明 `laws` collection（仅为消 Astro 5 deprecation；DR 走自己的 import.meta.glob）|
| `src/content/laws/<slug>/meta.json` | 法规元信息 |
| `src/content/laws/<slug>/chapters.json` | 章节范围 |
| `src/content/laws/<slug>/articles/N.md` | 条文 |
| `src/content/laws/<slug>/recitals/N.md` | 序言 |

---

## 9. 关键交互

### 9.1 三语切换

- 触发：点 LangSwitcher 三按钮之一
- 效果：`<html>` 加上 `lang-{en|zh|both}` 类 + `setAttribute('lang', ...)`，`localStorage.dr-lang` 持久化
- 性能：纯 CSS 显隐，零 reflow，~16 KB 字体子集预载
- FOUC 预防：BaseLayout `<head>` 顶部 inline `<script>` 在 paint 前应用上次的偏好

### 9.2 Permalink 复制

- 每个 `.provision-block` 标题左侧（绝对定位 `left: -28px`）有 22×22 SVG 链式按钮
- 点击：
  1. `event.preventDefault()`
  2. `navigator.clipboard.writeText(`${origin}${pathname}#${id}`)`（仅 secure context；失败则静默）
  3. `history.replaceState(null, '', '#' + id)` 更新 URL bar 不入栈
  4. 强制重启 `:target` 黄色闪烁（toggle `.provision-block--retarget` class，触发 reflow）
  5. clipboard 成功后底部 toast `Link copied · #pN` 显示 ~1.4s
- 移动端 `<768px`：按钮从 `position: absolute; left: -28px` 切到 `position: static`，inline 在标题上方

### 9.3 `:target` 闪烁

- 触发：URL hash 变更 / 落地带 hash 的页面 / permalink 点击后强制重启
- 时序（不可改，与 `:target` selector 共享）：
  - `1.6s` hold（黄底 `--color-target` + 橙描边 `--color-target-rule` 2px outline-offset 4px）
  - `0.8s` `targetFade` keyframes 渐隐
  - `forwards` 保持终态
- 适用对象：`.provision-block:target`、`.dr-en-row:target`、正文 `<sup> a:target`
- 还有 `.provision-block--retarget` 类——点击同一段 permalink 时 hash 不变 `:target` 不会重新触发，靠这个类强制重启

### 9.4 TOC 当前项高亮

- `TocSidebar` 通过 `current={number}` prop 拿到当前条文号
- 匹配 `dr-toc__row` 加 `dr-toc__row--active` modifier：navy 左 2px 竖线 + 浅蓝底 + brand 色编号

### 9.5 端部脚注汇总

- 文章底部（在 metadata `<dl>` 之前）渲染 `<EndnotesSection>` —— 仅当 article 有 endnotes
- 双列 grid（EN 左 / ZH 右），单语模式塌缩为单列 max 680px
- 每行结构：`[seqNum] [上下文 pill] [脚注正文] [↩ 跳回]`
- ↩ 链接靠 `splitBackRef()` 从 marked-footnote 默认输出里抽出（marked-footnote 把 `↩` 直接缝在脚注 HTML 末尾，需要在渲染时切出来）

---

## 10. 脚注管线

这是整个项目最复杂的一处，独立成节。

### 10.1 数据流

```
article .md
  ├─ Abs. 1 block
  │   ├─ :::en  body + [^consent] + [^consent]: definition
  │   └─ :::zh  body + [^同意]   + [^同意]: 定义
  │
  marked-footnote 渲染 →
  - body 里 [^consent] → <sup><a href="#footnote-consent">1</a></sup>
  - 块尾 inline <section class="footnotes"><ol><li id="footnote-consent">...</li></ol></section>

  suffixFootnoteIds(html, 'en', 'p1') →
  - href="#footnote-consent" → href="#fn-en-p1-consent"
  - id="footnote-consent" → id="fn-en-p1-consent"
  - id="footnote-ref-consent" → id="fnref-en-p1-consent"
  （ZH 半同样处理 → fn-zh-p1-同意 等）

  splitFootnotesFromHtml(html) →
  - body: 段落正文（无 inline footnote section）
  - section: 抽出的 <section class="footnotes">

  extractEndnoteItems(section, 'en', 'p1') →
  - Endnote[] = [{ rawId: 'fn-en-p1-consent', lang: 'en', blockId: 'p1', contentHtml: '...' }]

→ 回到 parseBlocks() 把所有块的 endnotes 追加到一个 endnotesOut 数组

→ 文章级处理 buildEndnoteSeqMap(endnotesOut) →
  - 按 (blockId, occurrence) 配对 EN/ZH 半（不是按 ID 字符串相等！）
  - 给每个 MergedEndnote 分配全文 seqNum 1, 2, 3...
  - 返回 { merged: MergedEndnote[], seqMap: { [rawId]: seqNum } }

→ rewriteSupLabels(blockHtml, seqMap) →
  - 把每个块 body 内的 <sup>1</sup> 换成 <sup>{seqNum}</sup>
  - （ID 不变，只换显示数字）

→ 渲染：
  - BilingualBlocks 渲染各块的 body（含 <sup> 引用）
  - EndnotesSection 渲染 merged 列表（双列）
```

### 10.2 配对策略 —— 按出现顺序，不按 ID 字符串

**为什么不按 ID：** marked-footnote 把非 ASCII label URL-encode（`[^自然人]` → `id="footnote-%E8%87%AA%E7%84%B6%E4%BA%BA"`）。EN 写 `[^np]` 中文写 `[^自然人]` 永远不会有相同后缀。

**怎么配对：** 在 `buildEndnoteSeqMap()` 里，按 blockId 分桶，每桶内按 lang 分组保留出现顺序，第 i 个 EN 半 ↔ 第 i 个 ZH 半。

**约束：** 作者**必须保持 EN 块和 ZH 块的脚注数量与顺序一致**。如果 EN 写 3 条 ZH 写 2 条，第 3 条 EN 落单（zh 半 undefined），EndnotesSection 会渲染一行只有 EN 内容。这是符合预期的退化。

### 10.3 命名 vs 数字脚注

`suffixFootnoteIds()` 正则用 `[^"]+` 同时支持：

- 数字脚注：`[^1]` → `id="fn-en-p1-1"`
- 命名脚注：`[^consent]` → `id="fn-en-p1-consent"`
- CJK 命名：`[^自然人]` → `id="fn-en-p1-%E8%87%AA%E7%84%B6%E4%BA%BA"`
- 混合：在同一块里数字 + 命名 + CJK 都能共存

### 10.4 升级 marked-footnote 时要小心

`src/lib/endnotes.ts` 的正则（`<section class="footnotes">` 抽取、`<li id="fn-...">` 提取、back-ref 切分）依赖 marked-footnote 当前输出格式。如果升级到新版 marked-footnote 改了输出 HTML 结构（如换 class 名、或换标签），这三个正则都要重新核对。

`marked-footnote@1.4.0` 是当前生产版本，已通过 Article 1（命名脚注）+ Article 6（命名 + 续段）实测。

---

## 11. 构建与部署

### 11.1 本地开发

```bash
cd ~/Downloads/digital\ rulebook
npm install
npm run dev          # http://localhost:4321，HMR 实时刷新
npm run build        # → dist/ 静态产物
npm run preview      # 本地起静态服务器跑 dist/
```

Astro 5 + Tailwind v4 + TypeScript strict。`tsconfig.json` 已配 path aliases（`@/`、`@components/`、`@layouts/`、`@lib/`、`@content/`）。

### 11.2 输出产物

`dist/` 目录：

```
dist/
├── _astro/                          hash 命名 chunks（CSS + 字体 woff2）
├── 404.html
├── about/index.html
├── favicon.svg
├── index.html
├── laws/gdpr/articles/{1,2,3,6}/index.html
├── laws/gdpr/articles/index.html
├── laws/gdpr/index.html
├── laws/gdpr/recitals/{1,2,3}/index.html
├── laws/gdpr/recitals/index.html
├── robots.txt
├── sitemap-0.xml
└── sitemap-index.xml
```

13 个 HTML 页面 + sitemap + 静态资源。整个 dist 目录约 2-3 MB（大部分是 woff2 字体）。

### 11.3 Cloudflare Pages 接入

详见 `README.md` / 我们的部署对话。要点：

- **Git 接入**（推荐）：GitHub 仓库 → Cloudflare Pages 接入 → push 自动 build
  - Build command: `npm run build`
  - Output directory: `dist`
  - Environment: 默认 Node 18+（Astro 5 要求）
- **直接上传**（次选）：本地 `npm run build` → web UI 拖 `dist/` → 每次更新都重传
- 自定义域名：`digital-rulebook.eu`，Cloudflare 自动签发免费 SSL

### 11.4 切域名只动两处

```js
// astro.config.mjs
site: 'https://digital-rulebook.eu',  // ← 改这里
```

```
# public/robots.txt
Sitemap: https://digital-rulebook.eu/sitemap-index.xml  ← 还有这里
```

`site:` 更新后所有 sitemap URL 和 `<link rel="canonical">` 自动跟上。

---

## 12. 已知限制与非目标

### 12.1 设计选择（不要修改）

- **零客户端框架** —— 不能加 React / Vue / Solid 等。需要 JS 时用 inline `<script>`（`LangSwitcher` / `BilingualBlocks` 的 permalink 都是这样）
- **零跟踪 / 零分析** —— 不接 GA / Plausible / Cloudflare Analytics 等
- **自托管字体** —— 不用 Google Fonts CDN
- **无暗色模式** —— 不在路线图里。法律阅读站的视觉密度选择
- **无 i18n 路由** —— 不要 `/en/...` `/zh/...`。两种语言在同一 HTML 里靠 CSS 显隐切换。这是 SEO + LLM 引用友好的核心选择
- **无 CMS / admin UI** —— 编辑内容 = 写 .md 文件

### 12.2 当前没做但可加（路线图候选，详 §13）

- **搜索** —— 没有站内搜索。99 条 GDPR + 173 条 recital 全部上线后用户会想要。建议方案：build 时生成 JSON index → 客户端 fuse.js 模糊匹配。**不要**接 Algolia / Typesense（违反零外部服务原则）
- **OG image** —— `<head>` 里有 `og:title` / `og:description` 但无 `og:image`。社交分享卡片只显文字。可以做一张 1200×630 默认图，或按条文动态生成
- **Print stylesheet** —— 没做 `@media print` 优化。打印 PDF 体验未测试
- **暗色模式** —— 见上，设计选择不做
- **OG image 动态生成** —— 用 `@vercel/og` 类思路，build 时按条文标题渲染，加 `og-image-{slug}-{n}.png`。Astro 有 `astro-og-canvas` 等社区组件
- **多 law 内容** —— 当前架构 ready 但只有 GDPR。Header 的 ghost items（Data Act、AI Act）说明意图。加 law 只需 `src/content/laws/<slug>/` 三个文件（meta + chapters + 至少一条 .md），全站自动出现新法
- **覆盖率页** —— 现在覆盖率徽章在 LawCard 上一行显示。可以做一个详细的 `/laws/gdpr/coverage/` 页：哪些条文已写、按章进度条、待写清单。对内部维护和外部读者都有用
- **Translation glossary 公示页** —— 把术语表（controller → 控制者 等）做成一个 `/glossary/` 页 + 词条间互链
- **API / JSON 导出** —— 把所有 ProvisionBlock 数据按法规 dump 成 `dist/api/laws/gdpr.json`，供 LLM 训练 / 第三方工具消费。低成本高价值
- **嵌入式 widget** —— `<iframe src="https://digital-rulebook.eu/laws/gdpr/articles/6/?embed=1#p1-a">` 让别的网站嵌一个条款卡片。会成为第一个外部依赖入口
- **Article 4 / 5 / 7 等大量条文** —— 现在只有 4 条，预计要写约 200 条 markdown 才能覆盖完整 GDPR + Data Act + AI Act
- **Recital 大批量** —— 序言 173 条全部要写，比条文还多
- **JetBrains Mono 自托管**（决策 #9 deferred） —— 当前用系统 mono stack。每台设备字形不一致是个小毛病
- **内容版本对比 / diff** —— 不在当前架构里。如果某条文有"GDPR 2018-05-25 版"和"将来某次修订版"，可以用 git tag 或 frontmatter `source_version` 做版本树。设计上预留了 `source_version` 字段

### 12.3 Bug-prone 区域（接手时优先看）

- **`src/lib/laws.ts` `suffixFootnoteIds()`** —— 正则改坏会让脚注 ID 命名空间打架
- **`src/lib/endnotes.ts` `buildEndnoteSeqMap()`** —— 配对算法依赖出现顺序，作者写错顺序会得到错配（虽然有退化处理）
- **`src/components/BilingualBlocks.astro` 列上的 `lang-en-only` / `lang-zh-only` 类** —— 决策 #17 是上线前最后发现的 bug，加新组件时容易再忘
- **`getStaticPaths` getter 的全局副作用** —— `loadAll()` 在模块顶层执行一次，全部 build 共享。如果有大量 .md 文件以后可能成为冷启动瓶颈
- **`@theme` block 的 token 与 .dr-* 类的引用** —— Tailwind v4 编译 token 时要求 `@theme` block 在 `@import "tailwindcss"` 之后。global.css 当前结构是对的，但改顺序时小心

---

## 13. 建议路线图

接手开发可以按下面三个阶段推进：

### 13.1 短期（1-2 周）

1. **写 GDPR Article 4**（定义条款，整套法规高频引用）
2. **建立翻译术语表**（`src/content/laws/gdpr/glossary.json` 或 markdown）
3. **写 GDPR Article 5 / 7 / 8 / 9 / 10**（基础原则 + 同意 + 特殊类别）
4. **写 GDPR Recital 1-50**（与已写条文配对的解释段）
5. **改进 LangSwitcher 第三按钮文字** "中 / EN" → "中英"（决策已商定，未实施）
6. **加默认 OG image** —— 1200×630 静态 PNG 即可，存 `public/og-default.png`，BaseLayout 加一行 `<meta property="og:image">`

### 13.2 中期（1-2 个月）

1. **完成 GDPR Chapter I-III**（约 25 条文 + 80 序言，是站点的基础阅读路径）
2. **加客户端搜索**（fuse.js + build-time JSON index）
3. **加覆盖率页 `/laws/gdpr/coverage/`**（图表 + 待写清单）
4. **加 Data Act 法规** —— 试一次多 law 渲染，验证架构。Header ghost item 自动激活
5. **加 print stylesheet** —— `@media print` 时隐藏 sidebar / nav / Footer，正文单列 + 大字号
6. **加术语表页 `/glossary/`** —— 词条 + 出现位置反链

### 13.3 长期（3-6 个月）

1. **完成 GDPR 全部 99 条文 + 173 序言**（覆盖率 100%，徽章自动消失）
2. **加 AI Act 法规** —— 113 条、定义复杂、内容量约等于 GDPR
3. **加 JSON API 导出** —— `dist/api/laws/gdpr.json`，供 LLM / 第三方工具消费
4. **加嵌入式 widget** —— `?embed=1` 模式，不带 chrome，可被外站 iframe
5. **JetBrains Mono 自托管** —— 待视觉一致性问题真正成为痛点时
6. **内容版本对比** —— 当 GDPR 有第二次修订时再做

### 13.4 不建议做的事

- **加暗色模式** —— 设计选择不做
- **接 CMS（Contentful / Sanity / 等）** —— 与 git-based 内容模型冲突，所有翻译走 git review 是有意为之
- **加 React / Vue / 任何客户端框架** —— 静态站性能 + SEO 是核心选择
- **加 Algolia / Typesense 等托管搜索** —— 违反零外部服务原则；用 fuse.js 客户端搜索
- **改深链 ID** —— 已发布的 `#p1-a` 永远不能动

---

## 14. 文件地图

```
digital-rulebook/
├── README.md                              快速开始 + 内容模型 + 添加新 law
├── DESIGN_BRIEF.md                        设计语言 + 开放问题
├── GAP_AUDIT.md                           4 期实施日志 + 19 条决策日志
├── FUNCTIONAL_SPEC.md                     ← 本文档
│
├── astro.config.mjs                       Astro 配置 + sitemap 集成 + tailwind plugin
├── package.json                           11 个生产依赖 + ts dev dep
├── package-lock.json                      锁所有平台 binding（Mac/Windows/Linux）
├── tsconfig.json                          TypeScript strict + path aliases
├── .gitignore                             dist / .astro / node_modules / .env / .DS_Store
│
├── public/
│   ├── favicon.svg                        navy "D" SVG 图标
│   └── robots.txt                         Sitemap reference
│
├── src/
│   ├── env.d.ts                           Astro env types
│   │
│   ├── content.config.ts                  laws collection 显式声明（仅消 deprecation）
│   │
│   ├── content/laws/gdpr/                 GDPR 内容 ground truth
│   │   ├── meta.json                      法规元信息 + total_articles/recitals
│   │   ├── chapters.json                  11 章范围
│   │   ├── articles/
│   │   │   ├── 1.md                       Subject-matter and objectives
│   │   │   ├── 2.md                       Material scope
│   │   │   ├── 3.md                       Territorial scope
│   │   │   └── 6.md                       Lawfulness of processing（含脚注 + 续段）
│   │   └── recitals/
│   │       ├── 1.md
│   │       ├── 2.md
│   │       └── 3.md
│   │
│   ├── lib/
│   │   ├── types.ts                       全部 TypeScript 接口
│   │   ├── laws.ts                        加载器 + 块解析 + frontmatter 标准化
│   │   └── endnotes.ts                    脚注管线（split / extract / merge / rewrite）
│   │
│   ├── styles/
│   │   └── global.css                     @theme tokens + base + lang-* + .dr-* + .provision-* + .article-h1-*
│   │
│   ├── layouts/
│   │   ├── BaseLayout.astro               HTML shell + FOUC + Header + Footer
│   │   └── ProvisionLayout.astro          条文/序言详情骨架
│   │
│   ├── components/
│   │   ├── Header.astro                   wordmark + nav + ghost items + LangSwitcher + 移动菜单
│   │   ├── Footer.astro                   版权 + 免责声明
│   │   ├── LangSwitcher.astro             三按钮 + localStorage
│   │   ├── LawCard.astro                  首页法规卡 + 覆盖率徽章
│   │   ├── BilingualBlocks.astro          主体内容 + permalink + 双列 EN/ZH grid + 复制 JS
│   │   ├── EndnotesSection.astro          端部脚注双列汇总
│   │   ├── TocSidebar.astro               左侧导航
│   │   └── PrevNextNav.astro              底部前后翻页
│   │
│   └── pages/
│       ├── index.astro                    /
│       ├── about.astro                    /about/
│       ├── 404.astro                      /404
│       └── laws/[law]/
│           ├── index.astro                /laws/gdpr/
│           ├── articles/
│           │   ├── index.astro            /laws/gdpr/articles/
│           │   └── [id].astro             /laws/gdpr/articles/N/
│           └── recitals/
│               ├── index.astro            /laws/gdpr/recitals/
│               └── [id].astro             /laws/gdpr/recitals/N/
│
└── dist/                                  build 产物（不入版本控制，.gitignore 已排除）
    └── ...
```

---

## 15. 决策与历史

所有重要决策都记录在 `GAP_AUDIT.md` 的"决策日志"段，共 19 条，时间从 2026-04-28 第一轮 Phase 1 开始到上线前 bug 修复。每条决策都有：议题 / 决策 / 实施含义。

**接手开发前请通读决策日志**，避免重复讨论已经定下来的事。重点决策：

| # | 议题 | 摘要 |
|---|---|---|
| 1 | 字号系数值 | H1 = 42px、body = 16px、line-height 1.65 |
| 3 | `Art. N` 中英模式 | 始终中文"第 N 条"（覆盖 brief §5 原决策）|
| 5 | Article 6 markdown | Phase 4 才写 |
| 6 | Header nav ghost | 保留灰色 Data Act / AI Act 占位 |
| 7 | TocSidebar 容器 | 裸列表（无白卡片）|
| 9 | Mono 字体 | 第一阶段系统栈，Phase 4 收尾再补（已 deferred）|
| 16 | TOC 文章标题 | 中英模式只显中文（chrome 规则统一全 TOC）|
| 17 | BilingualBlocks 单语隐藏 | 上线前 bug 修复，决策 #17 |
| 18 | 上线域名 | digital-rulebook.eu |
| 19 | 覆盖率徽章 | LawCard 覆盖率<100% 时显 In progress pill |

**Phase 实施历史**也在 GAP_AUDIT.md：

- Phase 0：恢复损坏的 package.json + global.css
- Phase 1：tokens + 双语可见性规则
- Phase 2：文章页核心交互（permalink + :target + endnotes + 双语 H1 + eyebrow pill）
- Phase 3：周边页面（Header + TocSidebar + LawCard + 首页 + articles index 章节分组 + about / 404 / recitals index）
- Phase 4：Article 6 + content.config.ts
- 上线前修复：BilingualBlocks 列单语隐藏 bug + 域名定 + 覆盖率徽章

---

## 联系信息

项目当前所有者 / 内容作者：[Frank](mailto:jiojuen@gmail.com)

接手时如需了解某个特定决策的背景，先读 `GAP_AUDIT.md` 决策日志；若仍有疑问联系所有者。

**祝你接手顺利。架构是干净的，决策都已经记录，剩下的主要是把 GDPR 全文翻完上线。**
