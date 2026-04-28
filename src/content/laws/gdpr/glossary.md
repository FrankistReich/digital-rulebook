---
title: GDPR 翻译术语表
title_en: GDPR Translation Glossary
glossary_version: "1.3"
last_reviewed: "2026-04-28"
---

# GDPR 翻译术语表 / Translation Glossary

写新条文前先查这张表，确保整个网站的术语统一。新发现高频术语 → 加进表 + 在第一次出现的条文里使用 → 后续条文按表对齐。

## 翻译总原则

1. **法律术语优先精准，文学性放第二位**——`controller` 必须译"控制者"不能译"管理者"，因为 GDPR 第 4(7) 条对"controller"有特定法律定义。
2. **与欧盟官方语言版本的概念结构及主流中文译法对齐**——GDPR **没有欧盟官方中文版**（欧盟官方语言不含中文）。本站中文译文属非官方参考译本，应以 EUR-Lex 英文 / 德文等官方语言版本为基础，并结合 EDPB 文件、CJEU 判例及权威中文研究译本（如丁晓东译本）进行术语校准。
3. **本网站定位为非官方参考**——README 已声明，但不得故意偏离主流翻译造成歧义。
4. **多义词标 `vs.`** ——例如 `processing` 名动两可，下表分别给名词形式与动词形式。
5. **同一术语允许多个译法并列**——若学术界对某一术语存在多种主流译法（如 `legitimate interests` 既译"正当利益"也译"合法利益"），本表给出本站首选 + 列出常见替代译法 + 说明取舍理由。

## 排版与格式约定

- 在条文 `:::zh` 块里**首次出现**重要术语时，可用脚注做译者说明，参见 Art. 6 的 `[^合法利益评估]` 用法。后续重复不再加脚注。
- 英文术语在中文里出现时，用全角括号包裹原文："控制者（controller）"。仅当读者会主动搜索英文时使用。
- 缩写首次出现保留全称 + 缩写："数据保护影响评估（Data Protection Impact Assessment, DPIA）"，后续直接用缩写"DPIA"。

---

## 术语主表（按英文字母序）

| 英文 | 中文 | 备注 / 出处 |
|---|---|---|
| accountability | 问责制 / 责任落实原则 | Art. 5(2)。**标题首选"问责制"**；解释性文本中说明：控制者负有证明（demonstrate）其遵守 Art. 5(1) 各项原则的责任 |
| accuracy | 准确性 | Art. 5(1)(d)。处理原则之一——个人数据应准确，必要时保持最新 |
| adequacy decision | 充分性决定 | Art. 45 |
| administrative fines | 行政罚款 | Art. 83。GDPR 罚款上限为全球年营业额 4% 或 2000 万欧元，以高者为准 |
| anonymisation | 匿名化 | 与 pseudonymisation 区分：anonymisation 不可逆，匿名后已不在 GDPR 范围；pseudonymisation 可逆，仍是个人数据 |
| appropriate technical and organisational measures (TOMs) | 适当的技术和组织措施 | GDPR 高频术语，遍及 Art. 24 / 25 / 32 / 35 等。**实务中常用缩写 TOMs**。"组织措施"指流程、政策、培训等，与"技术措施"（加密、访问控制等）相对 |
| audit trail | 审计日志 | 操作层面的事件记录序列（谁在何时对什么数据做了什么）。**与 Records of Processing Activities (RoPA, Art. 30) 不同**——RoPA 是合规层面的处理活动正式登记，audit trail 是技术层面的操作流水。两者在数据保护实务里都需要但功能不同 |
| automated decision-making | 自动化决策 | Art. 22。条文标题原文为 `automated individual decision-making, including profiling`，强调针对个人的决策；本站简化为"自动化决策"已包含 Art. 22 立法重点 |
| binding corporate rules (BCR) | 具有约束力的公司规则 | Art. 47。首次出现写全称 |
| biometric data | 生物识别数据 | Art. 4(14) 定义、Art. 9 列入特殊类别。指通过特定技术处理而能唯一识别自然人的物理、生理或行为特征数据（指纹、面部图像、虹膜等）|
| breach notification | 泄露报告 / 泄露通知 | Art. 33 对**监管机构**是"报告或通知"；Art. 34 对**数据主体**是"通知"。建议按条文区分使用，标题可统一为"个人数据泄露通知" |
| certification mechanism | 认证机制 | Art. 42。控制者 / 处理者可通过经认可的认证机构获得数据保护认证 |
| children | 儿童 | Art. 8 / Recital 38 |
| codes of conduct | 行为准则 | Art. 40。行业协会等可起草，经监管机构批准后约束成员 |
| compensation and liability | 赔偿与责任 | Art. 82。数据主体对违法处理造成的损害有获得赔偿的权利；控制者 / 处理者承担连带责任 |
| competent authorities | 主管机关 | Art. 2(2)(d)。**特指刑事执法相关主管机关**（预防、调查、侦查或起诉刑事犯罪等），**不等同于 supervisory authority**（监管机构，Art. 4(21)）。已用于 Art. 2 |
| complaint | 投诉 | Art. 77。数据主体有权向监管机构投诉。**与 judicial remedy（司法救济，Art. 78/79）区分**——投诉走行政程序，司法救济走法院 |
| compliance | 合规 | 名词形式 |
| consent | 同意 | Art. 6(1)(a) / Art. 7。**不译"同意书"**——同意是状态不是文档 |
| consistency mechanism | 一致性机制 | Chapter VII（Art. 63-67）。EDPB 协调各成员国监管机构的程序，确保 GDPR 在欧盟范围一致适用 |
| contract | 合同 | Art. 6(1)(b)。已用于 Art. 6 |
| controller | 控制者 | **核心术语**。Art. 4(7)。**不译"管理者""控制方"**。已用于 Art. 1 / 3 / 6 |
| criminal convictions and offences | 刑事定罪和犯罪相关数据 | Art. 10。受比 Art. 9 特殊类别更严的限制——仅在公权力监督下或法律授权时才可处理 |
| cross-border processing | 跨境处理 | Art. 4(23) |
| data breach | 数据泄露 | Art. 4(12) "personal data breach" |
| data concerning health | 健康相关数据 / 健康数据 | Art. 4(15)。指与自然人的身体或精神健康相关的个人数据，包括医疗服务提供过程中显示其健康状况的信息。Art. 9 列入特殊类别 |
| data minimisation | 数据最小化 | Art. 5(1)(c) |
| data portability | 数据可携带（性） | Art. 20。"the right to data portability" → "数据可携带权" |
| data leak | 数据外泄 | 仅指数据泄出 / 外流。**与 `personal data breach` 区分**——GDPR Art. 4(12) 的 personal data breach 范围更广（含毁损、丢失、更改、未经授权披露或访问） |
| data protection by default | 通过默认设置实现的数据保护 / 默认数据保护 | Art. 25。强调默认仅处理特定目的所必需的个人数据 |
| data protection by design | 通过设计实现的数据保护 / 数据保护内嵌设计 | Art. 25。**不译"设计阶段的数据保护"**——by design 不限于设计阶段，要求将数据保护原则嵌入系统架构、处理方式与运行机制全程。**亦不译"隐私设计"**——GDPR 用 "data protection" 不是 "privacy" |
| data protection by design and by default | 通过设计和默认设置实现的数据保护 | Art. 25 标题统一译法 |
| Data Protection Impact Assessment (DPIA) | 数据保护影响评估 | Art. 35。首次出现写全称 |
| Data Protection Officer (DPO) | 数据保护官 | Art. 37-39。首次出现写全称 |
| data subject | 数据主体 | **核心术语**。Art. 4(1)。**不译"主体数据""资料主体"**。已用于 Art. 1 / 3 / 6 |
| data subject rights | 数据主体权利 | Chapter III 总称 |
| derogation | 减损 / 例外 | Art. 49 等。语境里"特别例外"较通顺 |
| encryption | 加密 | Art. 6(4)(e) / Art. 32 |
| establishment | 机构 / 营业机构 | Art. 3(1), Art. 4(16)。指通过稳定安排实际从事活动的机构，**不是单纯的注册地址或物理办公点**，但也不应理解为脱离物理活动场所的纯抽象法律实体。Art. 3(1) "establishment of a controller" → "控制者的机构"。**不译"分支""设立地"** |
| European Data Protection Board (EDPB) | 欧洲数据保护委员会 | Art. 68-76。首次出现写全称 |
| fairness / fair processing | 公平 / 公平处理 | Art. 5(1)(a) |
| filing system | 结构化档案系统 / 有序档案系统 | Art. 4(6)。**重点是"按特定标准可检索的"结构化集合**——单译"档案系统"略虚。原 Art. 2 中文版已用"档案系统"，需回头改为"结构化档案系统"（v1.2） |
| free movement of personal data | 个人数据自由流动 | Art. 1。已用于 Art. 1 |
| fundamental rights and freedoms | 基本权利与自由 | 整部条例反复出现。已用于 Art. 1 |
| genetic data | 遗传数据 | Art. 4(13) / Art. 9 |
| group of undertakings | 企业集团 | Art. 4(19)。指控制企业及其受控企业。**单译"集团"略虚**——加"企业"二字法律意涵更准确 |
| identifiable | 可识别的 | "an identified or identifiable natural person" → "已识别或可识别的自然人" |
| integrity and confidentiality | 完整性与保密性 | Art. 5(1)(f)。处理原则之一——通过适当的技术和组织措施确保个人数据的安全 |
| international organisation | 国际组织 | Art. 4(26) |
| international transfer | 跨境传输 | Chapter V 通用。实务表达中优先于"国际传输" |
| joint controllers | 共同控制者 | Art. 26 |
| judicial remedy | 司法救济 | Art. 78（针对监管机构）、Art. 79（针对控制者 / 处理者）。**与 complaint（投诉）区分**——complaint 走行政程序，judicial remedy 走法院 |
| lawful / lawfulness | 合法 / 合法性 | Art. 5(1)(a) / Art. 6 |
| lead supervisory authority | 牵头监管机构 | Art. 56。**首选"牵头监管机构"**——一站式机制下更符合中文监管语境（参见国务院发改委、网信办相关文件）。亦有译"主导监管机构" |
| main establishment | 主要机构 / 主营业机构 | Art. 4(16)。在一站式机制和牵头监管机构判断中具关键意义 |
| legal obligation | 法律义务 | Art. 6(1)(c)。已用于 Art. 6 |
| legal persons | 法人 | Recital 14。与 natural persons 对照 |
| legitimate interests | 正当利益 | Art. 6(1)(f)。**首选"正当利益"**——`lawful` / `lawfulness` 已译"合法 / 合法性"，若再把 legitimate interests 译"合法利益"会弱化两者的法律差别。`legitimate interests` 是控制者或第三方追求的、需经利益衡量的正当利益。亦有学者译为"合法利益"，首次出现可写作"正当利益（legitimate interests，亦有译为合法利益）" |
| legitimate aim | 正当目的 | Art. 6(3) 末段比例原则审查："be proportionate to the legitimate aim pursued" → "与所追求的正当目的成比例"。**与 lawful 区分**——legitimate aim 强调目的本身是否经得起法律审查的正当性测试，而非仅仅在法律上不被禁止 |
| Legitimate Interests Assessment (LIA) | 正当利益评估 | Recital 47 / EDPB 工作文件。实务中可保留缩写 LIA。**Art. 6 中已写"合法利益评估"，需回头改** |
| Member State | 成员国 | 整部条例反复 |
| Member State law | 成员国法律 | Art. 6 |
| monitoring | 监测 | Art. 3(2)(b)。**不译"监控"**——监控有更强的负面色彩 |
| natural person | 自然人 | Art. 1 / 4(1)。已用于 Art. 1 |
| necessary | 必需 / 所必需 | "processing is necessary for X" → "为 X 所必需"。Art. 6 反复用 |
| official authority | 公权力 | Art. 6(1)(e)。"in the exercise of official authority" → "行使公权力" |
| Official Journal of the European Union | 《欧盟官方公报》 | 已在站点免责声明里使用 |
| one-stop shop (mechanism) | 一站式机制 | Art. 56 / Recital 127 |
| onward transfer | 后续传输 / 再传输 | Art. 44 / Chapter V 语境下数据从初始接收方向后续接收方继续传输。**不译"二次传输"**——onward 不限于第二次，可能是第三次或更后续 |
| personal data | 个人数据 | **核心术语**。Art. 4(1)。**不译"个人信息""个人资料"**——本站统一"个人数据"对齐欧盟用法 |
| personal data breach | 个人数据泄露 / 个人数据安全事件 | Art. 4(12)。中文常译"个人数据泄露"，但其范围**包括**：(1) 意外或非法毁损；(2) 丢失；(3) 更改；(4) 未经授权披露；(5) 未经授权访问。**不限于数据外流**——即使没有数据下载 / 转发，未经授权访问也构成 breach。与 `data leak`（数据外泄）区分 |
| principles relating to processing | 处理原则 | Art. 5 章节标题 |
| prior consultation | 事前咨询 | Art. 36。当 DPIA 显示处理活动有高风险且控制者无法降低时，应在处理前咨询监管机构 |
| processing | 处理（动词）/ 处理活动（名词）| **核心术语**。Art. 4(2)。"处理"作动词 vs. "处理活动"作名词更通顺 |
| processor | 处理者 | **核心术语**。Art. 4(8)。**不译"处理方""加工方"**。已用于 Art. 3 |
| profiling | 画像处理 | Art. 4(4)。**首次出现写"画像处理（profiling）"**——避免被理解成普通营销"用户画像"。简称语境后续可用"画像"。**不译"分析"** |
| pseudonymisation | 假名化 | Art. 4(5)。已用于 Art. 6 |
| public authority | 公共机关 / 公共机构 | Art. 6(1)。两译均可，**"公共机关"区别于 supervisory authority（监管机构）**——后者是数据保护监管专门机关，前者是泛指政府公权力主体。已用于 Art. 6 第 1 款续段 |
| public interest | 公共利益 | Art. 6(1)(e)。已用于 Art. 6 |
| purpose limitation | 目的限制 | Art. 5(1)(b) |
| recipient | 接收方 | Art. 4(9) |
| Records of Processing Activities (RoPA) | 处理活动记录 | Art. 30。控制者 / 处理者维护的处理活动正式登记，含目的、类别、接收方、第三国传输、保存期限、安全措施等。**与 `audit trail`（审计日志，技术操作流水）区分** |
| relevant and reasoned objection | 相关且有理由的异议 | Art. 4(24)。一致性机制下其他成员国监管机构对牵头监管机构决定提出的异议形式 |
| representative | 代表 / 欧盟代表 / 指定代表 | Art. 4(17) 定义条款用"代表"；**Art. 27 语境（境外控制者 / 处理者在欧盟内的代表）按上下文译"欧盟代表"或"指定代表"** |
| restriction of processing | 处理限制 | Art. 18。"the right to restriction" → "限制处理权" |
| right of access | 查阅权 / 访问权 | Art. 15。**法条标题建议译"查阅权"**——避免与系统访问权限（system access right）混淆。Art. 15 范围包括：(1) 确认是否在处理；(2) 访问其个人数据；(3) 获取处理目的、数据类别、接收方、保存期限等信息；(4) 取得数据副本。首次出现宜说明全部内容 |
| right to be forgotten | 被遗忘权 | Art. 17。亦称 right to erasure → 删除权 |
| right to data portability | 数据可携带权 | Art. 20 |
| right to erasure | 删除权 | Art. 17 同条款 |
| right to object | 反对权 | Art. 21 |
| right to rectification | 更正权 | Art. 16 |
| right to restriction | 限制处理权 | Art. 18 |
| safeguards | 保障措施 | Art. 6(4)(e) / Art. 46。**不译"保护措施"**——保障 vs 保护语义有差 |
| security of processing | 处理安全 | Art. 32。控制者 / 处理者应实施"适当的技术和组织措施"（TOMs）以确保处理安全（保密性、完整性、可用性、抗御性等）|
| special categories of personal data | 特殊类别个人数据 | Art. 9。原则上禁止处理，**除非**适用 Art. 9(2) 的 10 项例外（如明确同意、雇佣 / 社保 / 健康必需等）。包括：种族、政治观点、宗教信仰、工会、遗传数据、生物识别数据、健康数据、性生活 / 性取向 |
| Standard Contractual Clauses (SCC) | 标准合同条款 | Art. 46(2)(c)。首次出现写全称 |
| storage limitation | 存储限制 | Art. 5(1)(e) |
| supervisory authority | 监管机构 | **核心术语**。Art. 4(21) / Chapter VI。**不译"监管当局""监管部门"**——本站统一"机构" |
| system access right | 系统访问权限 | **与 Art. 15 `right of access` 区分** —— 后者是数据主体对其个人数据的查阅 / 访问权（GDPR 法定权利），前者是 IT 层面的账号权限（与 GDPR 无直接对应） |
| TEU (Treaty on European Union) | 《欧盟条约》 | 已用于 Art. 2(2)(b) "TEU Title V Chapter 2" → "《欧盟条约》第五编第二章" |
| third country | 第三国 | Art. 44。**不译"第三方国家""第三方"**——避免与 third party 混 |
| third party | 第三方 | Art. 4(10) |
| transfer (of data) | 传输 / 转移 | Art. 44 章节"transfers of personal data"。**法条标题首选"传输"**，解释性文本中"转移"可接受。**不译"转让"**——transfer of personal data 不是财产权转让 |
| transparency | 透明 | Art. 5(1)(a) |
| Union law | 欧盟法律 | 整部条例反复。已用于 Art. 2 |
| vital interests | 生命攸关利益 / 重大生命利益 | Art. 6(1)(d), Art. 49(1)(f)。**强调生命、身体或重大健康相关**——不宜泛化为普通"重大利益"，也不应译"核心利益"。须避免与 `important reasons of public interest`、`substantial public interest`、`compelling legitimate grounds` / `compelling legitimate interests` 混淆。**面向普通读者用"生命攸关利益"，学术文本可用"重大生命利益"**。**Art. 6 中已写"重大利益"，需回头改** |

---

## 经常出错 / 易混淆的特别提醒

| 区分 | 中文 | 注意 |
|---|---|---|
| `controller` vs `processor` | 控制者 / 处理者 | 控制者决定处理目的与方式；处理者代为执行。两者都不是"管理者" |
| `personal data` vs `personal information` | 个人数据 / 个人信息 | 中国《个人信息保护法》用"个人信息"，但本站对齐欧盟用"个人数据"。混用会让读者以为在引中国法 |
| `processing` vs `process` | 处理 / 处理过程 | 名词 processing 译"处理活动"，动词 process 译"处理"，名动同形时看上下文 |
| `consent` vs `agreement` | 同意 / 协议 | consent 是数据主体的法定意思表示，agreement 是合同。Art. 6(1)(a) 和 Art. 6(1)(b) 的核心区别 |
| `personal data breach` vs `data leak` | 个人数据泄露 / 数据外泄 | breach（Art. 4(12)）含 5 类（毁损 / 丢失 / 更改 / 未经授权披露 / 未经授权访问），data leak 仅指数据外流。**未授权访问也构成 breach**，即使没有数据外流 |
| `lawful` vs `legitimate` | 合法 / 正当 | `lawfulness` 译"合法性"（Art. 5/6 的合法性原则）；`legitimate interests` 译"正当利益"（Art. 6(1)(f) 平衡测试下的利益）；`legitimate aim` 译"正当目的"（Art. 6(3) 比例原则下的目的合法性审查）。两者法律内涵不同，须区分。**统一原则：legitimate → 正当；lawful → 合法** |
| `vital interests` vs `important reasons of public interest` vs `compelling legitimate grounds` | 生命攸关利益 / 重大公共利益 / 强制性正当理由 | vital 特指生命健康；important reasons of public interest 是公共利益层级；compelling legitimate grounds 是 Art. 21(1) 反对权下的强制性正当理由。**译法不能混** |
| `right of access` vs `system access right` | 查阅权（Art. 15）/ 系统访问权限（IT）| 法律权利 vs IT 概念。法条标题用"查阅权"避免误导 |
| `data protection by design` vs `at the design stage` | 通过设计实现的数据保护 / 在设计阶段 | by design 不限于设计阶段，要求贯穿系统架构与处理全程 |
| `monitor` vs `surveil` | 监测 / 监控 | Art. 3(2)(b) "monitoring of behaviour" → "行为监测"，避免"监控"的负面色彩 |
| `safeguard` vs `protection` vs `security` | 保障措施 / 保护 / 安全 | 三个不同概念：safeguard 是法律层面的保障设计，protection 是宽泛保护，security 是技术安全 |
| `derogation` vs `exception` | 减损 / 例外 | derogation 是从一般规则的偏离（成员国法律或集体协议下），exception 更宽泛。Art. 49 用 derogation |
| `establishment` vs `branch` vs `main establishment` | 机构 / 分支 / 主要机构 | establishment 是有稳定安排的实体存在，不是单纯注册地址，但也含物理活动场所；main establishment 在一站式机制下决定主导监管机构 |
| `transfer` vs `onward transfer` vs `international transfer` | 传输 / 后续传输 / 跨境传输 | transfer 是基础概念；onward 是从初始接收方再向第三方传；international 强调跨境（不限于欧盟外）|
| `audit trail` vs `Records of Processing Activities (RoPA)` | 审计日志 / 处理活动记录 | audit trail 是技术层操作流水（谁何时改了什么）；RoPA 是 Art. 30 法定的合规登记（处理活动的正式清单）。两者实务里都做但目的、责任主体、维护周期都不同 |

---

## 数字 / 引用格式约定

- **条文引用**：英文 `Article 6(1)(a)` / 中文 `第 6 条第 1 款第（a）项`
  - 注意中文的"项"对应英文的"point" / "letter"
  - 中文不用 `(a)` 而用 `（a）`（全角括号），与中文标点规则一致
- **序言引用**：英文 `Recital 47` / 中文 `序言第 47 段`（已用于 Art. 1 脚注）
  - 不译"前言""导言""考虑事项"，统一"序言"
- **金额 / 期限**：保留欧元 `EUR` 不另译；天 / 周 / 月用阿拉伯数字
- **数据主体的代词**：英文 "his or her" → 中文 "其"。**不译"他/她"或"他或她"**——中文用"其"更简洁

---

## 当前条文里已落地的翻译

### v1.0 baseline（Art. 1 / 2 / 3 / 6 现状）

这些译法在已发布条文里实际使用。**标 ⚠️ 的需要在下一次 commit 时回头修正**为 v1.1 标准（见下文）：

- `protection of natural persons` → 保护自然人 ✓
- `processing of personal data` → 个人数据处理 ✓
- `free movement of personal data` → 个人数据自由流动 ✓
- `controller` → 控制者 ✓
- `processor` → 处理者 ✓
- `data subject` → 数据主体 ✓
- `establishment` → 机构 ✓
- `automated means` → 自动化方式 ✓
- `filing system` → ~~档案系统~~ → **结构化档案系统** ✓（v1.2 已应用，Art. 2）
- `Union law` → 欧盟法律 ✓
- `competent authorities` → 主管机关 ✓（v1.2 加备注：刑事执法语境）
- `prevention, investigation, detection or prosecution of criminal offences` → 预防、调查、侦查或起诉刑事犯罪 ✓
- `offering of goods or services` → 提供货物或服务 ✓
- `monitoring of behaviour` → 行为监测 ✓
- `lawfulness of processing` → 处理的合法性 ✓
- `consent` → 同意 ✓
- `legitimate interests` → ~~合法利益~~ → **正当利益** ✓（v1.1 已应用）
- `Legitimate Interests Assessment (LIA)` → ~~合法利益评估~~ → **正当利益评估** ✓（v1.1 已应用）
- `vital interests` → ~~重大利益~~ → **生命攸关利益** ✓（v1.1 已应用）
- `public interest` → 公共利益 ✓
- `legal obligation` → 法律义务 ✓
- `Member State law` → 成员国法律 ✓
- `public authorities` → 公共机关 ✓
- `safeguards` → 保障措施 ✓
- `encryption` → 加密 ✓
- `pseudonymisation` → 假名化 ✓

### v1.1 修订（2026-04-28 上午，Frank legal review 第一轮）

下列三处由原译修订，原因见主表对应行：

| 英文 | v1.0 译法 | v1.1 译法 | 修订原因 |
|---|---|---|---|
| `legitimate interests` | 合法利益 | **正当利益** | 与 `lawfulness`（合法/合法性）区分，避免弱化 Art. 6(1)(f) 利益衡量的法律内涵 |
| `Legitimate Interests Assessment (LIA)` | 合法利益评估 | **正当利益评估** | 与上同步 |
| `vital interests` | 重大利益 | **生命攸关利益** / 重大生命利益 | 强调生命、身体、重大健康，避免与 important / substantial public interest、compelling legitimate grounds 等概念混淆 |

### v1.2 修订（2026-04-28 下午，Frank legal review 第二轮）

| 英文 | v1.1 译法 | v1.2 译法 | 修订原因 |
|---|---|---|---|
| `lead supervisory authority` | 主导监管机构 / 牵头监管机构 | **牵头监管机构** | 一站式机制下中文监管语境更自然（参见网信办、发改委文件用法） |
| `group of undertakings` | 集团 | **企业集团** | Art. 4(19) 指控制企业及受其控制的企业，单译"集团"略虚 |
| `filing system` | 档案系统 | **结构化档案系统** / 有序档案系统 | Art. 4(6) 重点是"按特定标准可检索"，单译"档案系统"略虚 |
| `profiling` | 画像 | **画像处理**（首次）→ 画像（后续）| 避免被理解成普通营销"用户画像" |
| `automated decision-making` | 自动化决策 | ~~自动化个人决策~~ → **撤回（v1.3）**，恢复"自动化决策" | v1.2 改为"自动化个人决策"以贴近原文 `automated individual decision-making`，但 v1.3 撤回。"自动化决策"已含 Art. 22 立法重点（针对个人）|
| `representative` | 代表 | **代表 / 欧盟代表 / 指定代表** | Art. 27 语境（境外主体在欧盟的代表）按上下文选择更具体译法 |
| `competent authorities` | 主管机关 | 主管机关（**加备注**：刑事执法）| Art. 2(2)(d) 特指刑事执法相关主管机关，与 supervisory authority（监管机构）不同 |
| `public authority` | 公共机关 | 公共机关 / 公共机构（**加备注**）| 与 supervisory authority（数据保护监管专门机关）区别 |

### v1.3 新增 18 条 + 1 条撤回 + 1 条扩展（2026-04-28 晚，Frank 内容补全）

扩展条目（与 v1.1 的 legitimate interests 同一原则）：

| 英文 | 旧译 | 新译 | 修订原因 | 影响条文 |
|---|---|---|---|---|
| `legitimate aim` | ~~合法目的~~ | **正当目的** | 与 v1.1 的 `legitimate interests → 正当利益` 一脉，`legitimate` 统一译"正当"，`lawful` 才译"合法"。Art. 6(3) 末段比例原则审查里的"the legitimate aim pursued" → "所追求的正当目的" | Art. 6 已应用 |

新增条目（按字母序）：

| 英文 | 中文 | 主表位置 |
|---|---|---|
| accountability | 问责制 / 责任落实原则 | A 段开头 |
| accuracy | 准确性 | A 段 |
| administrative fines | 行政罚款 | A 段 |
| appropriate technical and organisational measures (TOMs) | 适当的技术和组织措施 | A 段 |
| biometric data | 生物识别数据 | B 段 |
| certification mechanism | 认证机制 | C 段 |
| codes of conduct | 行为准则 | C 段 |
| compensation and liability | 赔偿与责任 | C 段 |
| complaint | 投诉 | C 段 |
| consistency mechanism | 一致性机制 | C 段 |
| criminal convictions and offences | 刑事定罪和犯罪相关数据 | C 段 |
| data concerning health | 健康相关数据 / 健康数据 | D 段 |
| integrity and confidentiality | 完整性与保密性 | I 段 |
| judicial remedy | 司法救济 | J 段 |
| prior consultation | 事前咨询 | P 段 |
| relevant and reasoned objection | 相关且有理由的异议 | R 段 |
| security of processing | 处理安全 | S 段 |
| special categories of personal data | 特殊类别个人数据 | S 段 |

撤回（v1.2 → v1.3）：

| 英文 | 撤回前（v1.2）| 撤回后（v1.3） | 原因 |
|---|---|---|---|
| `automated decision-making` | 自动化个人决策 | **自动化决策** | "自动化决策"已含 Art. 22 立法重点，加"个人"反而拗口 |

**回头修订工作清单**（2026-04-28 已全部完成）：

v1.1 应用：
- ✓ `articles/6.md` 内 `合法利益` 已全部替换为 `正当利益`（含正文 + 脚注 `[^合法利益评估]` → `[^正当利益评估]` 标签和内容；脚注里保留"亦有学者译为'合法利益评估'"作为译法说明）
- ✓ `articles/6.md` 内 `重大利益` 已替换为 `生命攸关利益`
- ✓ Art. 1 / 2 / 3 经检查无上述 v1.1 术语，无需改动

v1.2 应用：
- ✓ `articles/2.md` 内 `档案系统` 已替换为 `结构化档案系统`（Abs. 1）
- ✓ Art. 1 / 3 / 6 经检查无 v1.2 主表新规术语（profiling / automated decision-making / lead SA / group of undertakings / representative 都尚未在条文中出现）
- ✓ Art. 2 现使用 `主管机关` 译法符合 v1.2 加注备注后规则

commit message 建议：`Apply glossary v1.2: filing system → 结构化档案系统 (Art. 2); update 8 entries with 牵头监管机构 / 企业集团 / 画像处理 / 自动化个人决策 / 欧盟代表 etc.`

---

## 维护说明

### 重要事实

**GDPR 没有欧盟官方中文版**。EUR-Lex 只发布 24 种欧盟官方语言（保加利亚、捷克、丹麦…芬兰、瑞典），中文不在内。所有中文版都是非官方的，区别只在权威度。

### 写新条文时的查证流程

| 步骤 | 资源 | 作用 |
|---|---|---|
| 1. 条款级英中对照 | [gdpr-text.com](https://gdpr-text.com/) | 最实用的工作工具——写每条时打开它中英文对照看 |
| 2. 学术权威裁量 | [丁晓东译本（知产力）](https://www.zhichanli.com/p/856573259) | 中国人民大学法学院副教授、未来法治研究院副院长；国内 GDPR 学术圈最常引用的中文版 |
| 3. 繁体交叉验证 | [香港个人资料私隐专员公署 PCPD](https://www.pcpd.org.hk/tc_chi/data_privacy_law/eu/eu.html) | 繁体中文权威介绍。注意 PCPD 译"通用數據**保障**條例"，本站用"保护条例"，差异保留 |
| 4. 警惕的来源 | 知乎 / CSDN 民间译本 | 质量参差，可对照不可全信 |

### 写新条文的标准流程

1. 打开 gdpr-text.com 把英文 + 中文条文摆出来
2. 写自己的双语条文，遇到术语先查本表
3. 本表没有的术语 → 查丁晓东译本 → 选定译法
4. **不要**直接照搬丁晓东译本——本站定位是**对齐欧盟法律语境的非官方参考**，需要二次校对（特别是与 PIPL 术语的潜在混淆）
5. 译法落地后**立刻加进本表**：写在合适字母位置，加备注 + 第一次出现的条文号
6. `git commit` 把 glossary 改动跟条文改动**一起 push**

### 不取 PIPL 术语的原因

中国《个人信息保护法》(PIPL) 与 GDPR 在术语上有微妙差异：

| 概念 | GDPR (本站) | PIPL | 后果 |
|---|---|---|---|
| 数据本身 | 个人数据 | 个人信息 | 中国读者看 GDPR 写的是"个人信息"会以为在引中国法 |
| 处理一方 | 控制者 / 处理者 | 处理者 / 受托方 | PIPL 的"处理者"对应 GDPR 的"控制者"，不是"处理者"！照搬 PIPL 会反义 |
| 数据主体权利结构 | Chapter III 8 项权利 | 第四章 12 项权利 | 权利项分类不同，不能一一对应 |

**统一原则：本站术语对齐欧盟法律语境，与 PIPL 译法刻意区分**。如果某术语在两个体系下完全相同（如"加密""假名化"），可以共用；如果有歧义，优先选 GDPR 学界主流译法（典型代表是丁晓东译本）。

### 修订已发布条文的术语时

1. 全站搜索旧译（VS Code Cmd+Shift+F）
2. 替换为新译
3. 本表对应行更新备注（如 "v1.1 改：原译 X → 现译 Y，理由 ..."）
4. **不要**回头改已发布条文的 frontmatter `last_reviewed` 日期，除非翻译大幅修订
5. commit message 写清楚 "Glossary v1.x: rename X to Y across N articles"

---

## 待补充的条目（占位提醒）

下列术语本站还没用到，但写到 Chapter II-VIII 时会大量出现，先占位提醒自己别现编：

- `aggregate data` —— 聚合数据（GDPR 不直接定义，但常在匿名化 / 去识别化讨论中出现）
- `algorithm` / `algorithmic` —— 算法 / 算法的（与 profiling / automated decision-making 配套）
- `Chief Data Officer` —— 首席数据官，与 DPO（数据保护官）区分清楚
- `data export` / `data import` —— Art. 44-50 跨境语境，可译"数据出境 / 数据入境"
- `information society services` —— 信息社会服务（Art. 8(1) 儿童同意条款）
- `mutual assistance` —— 相互协助（Art. 61，监管机构间）
- `Subject Access Request (SAR)` —— 数据主体查阅请求（实务术语，对应 Art. 15 行使方式）
- `targeted advertising` —— 定向广告（Recitals 频繁出现）

已入主表（2026-04-28 各版本）：
- ✓ `audit trail` → 审计日志（v1.1）
- ✓ `Records of Processing Activities (RoPA)` → 处理活动记录（v1.1）
- ✓ `accountability`、`accuracy`、`administrative fines`、`appropriate technical and organisational measures (TOMs)`、`biometric data`、`certification mechanism`、`codes of conduct`、`compensation and liability`、`complaint`、`consistency mechanism`、`criminal convictions and offences`、`data concerning health`、`integrity and confidentiality`、`judicial remedy`、`prior consultation`、`relevant and reasoned objection`、`security of processing`、`special categories of personal data`（v1.3）

写到对应条文时把剩余术语的最终翻译填进上面的主表。
