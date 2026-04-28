# Gap Audit — Astro 生产代码库 vs. Claude Design 高保真原型

**审计范围：** 全站（Article、Recital、首页、law landing、index 列表、404、About）
**目标：** 把 Claude Design 输出的 Art. 6 高保真原型一比一移植到现有 Astro 5 + Tailwind v4 代码库
**日期：** 2026-04-28
**审计方式：** 不改任何代码，逐文件读源码 + 字节级核对 + 对照 `dist/` 历史构建产物

> **本文档不是实施计划**。它只列差距、严重程度、修复优先级，以及在动手前需要 Frank 决策的开放问题。具体的实施步骤等审计通过后再写。

---

## 0. TL;DR — 必须先看的两件事

### 0.1 两个源文件已损坏（阻塞构建）

| 文件 | 字节数 | 实际结尾 | 状态 |
|---|---:|---|---|
| `package.json` | 564 | `"m` （第 21 行截断，无闭合 `}`） | **构建失败：JSON 解析错误** |
| `src/styles/global.css` | 3068 | `font-featur` （第 72 行截断，无闭合 `}`） | CSS 解析将报错或忽略整条规则 |

确认方式：`tail -c 200` + `xxd` 字节级查看。`npm run build` 当前确实报 `EJSONPARSE`。这两个文件需要在动任何设计代码之前先恢复。

### 0.2 `DESIGN_BRIEF.md` 描述的样式从未实现

`DESIGN_BRIEF.md` §2、§8、§14 多次提到 `.provision-block*`、`:target` 黄色闪烁动画（2.4s）、`.legal .footnotes*` 脚注样式、"Language visibility" CSS 规则。但：

- 这些规则在当前 `global.css` 中**完全不存在**（文件本身就只有 token + 字体 + html/body 基础样式，且还被截断）
- 历史构建产物 `dist/_astro/_id_.Dq1pp_u6.css`（754 KB）grep 确认：
  - `provision-block` 出现 **0** 次
  - `targetFade` 出现 **0** 次
  - `dr-toc` / `dr-endnotes` / `perma-btn` / `dr-en-row` / `color-target` 各 **0** 次
  - `lang-en-only`/`lang-zh-only`/`lang-en-strict`/`lang-zh-strict` 各只出现 1 次（可能是 Tailwind 默认匹配，并非显示/隐藏规则）

**结论：** `DESIGN_BRIEF.md` 是"应有之物"的设计意图描述，不是实际状态。Claude Design 给出的 Art. 6 原型恰好回答了 brief 中 §10 的多个开放问题（Q2/Q3/Q4/Q7/Q8）。这次移植本质上是**第一次把这些设计决策写进生产代码**。

---

## 1. 文件损坏（阻塞项 — Phase 0）

### P0-1 `package.json` 重写至完整状态

当前可读部分：
```json
{
  "name": "digital-rulebook",
  ...
  "dependencies": {
    "astro": "^5.5.0",
    "@astrojs/sitemap": "^3.2.1",
    "@tailwindcss/vite": "^4.0.9",
    "tailwindcss": "^4.0.9",
    "gray-matter": "^4.0.3",
    "marked": "^14.1.3",
    "m  ← 截断
```

`src/lib/laws.ts` 已 `import markedFootnote from 'marked-footnote'`，且 `@fontsource/inter` 等被 `global.css` `@import`，所以最少必须补回的依赖：`marked-footnote`、`@fontsource/inter`、`@fontsource/noto-sans-sc`、`@fontsource/noto-serif`、`@fontsource/noto-serif-sc`。`package-lock.json` 仍存在（239 KB），可作为版本对照源。

### P0-2 `src/styles/global.css` 重写至完整状态

当前文件只有 9 个 token（`@theme` 块）+ html/body 基础样式 + 一个未闭合的 `h1, h2, h3, h4, h5, h6 { font-family: var(--font-serif); font-featur` 规则。**所有 `.provision-block*`、`:target` 闪烁动画、语言可见性 hide 规则、`.dr-toc*`、`.dr-endnotes*` 都不在这里**。这是本次移植要新增的主体内容。

---

## 2. Token 系统差距

原型 `:root` 块（来自 `tweaks-panel.jsx` —— 上传文件名是错乱的，这个文件实际装的是 CSS）共 **24 个 token**；当前 `@theme` 块只有 **10 个**。

### 2.1 颜色 token

| Token | 原型值 | 现状 | 用途 |
|---|---|---|---|
| `--color-ink` | `#0f172a` | ✅ 一致 | 正文 |
| `--color-ink-soft` | `#475569` | ✅ 一致 | 二级文本 |
| `--color-ink-faint` | `#94a3b8` | ❌ 缺 | 三级文本、TOC 非当前项、`↩` 箭头 |
| `--color-rule` | `#e2e8f0` | ✅ 一致 | 边框 |
| `--color-rule-soft` | `#eef2f6` | ❌ 缺 | 脚注行虚线分隔 |
| `--color-paper` | `#ffffff` | ✅ 一致 | 卡片底色 |
| `--color-cream` | `#f8fafc` | ✅ 一致 | 页面底色 |
| `--color-brand` | `#0b3d91` | ✅ 一致 | 品牌色 |
| `--color-brand-soft` | `#eaf0fb` | ✅ 一致 | 悬停/选中底色 |
| `--color-brand-deep` | `#082e6e` | ❌ 缺 | 按钮悬停 |
| `--color-target` | `#fef3c7` | ❌ 缺 | `:target` 黄底 |
| `--color-target-rule` | `#f59e0b` | ❌ 缺 | `:target` 描边 |
| `--color-accent` | `#b91c1c` | ⚠️ 现有但原型未声明 | 当前未使用，建议保留 |

### 2.2 排印 token（原型全部缺失）

| Token | 原型值 | 用途 |
|---|---|---|
| `--font-mono` | `"JetBrains Mono", ui-monospace, ...` | 数字/标签等 mono 文本 |
| `--t-eyebrow` | `11px` | mono 小标签 |
| `--t-meta` | `13px` | 元数据、面包屑 |
| `--t-body` | `17px` | 正文 |
| `--t-block-h` | `15px` | Abs./lit. 标题 |
| `--t-h2` | `22px` | 中级标题 |
| `--t-h1` | `32px` | 文章 H1 |
| `--t-display` | `40px` | 大型 display |
| `--line-body` | `1.75` | 正文行高 |
| `--line-tight` | `1.35` | 标题行高 |

> **注：** 原型 README handoff 文档中给出的 `--t-h1: 42px` 与 `--t-body: 16px` 与 CSS 实际定义的 `32px` / `17px` **不一致**。CSS 是真相源（`tweaks-panel.jsx` 里的 `:root`）。这点需要 Frank 确认采用哪一组数值。

### 2.3 字体加载现状

`global.css` 已通过 `@fontsource` 自托管 Inter / Noto Sans SC / Noto Serif / Noto Serif SC，权重为 400/500/700（sans）和 400/600/700（serif）。**`JetBrains Mono` 当前没有自托管**——原型需要 mono 字体来显示 eyebrow、章节罗马数字、TOC 编号、脚注序号、面包屑等。需要新增 `@fontsource/jetbrains-mono` 依赖（400/500/600 三档）。

---

## 3. 语言可见性 CSS 规则缺失（阻塞项 — Phase 0）

`DESIGN_BRIEF.md` §5 详细规定了四个工具类的契约：

| 类名 | EN 模式 | ZH 模式 | 中英模式 |
|---|:-:|:-:|:-:|
| `.lang-en-only` | shown | hidden | shown |
| `.lang-zh-only` | hidden | shown | shown |
| `.lang-en-strict` | shown | hidden | **hidden** |
| `.lang-zh-strict` | hidden | shown | **hidden** |

而 `global.css` **完全没有**实现这些规则。Header.astro、LangSwitcher.astro、ProvisionLayout.astro、LawCard.astro、Footer.astro、所有 `index.astro` 页面已经在用这四个类名包裹文本——但 CSS 没有 hide 规则去支撑它们。**当前所有页面在所有语言模式下都会同时显示中英文。** 这是阻塞性 bug。

原型 CSS 给出的实现：
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

直接拷贝即可。

> **注：** `Art. N` 标签是已决定的特例（`.lang-en-only` + `.lang-zh-strict`），中英模式下显示英文 `Art. 6`。`PrevNextNav.astro` 当前用的是 `.lang-en-strict` + `.lang-zh-only`——中英模式会显示中文"上一条"。这与 brief §5 的 "Art. N 永远显示英文" 决策冲突，需要核对原型究竟选了哪种。

---

## 4. 设计原型 = 对 brief §10 开放问题的回答

Claude Design 给出的五个 production default 值，正好对应 brief §10 五个开放问题：

| Brief 开放问题 | 原型答案（Tweak default） | 实施含义 |
|---|---|---|
| Q2 块标题视觉权重 | `blockStyle: "rule"` | Abs. 1 改为 serif + 数字 pill + 上方水平 hairline rule |
| Q3 双语列节奏 | `bilingualRhythm: "natural"` | 中英两列各用各的最优字号/行距，不强制对齐 |
| Q4 Permalink 可发现性 | `perma: "persistent"` | 链式图标常驻在左外边距（绝对定位 `left: -28px`），不再依赖 hover |
| Q7 脚注呈现 | （隐含）端部聚合 endnotes | 文章末尾加 `.dr-endnotes` 双列（EN/ZH 并列）聚合区，不是每块各自的 footer |
| Q8 排印层级 | `typeScale: "classical"` | 17px body / 32px h1 / 22px h2 / 11px eyebrow，加入显式 type-scale token |

其他被原型探索过但**明确弃用**的备选（`pill` / `gutter` 块样式、`hover` / `inline` permalink、`dense` / `generous` 字阶、`aligned` 双语节奏）—— **不要移植**，handoff README 也明确写了"Strip them"。

---

## 5. 组件级差距

### 5.1 `Header.astro` — 中等差距

| 项 | 原型 | 现状 | 差距 |
|---|---|---|---|
| sticky 定位 | `top: 0; z-index: 50` | `top-0 z-30` | 微差 |
| 背景 | `var(--color-paper)` + `backdrop-filter: saturate(180%) blur(8px)` | `bg-white/85` + `supports-[backdrop-filter]:bg-white/70` | 等价 |
| 内层 max-width | `1180px` | `max-w-6xl` (1152px) | 28px 差，建议改 |
| 内层 padding | `12px 32px` | `px-4 py-3 md:px-6` | 微差 |
| Logo 方块 | 22×22 navy 圆角，内含白色"D"，Inter 700 13px | 32×32 (`h-8 w-8`)，内含 "DR" | **明显差异** |
| Logo 文字 | serif "Digital Rulebook"，两行，16px/700/lh 1.1 | sans `text-base font-semibold`，单行，hidden 在 sm 以下 | **明显差异** — 需要换成 serif 字体两行排版 |
| Nav | mono 11px uppercase，letter-spacing 0.08em，gap 22px，当前项 `--color-ink` weight 500 | sans `text-sm font-medium`，padding `px-3 py-1.5`，rounded-md 高亮 | **风格不同** — 原型是 mono 小写型，当前是按钮型 |
| Nav 顺序 | GDPR · Data Act (灰) · AI Act (灰) · About | 仅渲染已有 law（目前只 GDPR）+ About | 行为差异 — 原型暗示"显示规划中的法规但置灰"。需要确认要不要这种 ghost item |
| 移动端汉堡菜单 | 原型未涉及 | 有 `<details>` + `<summary>` SVG 汉堡 | **保留**（原型只是没画移动端） |

### 5.2 `LangSwitcher.astro` — 小差距

| 项 | 原型 | 现状 |
|---|---|---|
| 三按钮文字 | `中` / `EN` / `中英` | `中文` / `EN` / `中 / EN` |
| 容器 | `1px solid --color-rule`, `4px` 圆角 | `border + rounded-md p-0.5` |
| 按钮内边距 | `6px 12px`，mono 11px uppercase ls 0.01em | `px-2.5 py-1` text-xs |
| 激活态 | `bg --color-brand; color white` | `data-[active=true]:bg-[--color-brand] text-white` |
| JS：localStorage key | `dr-lang` | `dr-lang` ✅ |
| FOUC 预防 inline 脚本 | 在 BaseLayout `<head>` 里 | ✅ 已有 |

**核心 JS 行为完全一致**。需要改的只有：按钮文字（`中文`→`中`、`中 / EN`→`中英`）、按钮字体改 mono、字号略微调整（11px uppercase）。

### 5.3 `TocSidebar.astro` — 中等差距

| 项 | 原型 | 现状 | 差距 |
|---|---|---|---|
| sticky top | `80px` | `md:top-20` (80px) | ✅ |
| max-height | `calc(100vh - 100px)` | `md:max-h-[calc(100vh-6rem)]` (100vh - 96px) | 4px 差，可接受 |
| 容器 | 无外部边框，仅滚动 | `rounded-md border border-[--color-rule] bg-white` 卡片 | **差异** — 原型是裸列表，当前是卡片 |
| TOC 标题 | mono 10.5px uppercase ls 0.12em，`--color-ink-faint` | `text-xs uppercase` 和 `text-sm font-semibold` 双行（小字 + 大字） | **结构不同** |
| 章节标题 | mono 10.5px：罗马数字粗体 + sans 12px 章节名 | `<h3>`，`bg-slate-50 px-...`（截断未读全） | **差异** |
| Article 行 | `flex gap-10`, padding `5px 8px 5px 12px`，`.dr-toc-num` (mono 11.5px) + `.dr-toc-label` | `flex items-baseline gap-2 px-4 py-1.5 text-sm`，`w-7 ... font-mono text-xs` | **差异** — gap/padding/字号都需调 |
| 当前项 | `bg --color-brand-soft`, `color --color-brand`, `border-left: 2px solid --color-brand`, `font-weight 500` | `bg-[--color-brand-soft] font-semibold text-[--color-brand]` | 缺 left border |
| 滚动条 | 自定义细滚动条 `--color-rule` | 默认 | 微差 |

### 5.4 `BilingualBlocks.astro` — 大差距（核心组件）

这是改动量最大的组件。

| 项 | 原型 | 现状 | 差距 |
|---|---|---|---|
| 块 `<section>` id | 同 | 同 | ✅ |
| `scroll-margin-top` | `96px` (CSS) | `scroll-mt-24` (96px) | ✅ |
| 上边框 hairline | 每块上方 `1px solid --color-rule` | 无 | **缺失** — 这是 `blockStyle: "rule"` 的关键 |
| 上边距 | `padding-top: 18px; margin-top: 32px` | `space-y-7 md:space-y-9` (兄弟间距) | 略微不同 |
| 块标题（Abs./lit.） | mono 11px uppercase ls 0.12em，`--color-ink-soft`，weight 500 | `<h2>/<h3>` 默认样式（serif，因为全局 h1-h6 是 serif） | **风格不同** — 当前 Abs. 1 会被渲染成大 serif；原型是小 mono eyebrow |
| level-2 sub-block | `padding-left: 22px`，标题 10.5px ls 0.16em weight 600，紧凑段距 | 同 `<h3>` 样式，无缩进 | **缺失** |
| Permalink 按钮 | `position: absolute; left: -28px; top: 22px`，22×22 SVG 链式图标，悬停换 `--color-brand-soft`，复制后 1.4s 显示 ✓ + 绿色 | `<a>§</a>` 在标题行内 | **完全不同** — 需要绝对定位 + SVG 切换 + clipboard JS |
| 复制 URL JS | `navigator.clipboard.writeText()` + `history.replaceState()` + setTimeout 1.4s | 无 JS | **缺失** |
| 双语两列 grid | `grid-template-columns: 1fr 1fr; gap: 56px`（README 文档版）/ `gap: 32px`（CSS 实际值） | `grid gap-6 md:grid-cols-2 md:gap-10` (24/40px) | **差距** — 需要确认 32 vs 56px |
| 单语模式塌缩 | 单列 `max-width: 680px` | 默认单列（`md:grid-cols-2` 在小屏） | 需新增最大宽度 |
| ZH 字体 | `var(--font-sans)` (Noto Sans SC) | 同 | ✅ |
| `:target` 黄底闪烁 | `background --color-target; outline 2px --color-target-rule; animation targetFade 800ms ease-out 1 forwards; animation-delay 1.6s` | 无 | **缺失（核心 UX）** |
| 段落字号/行高 | 17px / 1.7（README）、`--t-body` (17px) / `--line-body` (1.75) (CSS) | 继承 html | 需明确赋 17px |
| `text-wrap: pretty` | 段落上有 | 无 | 缺失，但渐进降级 |

### 5.5 `ProvisionLayout.astro` — 大差距

布局壳层，差距最多。截断未读全（共 56 行），从已读部分看：

**已对齐：**
- `mx-auto max-w-6xl` 与原型 `max-width: 1180px` 接近（差 28px）
- `md:grid-cols-[260px_1fr]` 与原型一致
- 面包屑结构 ✅
- chapter line 用 mono 罗马数字 ✅（接近）

**缺失的视觉元素：**
- **Eyebrow 区块** —— 原型是 `<div class="dr-eyebrow">` 内含 navy pill `Art. 6`（`background: --color-brand; color: white; padding 3px 8px; mono 11px uppercase`）+ mono `CELEX 32016R0679`。当前是 `<p class="text-xs font-mono uppercase">{eyebrow} {number}</p>` —— **没有 pill 高亮，没有 CELEX 副信息**
- **H1 标题** —— 原型 `--t-h1: 32px` serif weight 700 lh 1.15，中英模式下 ZH 在 EN 下方 26px `--color-ink-soft`；ZH 模式下 ZH 升为 30px。当前是 `<h1>` 默认样式，无双语副标题处理
- **Endnotes 聚合区** —— 完全缺失（详见 §6）
- **Metadata footer `<dl>`** —— 原型有：`margin-top 56px; padding-top 24px; border-top 1px solid --color-rule`，`<dl>` mono 10.5px uppercase dt + sans 13px dd，字段 CELEX/Adopted/In force from/Source。当前 ProvisionLayout 是否有？看不到（源码截断）—— 需要确认
- **Toast** —— `.dr-toast` 复制成功提示，`position: fixed; bottom`，translateY 动画。当前无

### 5.6 `PrevNextNav.astro` — 小差距

| 项 | 原型 | 现状 |
|---|---|---|
| 容器 | flex row gap 16px | `flex items-stretch justify-between gap-3` |
| 卡片 padding | `16px 18px` | `px-4 py-3` (16/12) |
| 边框圆角 | `border 1px solid --color-rule; border-radius 4px` | `border + rounded-md` (6px) | 微差 |
| 顶部标签 | mono 10.5px uppercase ls 0.12em `--color-ink-faint` | `text-xs uppercase tracking-wider text-[--color-ink-soft]` | 颜色用 -soft 而非 -faint |
| 主标签 | `Art. N` mono brand color + 文章标题 | `text-sm font-medium` 单行 | **缺 Art. N 单独 token 显示** |
| `Art. N` 显示策略 | 始终英文 | 用 `.lang-en-strict` + `.lang-zh-only` —— **中英模式会显示"上一条/下一条"中文** | 与 brief §5 的"Art. N 始终英文"决策冲突 |

### 5.7 `LawCard.astro` — 小差距

| 项 | 原型未涉及（不在 Article 6 页） | 现状 |
|---|---|---|
| 颜色点 | — | inline style `background: ${law.color}` |
| CELEX 标签 | — | mono xs uppercase |
| 标题 | — | text-xl font-semibold |
| stats grid | — | flex flex-wrap gap-x-4 |

LawCard 不在原型范围内。但既然新设计语言确立了"显式 type-scale token + serif 标题"，LawCard 也应顺势改为：
- 标题用 `--t-h2` (22px) serif
- CELEX 用 `--t-eyebrow` (11px) mono
- stats 用 `--t-meta` (13px)

### 5.8 `Footer.astro` — 微差距

字号当前 `text-sm` / `text-xs`。与原型设计语言一致后建议统一用 `--t-meta` (13px) / `--t-eyebrow` (11px)。布局结构无需改。

### 5.9 `BaseLayout.astro` — 几乎对齐

✅ HTML lang 属性 / FOUC inline 脚本 / 字体 import 链 / `<html class="lang-both">` 默认 / canonical / sitemap meta 都与原型方向一致。**保留不动。**

---

## 6. 脚注系统差距 — 单独成节（最大缺口）

### 6.1 现状

- **Markdown 解析层**：✅ 已实现。`src/lib/laws.ts` 用 `marked-footnote` 插件，`suffixFootnoteIds()` 函数把默认的 `footnote-1` / `footnote-ref-1` 改写成 `footnote-en-p1-a-1` / `footnote-ref-en-p1-a-1` 风格（按 lang + blockId 命名空间隔离）
- **Markdown 内容**：✅ 已写过 —— `src/content/laws/gdpr/articles/1.md` 里有 `[^np]` / `[^自然人]` 双语脚注示例
- **组件渲染**：❌ **完全缺失**。`BilingualBlocks.astro` 只用 `set:html={block.content_en}` 把整段 HTML 倾倒进 div，但没有任何 `.dr-endnotes`、`.dr-en-row`、`.dr-en-ctx`、`.dr-fn-back` 渲染逻辑
- **CSS 样式**：❌ 完全缺失（`global.css` 没有 `.legal .footnotes*` 也没有 `.dr-endnotes*`）
- **聚合脚注全局编号**：❌ 缺失。原型在 `app.jsx` 的 `ArticlePage` 组件里用 useEffect 后处理把 `<sup>` 标记重编为全局序号。生产环境应该在**渲染时**而非运行时算

### 6.2 ID 命名差异

| 系统 | 正文 `<sup>` href | endnote `<li>` id | 备注 |
|---|---|---|---|
| 原型 README 文档 | `#fn-en-p1-a-1` | `fn-en-p1-a-1` | 短前缀 `fn-` |
| 原型 React 代码 (data.js) | `#fn-en-p1-a-1` | `fn-en-p1-a-1` | 同上 |
| 当前 Astro `suffixFootnoteIds` | `#footnote-en-p1-a-1` | `footnote-en-p1-a-1` | 长前缀 `footnote-` (来自 marked-footnote) |

**两套 ID 不兼容。** 需要决策：改 `suffixFootnoteIds` 把前缀也改短，还是接受 `footnote-...` 前缀让原型的"`fn-...`"样例化作历史记录？后者代价更小，因为 `marked-footnote` 默认就是 `footnote-`。

### 6.3 Article 6 sample 数据揭示的脚注分布

原型 sample（`styles.css` 文件实际装的是这份数据）：

| Block | EN 脚注数 | ZH 脚注数 |
|---|---:|---:|
| p1-a | 1 | 1 |
| p1-f | 2 | 2 |
| p3 | 1 | 1 |
| **合计** | **4** | **4** |

每语言独立编号 1..N。在原型 React 代码里 EN 序列与 ZH 序列各自从 1 开始；`seqMap` 把 footnote id → 全局序号映射给 `<sup>` 渲染。

### 6.4 端部聚合 endnotes 视觉规格（必须新建）

```
─────────────────────────────────────────────
NOTES                                共 4 条
─────────────────────────────────────────────
1  [LIT. A]   Note text…                   ↩
2  [LIT. F]   See Recital 47…              ↩
3  [LIT. F]   Cf. Charter…                 ↩
4  [ABS. 3]   "Union law" includes…        ↩
─────────────────────────────────────────────
```

- Section: `margin-top 56px`, `padding-top 24px`, top border `1px solid --color-rule`
- Header `flex justify-between baseline`：左 mono 11px uppercase ls 0.12em `--color-brand` weight 600 "NOTES"/"脚注汇总"，右 mono 11px `--color-ink-faint` tabular-nums "4 notes"/"共 4 条"
- 双列 grid：`1fr 1fr` 中英模式 / 单列 max-width 680px 单语模式
- 每行 `.dr-en-row`：`grid-template-columns: 24px 1fr 24px; column-gap: 12px; align-items: start`
- 行间分隔：`border-bottom: 1px dashed --color-rule-soft`，最后一行无
- 行 `:target`：与 provision-block 同款黄色闪烁
- `.dr-en-num`：mono 12px brand weight 600 tabular-nums right-aligned
- `.dr-en-ctx` (上下文 pill)：inline-block，mono 9.5px uppercase ls 0.12em weight 600，`bg --color-brand-soft; color --color-brand; padding 1px 6px; border-radius 3px; margin-right 8px; vertical-align 1px`，悬停反色
- `.dr-en-text`：正文色，与 pill 同行
- `.dr-fn-back` (`↩`)：right-aligned，`color --color-ink-faint; opacity 0.5`，悬停 opacity 1 + brand color，14px
- 每行需 `scroll-margin-top: 96px`

### 6.5 正文 `<sup>` 标记样式

```
.bilingual-col sup a {
  color --color-brand; weight 600; font-size 0.7em; padding 0 2px;
  margin 0 1px; border-radius 2px; scroll-margin-top 96px;
}
.bilingual-col sup a:hover { background --color-brand-soft; }
.bilingual-col sup a:target { background --color-target; }
```

---

## 7. 动画与交互差距

### 7.1 `:target` 黄色闪烁动画 — 缺失（核心 UX）

```css
@keyframes targetFade {
  to { background: transparent; outline-color: transparent; }
}
.provision-block:target,
.dr-en-row:target,
.bilingual-col sup a:target {
  background: var(--color-target);
  outline: 2px solid var(--color-target-rule);
  outline-offset: 4px;
  animation: targetFade 800ms ease-out 1 forwards;
  animation-delay: 1.6s;
}
```

时序契约（不能改）：
- 1.6s 持续显示黄色 + 描边
- 800ms 内淡出至 transparent
- 总时长 2.4s，`forwards` 保持终态

适用对象：`.provision-block`、`.dr-en-row`、正文 `<sup>` 标记 —— 所有可深链元素。

### 7.2 Permalink 复制交互 — 缺失

需要在 BilingualBlocks.astro 里加一段 inline `<script>`（保持"零客户端框架"约束）：

1. 委托 click 到 `.perma-btn`
2. `e.preventDefault()`
3. `navigator.clipboard.writeText(\`${origin}${pathname}#${blockId}\`)`
4. `history.replaceState(null, "", \`#${blockId}\`)`
5. 触发图标切换（链 → ✓，绿色）持续 1.4s 后还原
6. 同时显示页面级 toast `.dr-toast` 持续 2s

可选简化路径：用 CSS `:active` 伪类 + `<button onclick>` 直接 inline 写，避免单独的脚本块。

### 7.3 Toast — 缺失

`<div class="dr-toast">` `position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(120%)`，加 `.show` 类时 `translateY(0)`。中英分别用 `lang-en-strict` "Permalink copied" / `lang-zh-only` "已复制段落链接"。

### 7.4 平滑滚动 — 已有

`global.css` 已有 `html { scroll-behavior: smooth; }` ✅

---

## 8. 页面级差距

### 8.1 `/` 首页 — 中等差距

| 区块 | 现状 | 目标 |
|---|---|---|
| Hero | `<p>` mono uppercase + `<h1>` text-3xl/text-5xl + `<p>` text-base/text-lg + 两按钮 | 重排：mono eyebrow 改 `--t-eyebrow` 字号；H1 改 `--t-display` 40px serif；body 改 `--t-body` 17px |
| Regulations 区 | `<h2>` text-xl/text-2xl + LawCard grid | H2 改 `--t-h1` 32px serif；卡片用新 token 重排（见 §5.7） |
| 三特性 grid | 3 列 `<h3>` `text-sm font-semibold uppercase` + 段落 | H3 改 `--t-eyebrow` mono；段落 `--t-body` |
| 顶层 padding | `py-16 md:py-24` (64/96) | 维持 |

### 8.2 `/about/` — 微差距

只需把 H1 从 `text-3xl md:text-4xl` 改用 `--t-h1` token，段落改 `--t-body` 17px / 1.75 line-height。结构不动。

### 8.3 `/404` — 微差距

mono 404 标签改 `--t-eyebrow`；H1 改 `--t-h1`；按钮颜色 `bg-[--color-brand]` 已对齐。

### 8.4 `/laws/gdpr/` law landing — 大差距（最密集）

页面截断未读全（3085 字节中只读到约 2800 字节）。已知现状：
- Hero：CELEX + EUR-Lex link / H1 / description
- 双列 directory：Recitals 列 + Articles 列（按章分组）

差距：
- Hero CELEX 标签可改用 navy pill（与文章页 eyebrow 对齐风格）
- Recitals 列：每条 recital 显示 number + preview。preview 字号当前未知，需读完源码后定。原型未直接覆盖此页，但应统一字号 token
- Articles 列：每章 `CH. I 总则` 当前用什么样式？brief Q6 提到"chapter sub-headers 是否要 sticky"—— 这是开放问题
- 跨页面 token 统一：H1/H2/eyebrow 全部用新 type-scale

### 8.5 `/laws/gdpr/articles/` 文章索引 — 中等差距

当前是**扁平 `<ol>`**：每条 `Art. N + 标题`。
- 原型不直接覆盖此页
- DESIGN_BRIEF Q6 暗示应该用章节分组（`groupArticlesByChapter` 已存在）
- 建议改为按章分组（与 sidebar TOC 一致），每章 mono eyebrow + serif 章名，下面是 Article 列表

### 8.6 `/laws/gdpr/articles/N/` 文章详情 — 大差距（核心页）

详见 §5.4 + §5.5 + §6。这是改动量最大的页面。

### 8.7 `/laws/gdpr/recitals/` recital 索引 — 小差距

当前扁平 `<ol>` + preview。原型未直接覆盖。建议保留扁平结构（recitals 不分章），只统一 token。

### 8.8 `/laws/gdpr/recitals/N/` recital 详情 — 与文章详情共享 ProvisionLayout

差距同 §5.5。recital 没有 chapter line，level=0 的 block 不需要 heading；其他视觉规格一致。

---

## 9. 内容差距：Article 6 还没写

`src/content/laws/gdpr/articles/` 只有 `1.md`、`2.md`、`3.md`。原型展示的 Art. 6 内容并未写进 markdown。需要按现有 markdown schema（`## Abs. N {#pN}` + `:::en` / `:::zh` + `[^foo]` 脚注）把原型 sample 数据（11 个 block + 4 EN 脚注 + 4 ZH 脚注）转写成 `articles/6.md`。

> 用户已说明"全站"范围，但具体是否要本审计阶段就生成 6.md，还是等视觉移植做完一起做—— **见 §13 开放问题 #5**。

---

## 10. ID 命名 / 路径相关的兼容性条款（不能破坏）

DESIGN_BRIEF.md §11 明确：

- 深链 ID 是公共 API：`#p1-a` 必须永远指向 (1)(a)
- 三模式语言切换不改 URL（无 `/en/` `/zh/`）
- 多 law 内容模型不能硬编码 GDPR

原型与这些约束**完全兼容**，无需担心。

---

## 11. 不要回归的清单（保留项）

以下当前实现做对了，不要在视觉移植中误删：

1. `src/lib/laws.ts` 的多 law 自动发现 + 兼容 skill 风格 frontmatter 的标准化层
2. `BaseLayout.astro` 的 FOUC 预防 inline 脚本
3. `LangSwitcher.astro` 的 `dr-lang` localStorage key
4. `Header.astro` 的移动端 `<details>` 汉堡菜单
5. `BilingualBlocks.astro` 的 `data-lang="en"/"zh"` 属性（脚本可用）
6. `chapters.json` 单一来源
7. `<html lang="zh-CN">` 在 ZH 模式下的 lang 属性切换
8. 字体自托管 `@fontsource/*`（无 Google CDN）
9. 静态输出，零客户端框架
10. `getNeighbors` / `getChapterFor` / `groupArticlesByChapter` 等 lib 工具函数
11. 多语 frontmatter 标准化（接受 `title.en` 或 `title_en` 两种 schema）

---

## 12. 推荐修复优先级（Phase Plan）

> 这只是建议顺序。真正的实施计划等本审计被批准、开放问题答完后再写。

**Phase 0 — 解阻塞（半天内）**
- P0-1 修复 `package.json`（补全 dependencies + 加 `marked-footnote`、`@fontsource/jetbrains-mono`、`@fontsource/noto-serif-sc`）
- P0-2 修复 `global.css`（恢复完整 base + 加语言可见性规则）
- 确认 `npm run build` 通过

**Phase 1 — Token + 全站基础对齐（1 天）**
- 在 `@theme` 加 14 个缺失 token（颜色 + type scale + line height + mono 字体）
- 加 `JetBrains Mono` `@fontsource` import
- 写完 `.lang-en-only` / `.lang-zh-only` / `.lang-en-strict` / `.lang-zh-strict` 四套 hide 规则
- `Art. N` 标签的 strict 用法核对（PrevNextNav.astro 当前可能反了）

**Phase 2 — 文章页核心视觉（2-3 天，最大块）**
- `BilingualBlocks.astro` 改造：rule 风格 hairline + 左外边距 SVG permalink-btn + clipboard JS + `:target` 闪烁动画
- `ProvisionLayout.astro` 改造：navy pill eyebrow + CELEX 副信息 + 双语 H1（中英模式 ZH 副 + ZH 模式 ZH 主）+ metadata `<dl>` footer
- 新建 `EndnotesSection.astro` 组件 + 全局编号渲染逻辑（在 `lib/laws.ts` 内 build-time 算 `seqMap`）
- 加 `.dr-toast` 复制成功提示

**Phase 3 — 周边页面对齐（1-2 天）**
- Header.astro 改 logo 22×22 + serif 两行 wordmark + nav 改 mono 风格
- TocSidebar.astro 改裸列表 + mono 章节标题 + 当前项左 border
- LawCard.astro / 首页 hero / 三特性 grid 套新 token
- Articles index 改章节分组
- About / 404 / Recitals index 微调字号

**Phase 4 — 内容与验证（1 天）**
- 写 `articles/6.md`（按 schema 转译原型 sample）
- 通读全站 dev 截图 vs. 原型 HTML 对比
- 检查 :target 闪烁、permalink 复制、三语切换、TOC 当前项高亮、移动端

---

## 13. 决策日志（Frank 已拍板 — 2026-04-28）

| # | 议题 | 决策 | 实施含义 |
|---|---|---|---|
| 1 | 字号系数值 | **采用 README 数值：H1=42px / body=16px** | `@theme` 加 `--t-h1: 42px`、`--t-body: 16px`、对应 line-height 也调（body 1.65-1.7 而非 1.75） |
| 2 | bilingual 列间距 | **40px 折中** | `gap-10` (Tailwind 默认) 直接复用 |
| 3 | `Art. N` 中英模式显示 | **始终中文"第 N 条"** | **覆盖 brief §5 原决策**。所有 `Art. N` 标签改为 `.lang-en-strict + .lang-zh-only`（即中英模式只显 ZH）。涉及 PrevNextNav.astro、TocSidebar.astro、ProvisionLayout.astro eyebrow、面包屑、文章索引、原型 .dr-eyebrow-num pill |
| 4 | 脚注 ID 前缀 | **改短为 `fn-en-p1-a-1`** | `lib/laws.ts` 的 `suffixFootnoteIds()` 正则改：`footnote-` → `fn-`、`footnote-ref-` → `fnref-`。改前需确认 Art. 1-3 现有内容里没有外部链接已引用旧 ID（应该没有，未发布过） |
| 5 | Art. 6 markdown | **等视觉移植做完后再写** | Phase 4 才写 `articles/6.md`。前面 Phase 用 Art. 1-3 现有内容打磨视觉。⚠️ Art. 1 的 `[^np]` 双语脚注样例可作为脚注管线验证依据，不必专门补 Art. 6 |
| 6 | Header nav ghost | **保留灰色 Data Act / AI Act 占位** | 不能完全自动化（无 content/laws/data-act/ 目录）。需要在 Header.astro 里加一个 hardcoded ghost list（`opacity 0.5`，不可点击）。位置：现有动态 law list 之后、About 之前 |
| 7 | TocSidebar 容器 | **裸列表（去掉白卡片）** | 删 `rounded-md border border-[--color-rule] bg-white`；TOC 标题与正文之间不要 border-bottom，仅靠 mono eyebrow 字号区分 |
| 8 | bilingual 中隔线 | **仅靠 gap，去掉左竖线** | BilingualBlocks.astro 里 ZH 列删 `md:border-l md:border-[--color-rule] md:pl-10` |
| 9 | Mono 字体 | **第一阶段用系统 stack，Phase 4 收尾再补** | `@theme` 加 `--font-mono: ui-monospace, "SF Mono", "Cascadia Code", Menlo, "DejaVu Sans Mono", monospace`。不加 `@fontsource/jetbrains-mono` 依赖（暂时） |
| 10 | articles/index 分组 | **按章分组**（与 sidebar TOC 一致） | 复用 `groupArticlesByChapter()`。每章 mono eyebrow + serif 章名 + 文章列表，与 sidebar 渲染节奏一致 |

### 13.x 后续衍生的小决策（自动得出）

- **Q3 影响范围**：`Art. N` 改为始终中文意味着英文模式下也显示"第 N 条"。`.lang-en-strict + .lang-zh-only` 这一对组合在英文模式下：strict 显示、only 隐藏 → 结果是英文模式只看到 strict 部分。要把"第 N 条"放在 strict 里、`Art. N` 删掉，意味着**英文用户也看到中文"第 N 条"**。这是 Frank 明确的选择。
- **Q4 影响范围**：`Art. 1` 的 `[^np]` 命名脚注当前会生成 ID `footnote-np` → `suffixFootnoteIds` 改写成 `footnote-en-p1-np` 之类（不是 1/2/3 数字序号）。改成 `fn-` 前缀后变成 `fn-en-p1-np`。**全局聚合编号要在 Astro 端单独算**，不用 marked-footnote 的原始 1/2/3 序号。这是 Phase 2 的工作。
- **Q9 影响范围**：原型中 mono 元素的字号设定（如 mono 11px ls 0.12em）在系统字体下需要轻微微调 letter-spacing —— 不同 mono 字体的视觉密度不同。不调也能用，但 Phase 1 验收时要看一眼。

---

## 14. 验证方法（审计本身）

- 全部 `.astro` / `.css` / `.json` / `.ts` 源文件通读（除 5 个 source-corrupt 截断处）
- 字节级核对 `package.json` 与 `global.css` 的截断点（`xxd` + `tail -c`）
- `dist/_astro/_id_.Dq1pp_u6.css` (754 KB) grep 历史构建产物
- `npm run build` 实际运行确认 EJSONPARSE 阻塞
- 5 个上传文件名错乱已排查并标注真实内容
- 与 `DESIGN_BRIEF.md` §10 五个开放问题逐一映射到原型 Tweak 默认值

---

## Sources

- [DESIGN_BRIEF.md](computer://C:\Users\jiaju\Documents\Claude\Projects\Digital Rulebook/DESIGN_BRIEF.md)
- [Astro 项目根](computer://C:\Users\jiaju\Documents\Claude\Projects\Digital Rulebook)
- 原型 5 个上传文件：`uploads/{README.md, app.jsx, data.js, styles.css, tweaks-panel.jsx}`（文件名与内容错配，详见 §1）

---

## 15. Phase 1 完成确认（2026-04-28）

- ✅ `package.json` 已恢复至 30 行完整状态（依赖列表从 `package-lock.json` 反推）
- ✅ `src/styles/global.css` 写入 6584B，14 个新 token 全部进 `@theme`（含 `--font-mono`、`--color-target`/`--color-target-rule`、`--t-h1: 42px`、`--t-body: 16px`、`--line-body: 1.65`、`--line-tight: 1.35` 等），6 行 lang-visibility 选择器 + `display:none !important` 落在文件末尾
- ✅ `h1-h6` 块的 `line-height` 已替换硬编码 `1.25` → `var(--line-tight)`
- ⚠️ **Edit 工具跨 Windows-Linux mount 写入会被静默截断** — Phase 0 审计里"package.json 564B / global.css 3068B" 的截断不是历史污染，是 Edit 工具的副作用。Phase 1 改写 global.css 时复现：第一次 Edit 后 Read 看到 135 行完整版，但 bash mount 端 `wc -c` 仍是 3146B 旧版。最终用 `cat heredoc` 直写 mount 端才一致。**Phase 2 起所有 >2KB 文件改写都用 bash heredoc**，单 token / 单选择器小补丁可继续 Edit。
- ⚠️ **构建只能 Windows 端跑** — `package-lock.json` 锁的是 `@rollup/rollup-win32-x64-gnu` / `-msvc`，Linux sandbox 无对应 binding，`npm run build` 在 sandbox 必然 `Cannot find module '@rollup/rollup-linux-x64-gnu'`。sandbox 内做语法级验证（括号平衡、token 计数、grep）即可，最终 `npm run build` Frank 在 Windows 跑
  - **2026-04-28 更新（Phase 3 时）**：Phase 3 在 sandbox 内重新跑了一次 `npm install`，新的 `package-lock.json` 含全部 27 个 rollup 平台 binding（darwin-arm64 / darwin-x64 / linux-arm64-gnu / win32-x64-msvc 全在）。**这条 Windows-only 限制已经作废**，Frank 切到 Mac 后直接 `npm install && npm run dev` 即可。

---

## 16. 决策日志（Phase 2 拍板 — 2026-04-28，第二轮）

| # | 议题 | 决策 | 实施含义 |
|---|---|---|---|
| 11 | Permalink 按钮显示 | **始终显示，左外边距** | `.provision-block__permalink` `position:absolute; left:-28px; top:22px`，22×22 SVG 链接图标，brand 色 hover。触屏可达，与 Apple/MDN 文档站惯例一致 |
| 12 | EndnotesSection 位置 | **正文 → 脚注 → 元数据** | ProvisionLayout 渲染顺序：`<BilingualBlocks/>` → `<EndnotesSection/>` → `<dl>` 元数据（来源/最后校阅/相关条款）。脚注紧跟正文便于跳转回参 |
| 13 | Art. N pill 双语处理 | **一颗 pill，内容随语言切换** | `<span class="dr-eyebrow-num lang-en-strict">Art. {n}</span><span class="dr-eyebrow-num lang-zh-only">第 {n} 条</span>` —— 两个 span 共享样式（navy bg + 白字 + mono 11px uppercase），靠 `.lang-*` 类显隐切换。视觉上始终一颗 pill，与决策 #3 一致 |
| 14 | 全局脚注编号算法层 | **build-time 在 `lib/laws.ts` 算** | 在 `parseBlocks()` 后新增 `buildEndnoteSeqMap(blocks)` 工具：扫所有块的 `<sup>` ref，按出现顺序合并 EN+ZH 命名映射 → 返回 `Map<rawId, seqNum>`。挂在 article 返回结构上传给 EndnotesSection。同一层实现，避开渲染时重复扫描 |
| 15 | Footnote ID 正则范围 | **正则同时支持命名 + 数字** | `suffixFootnoteIds()` 新正则：`/(id\|href)="(#?)footnote(-ref)?-([\w\-]+)"/g` —— `[\w\-]+` 既匹配 `1`（数字）也匹配 `np` / `自然人`（命名）。前缀同时改 `footnote-` → `fn-`、`footnote-ref-` → `fnref-`。**这是对决策 #4 的精化**：Article 1 现有命名脚注 + Article 6 未来数字脚注两套都覆盖 |
| 16 | TocSidebar 文章标题双语显示 | **中英模式只显中文** | TocSidebar.astro 的文章标题行从 `lang-en-only + lang-zh-only`（content 规则）改为 `lang-en-strict + lang-zh-only`（chrome 规则）。Frank 反馈：中英模式下 EN+ZH 标题在 ~210px label cell 里挤在一起、英文还会被 nowrap+ellipsis 截掉，可读性差。**整个 TOC 现在统一走 chrome 规则**：sidebar 顶部 (`Articles/条文`)、章节标题 (`General provisions/总则`)、文章标题、recital 行标签全部在中英模式下只显 ZH，与 brief §5 的 chrome 规则一致。**这是对决策 #3 的延伸**——双语阅读发生在主体内容区，TOC 只是导航 chrome，不重复展示。EN 单语模式仍正常显 EN 标题 |
| 17 | BilingualBlocks 主体两列单语隐藏 | **bug 修复：`lang-en-only` / `lang-zh-only` 加到列上 + 单语模式 grid 折叠** | Phase 2 实现里 BilingualBlocks 的 `<div data-lang="en">` / `<div data-lang="zh">` 主体内容列**只用了 `data-lang` 属性**，CSS 没有任何 `[data-lang]` 隐藏规则。结果：EN 模式下英文段落 + 中文段落仍然两列并排显示，lang switcher 只对 chrome 生效，对正文无效。Frank 在上线前最后一遍走查发现。**修复**：(1) `BilingualBlocks.astro` 给两列加 `lang-en-only` / `lang-zh-only` 类，让 §1 的 hide rule 接管显隐；(2) `global.css` 加 `@media (min-width: 768px) { html.lang-en [data-bilingual], html.lang-zh [data-bilingual] { grid-template-columns: minmax(0, 680px); justify-content: start; } }`，让残存的单语列从 50% 半宽重排为 680px 自然单栏宽度，与 `.dr-endnotes__grid` 同款 collapse 模式 |
| 18 | 上线域名定为 `digital-rulebook.eu` | **`astro.config.mjs` site + `public/robots.txt` sitemap URL 都改到真实域名** | 之前是占位 `digital-rulebook.example`。改完一次 build 后 sitemap-0.xml 12 条 URL 全部前缀 `https://digital-rulebook.eu/`，robots.txt 的 Sitemap 指向同域。后续切换或绑自定义二级域名时只动 `astro.config.mjs` 的 site 一行 + robots.txt 一行 |
| 19 | 覆盖率徽章（"持续补充中"） | **LawCard 在覆盖率<100% 时显示进度** | `meta.json` 加 `total_articles` / `total_recitals` 两个可选字段（GDPR：99 / 173），`LawMeta` 类型对应可选字段。`LawCard.astro` 依据是否有 total 渲染 `4 / 99 articles` 或回落到 `4 articles`；当任一数值未到 total 时挂一个 `.dr-coverage-pill`（mono 11px brand 色 + brand-soft 底，pill 形）"In progress / 持续补充中"徽章在 CELEX 行旁。**全量上线后徽章自动消失**——不需要回头删字串。`global.css` 加 `.dr-coverage-pill` 类配合 |

### 16.x Phase 2 衍生小决策

- **Q4 重申**：BilingualBlocks EN/ZH 列间分隔 = "无分隔，仅 gap-10"，与决策 #8 完全一致，不做新增。（这次只是 Phase 2 复盘时再次确认。）
- **Permalink hash 格式**：clipboard 写入 `${origin}${pathname}#${block.id}` 全 URL（不只是 `#id`），符合 MDN/Stripe 习惯。`history.replaceState(null, '', '#' + id)` 同步浏览器地址栏，不增加 history 栈
- **Toast 出现条件**：仅 clipboard 写入成功后显示。`navigator.clipboard.writeText()` reject（不安全上下文 / 权限拒绝）时静默失败，不显示 toast，不阻断 history.replaceState — `:target` 闪烁仍生效
- **Toast 时序**：fadeIn 200ms → 持续 1000ms → fadeOut 200ms = 总 1.4s，与 GAP_AUDIT §5.4 line 212 一致
- **EndnotesSection 单语 fallback**：当 `<html.lang-en>` 或 `<html.lang-zh>` 时仍渲染双列 grid 但隐藏对侧（靠 `.lang-en-only` / `.lang-zh-only` 类）；max-width 680px 保证单语模式下不过度撑开

---

## 17. Phase 2 完成确认 + 一个关键 fix（2026-04-28）

### 完成状态

- ✅ `src/lib/types.ts` (145 行) — 加 `Endnote` / `MergedEndnote` 接口；`Article` 加可选 `endnotes` / `endnoteSeqMap`
- ✅ `src/lib/endnotes.ts` (156 行 — 新建) — `splitFootnotesFromHtml` / `extractEndnoteItems` / `buildEndnoteSeqMap` / `rewriteSupLabels`
- ✅ `src/lib/laws.ts` (475 行) — `suffixFootnoteIds` 正则改 `[^"]+` 同时覆盖数字+命名脚注；`mdToHtml` 接累加器；`loadAll` article 循环算 seqMap 并 rewriteSupLabels
- ✅ `src/styles/global.css` (478 行 / 17490 B) — 全部 14 个新 token 用上，24 个 Phase 2 选择器
- ✅ `src/components/BilingualBlocks.astro` (160 行) — `.provision-block` hairline + 左外边距 SVG 永久 permalink + clipboard JS + history.replaceState + toast + retarget 重启动画
- ✅ `src/components/EndnotesSection.astro` (99 行 — 新建) — 双列 grid，`splitBackRef` 把 marked-footnote 末尾的 ↩ anchor 抽到第三列
- ✅ `src/layouts/ProvisionLayout.astro` (160 行) — eyebrow `.dr-eyebrow-num` navy pill 双 span 切换；双语 H1 `.article-h1-en` + `.article-h1-zh`；BilingualBlocks 后插 EndnotesSection；元数据 `<dl>` 在最末
- ✅ `src/pages/laws/[law]/articles/[id].astro` — 加 `endnotes={article.endnotes}` 一行

### 验证

- CSS 括号平衡 50↔50；14/14 新 token 全部声明；24/24 关键选择器到位
- 7 个文件的 39 个关键 string sanity 全过
- 脚注 pipeline 模拟测试 9/9 PASS（fixture：p1 命名 `np`/`自然人`、p2 数字 `1`/`1`、p3 双脚注 `a,b`/`甲,乙`）
- Article 1 真实 markdown 跑通：3 块 (p1/p2/p3)，p1 EN+ZH 配对成 seq=1 单条逻辑脚注
- 留 Frank 在 Windows 端 `npm run build` + 浏览器实测做最终视觉验收

### 关键 fix —— 改用"block 内顺序配对"替代"ID stripping 合并"

**Why:** 第一版 `buildEndnoteSeqMap` 用 `stripLangFromId(rawId)` 剥掉 `en-`/`zh-` 段作 mergeKey，假设 EN/ZH 同名脚注共享后缀（如 `fn-p1-1`）。模拟测试发现：marked-footnote 1.4 把 **非-ASCII 标签 URL-encode**，所以 `[^自然人]` → `id="footnote-%E8%87%AA%E7%84%B6%E4%BA%BA"`，永远不会与 `[^np]` 共享 mergeKey。Article 1 用的就是 `[^np]` / `[^自然人]` 这种异名命名脚注，原方案直接失败（4 半 → 4 条独立而非 2 条合并）。

**Fix:** 改用"按 block 内 EN/ZH 出现顺序配对"算法：第 i 个 EN 脚注 ↔ 第 i 个 ZH 脚注。这是双语 markdown 最自然的语义，也是 EUR-Lex / JuriGlobe 等双语法律文档的惯例。算法支持任意标签字符（数字、ASCII 命名、CJK、混合）。

**Trade-off:** 作者必须保证 EN 块和 ZH 块的脚注顺序一致；如果某块 EN 写 3 条 ZH 写 2 条，第 3 条 EN 落单（zh 半为空），EndnotesSection 在双语模式下显示一行只有 EN 内容。这是符合预期的退化行为。

**衍生决策（决策 14 精化）：** seqMap 算法不依赖 ID 字符串相等，依赖 (blockId, occurrenceIndex)。这意味着 GAP_AUDIT 之前说"剥 lang 前缀合并"在 Article 1 就不 work，需用顺序配对替代。

---

## 18. Phase 3 完成确认（2026-04-28）

### 完成状态

- ✅ `src/styles/global.css` (715 行 / 23.5 KB / 84↔84 括号平衡) — Phase 3 新增 17 个共享类（`.dr-wordmark*` / `.dr-nav-link*` / `.dr-toc__*` / `.dr-eyebrow*` / `.dr-hero-h1` / `.dr-page-h1` / `.dr-section-h2` / `.dr-feature-h3` / `.dr-body` / `.dr-meta`），全部基于 Phase 1 的 `--t-*` token
- ✅ `Header.astro` — 22×22 navy `.dr-wordmark__mark` + serif "D" + 双行 wordmark；nav 改 mono uppercase；按决策 #6 加 ghost `Data Act` / `AI Act` 双重渲染（桌面 nav + 移动汉堡菜单），`aria-disabled="true"`
- ✅ `TocSidebar.astro` — 拆白卡片外框；`dr-toc__chapter` mono brand 罗马数字；`.dr-toc__row--active` 加 2px brand left-border + brand-soft 底（决策 #7）
- ✅ `LawCard.astro` — `--t-h2` serif 标题、`--t-eyebrow` mono CELEX、`--t-body` 描述、`--t-meta` stats 行
- ✅ `index.astro` — Hero `dr-eyebrow--brand --hero` (ls 0.2em) + `dr-hero-h1` clamp 至 `--t-h1`；三特性卡片 `dr-feature-h3`；section 头 `dr-section-h2`
- ✅ `laws/[law]/index.astro` — 同套 token 替换，serif H1，eyebrow CELEX
- ✅ `articles/index.astro` — 按决策 #10 改章节分组（`groupArticlesByChapter`），每章 mono brand eyebrow + 卡片化文章列表
- ✅ `recitals/index.astro` / `about.astro` / `404.astro` — H1 统一到 `dr-page-h1`，正文 `dr-body`

### 验证

- `npm run build` sandbox 端通过，11 条静态路由全部重新生成
- Bundled CSS 1.5 MB，17/17 Phase 3 选择器全部进 dist
- 8 个页面 HTML 抽查：Header wordmark + nav + ghost items 在所有页面渲染；TocSidebar 在 Art. 1 唯一高亮 active row 编号 = 1
- Phase 2 无回归：`provision-block__permalink` / `dr-eyebrow-num` / `article-h1-en` / `dr-endnotes` / `#fn-en-p1-np` 全部仍在
- Articles index 显示 `CH. I` 章节分组（GDPR 当前只有 Art. 1-3，全在第 1 章）

### 留给 Phase 4 浏览器实测的验收项

- 三语切换（中文 / EN / 中英）：检查 nav 文字、eyebrow pill、H1 stack、TocSidebar、PrevNextNav 各自的显隐
- Permalink hover + click：链式图标变蓝、复制 URL 到剪贴板、URL bar 变 `#pN`、toast 显示 1.4s
- 同一段二次点击：`provision-block--retarget` 强制重启黄色闪烁动画
- `:target` 闪烁时序：1.6s 黄底 + orange outline → 800ms 渐隐
- 移动端 380px：wordmark 折叠（只剩 D 方块）、nav 折成 `<details>` 汉堡、ghost items 在汉堡里也变灰、TocSidebar 从 sidebar 变 article 上方滚动列表、BilingualBlocks 双列变上下堆叠、permalink 自动从 `-28px` 改为 inline

---

## 19. Phase 4 完成确认（2026-04-28）

### 完成状态

- ✅ `src/content/laws/gdpr/articles/6.md` (新建，11.4 KB) — 真实 GDPR Article 6 (Lawfulness of processing) 全文双语，4 个 Abs. + 13 个 lit. + 2 个 UAbs. 续段 + 2 条双语脚注（`consent`/`同意` 解释 Art. 4(11) 引用 + Art. 7 同意条件；`lia`/`合法利益评估` 解释 Recital 47 平衡测试）。`related: [5, 7, 8, 9, 10]` + `related_recitals: [40-50]`
- ✅ `src/content.config.ts` (新建) — `defineCollection({ loader: glob, schema: passthrough })` 显式声明 `laws` collection，清掉 Astro 5 deprecation 警告。注释说明：DR 不用 `getCollection()` API，本文件只为消警告，schema 用 `z.object({}).passthrough()` 接受现有所有 frontmatter 形态（DR-native flat / skill-style nested / Phase 4 新增的 `p1-2` / `p3-2` 续段块）
- ✅ Article 6 引入了新的"续段"约定：`## Abs. N — 2. UAbs. {#pN-2}` 用于跟在 lit 列表后的同一 paragraph 的第二 Unterabsatz。schema 不需要扩，HEADING_RE = `/^(#{2,4})\s+(.+?)\s+\{#([\w-]+)\}\s*$/` 已经支持任意标题文本

### 验证

- `npm run build` 跑通，**13 条静态路由**生成（比 Phase 3 多 1 条 `/laws/gdpr/articles/6/` + sitemap）
- Article 6 渲染 37 KB / 19 个 provision-block 全部拿到稳定深链 ID（`p1`, `p1-a..p1-f`, `p1-2`, `p2`, `p3`, `p3-a`, `p3-b`, `p3-2`, `p4`, `p4-a..p4-e`）
- 19 个 heading 全部正确：`Abs. 1` / `lit. a-f` / `Abs. 1 — 2. UAbs.` / `Abs. 2` / `Abs. 3` / `lit. a-b` / `Abs. 3 — 2. UAbs.` / `Abs. 4` / `lit. a-e`
- 端部 endnotes：4 rows（2 条 EN + 2 条 ZH 半），`buildEndnoteSeqMap` 顺序配对正确：consent/同意 → seq=1，lia/合法利益评估 → seq=2
- 4 个 inline `<sup>` refs 显示**全局 seqNum**（1, 1, 2, 2）而非 marked-footnote 的 per-block 1/2，rewriteSupLabels 工作正常
- Eyebrow pill `Art. 6` (en-strict) + `第 6 条` (zh-only)、CELEX 32016R0679、`CH. II Principles / 原则`、related 链接 `[5, 7, 8, 9, 10]`（指向尚未写的条款，404 到回退）、双语 H1 `Lawfulness of processing` / `处理的合法性` 全部到位
- Articles index 现有 **2 个章节** (CH. I + CH. II)，Art. 6 进入 CH. II 分组
- Law landing 列表也显示 Art. 6
- TocSidebar 在 Art. 6 页面正确高亮 row 编号 = 6
- `@astrojs/sitemap` 生成 `sitemap-index.xml` + `sitemap-0.xml`，**Astro 5 deprecation 警告已消除**

### 推迟到下一轮的项

- 决策 #9 的 JetBrains Mono 自托管（`@fontsource/jetbrains-mono`）—— 当前系统 mono stack 的视觉密度可接受，等 Frank 浏览器实测后决定是否值得加 ~150 KB 字体载入
- Article 4（定义条款，Art. 6 多次引用 Art. 4(11) 的 consent 定义）+ Article 5（处理原则，Art. 6 章节归属）+ Article 7（同意条件）的 markdown —— Phase 4 只覆盖审计指定的 Art. 6，更多内容是后续工作
- Frank 在 Mac 端的浏览器视觉验收（§18 验收项清单）

---

## Sources（Phase 3-4 追加）

- [src/styles/global.css](computer:///Users/liujiajun/Downloads/digital%20rulebook/src/styles/global.css)
- [src/content/laws/gdpr/articles/6.md](computer:///Users/liujiajun/Downloads/digital%20rulebook/src/content/laws/gdpr/articles/6.md)
- [src/content.config.ts](computer:///Users/liujiajun/Downloads/digital%20rulebook/src/content.config.ts)
