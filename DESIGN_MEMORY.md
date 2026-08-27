# Design Memory

> 2026-08-27 MBTI 三屏重设计（Design Lab Variant F 定稿）沉淀的视觉语言与交互偏好。

## Brand Tone
- **Adjectives:** 俏皮趣味、精致质感、结果有冲击力
- **定稿方向：** 纸面手绘 × 马克笔（浅色纸面 + 荧光笔划重点 + 硬阴影贴纸卡片）
- **Avoid:** 深色底 + 发光阴影的"数字风"（第一轮探索后明确否决）；均匀无层次的模板化卡片

## Layout & Spacing
- **Density:** comfortable
- **Content max-width:** 结果区 420px、答题选项 340px、量表卡列表 320px
- **Corner radius:** 卡片 6px 22px 6px 22px（斜切圆角）、翻面卡 16px、标签/按钮 999px
- **Shadows:** 硬阴影（无模糊偏移阴影）：`3px 4px 0 oklch(28% 0.03 60 / 0.85)`，hover 加深加大

## Typography
- 系统字体栈（system-ui + PingFang SC / Microsoft YaHei），无 webfont
- 类型码：逐格分span渲染，2.5rem/800，每格交替 ±3-4° 歪斜、60ms stagger 弹出
- Kicker 小标：0.72rem、letter-spacing 0.22em、大写

## Color
- **纸底：** oklch(96% 0.02 90)（奶油纸）、次级 oklch(93% 0.03 85)
- **墨色文字：** oklch(28% 0.03 60)、弱化 oklch(50% 0.02 60)
- **马克笔主色：** 红 oklch(62% 0.19 25)（主按钮/类型码字）、蓝 oklch(58% 0.15 250)（选中态/提示）、黄 oklch(85% 0.14 95)（荧光划重点/翻面背面）、粉 oklch(70% 0.16 340)（doodle）
- **语义：** 颜色即语义——红=行动、蓝=信息/选中、黄=强调底色

## Interaction Patterns
- **渐进展开（用户明确偏好）：** 结果页维度是 3D 翻面卡（rotateY 180°，450ms ease-out），正面简略（维度条+百分比），背面详细解读；背面内容溢出用固定卡高 + `overflow: auto` 解决
- **升级版 5 维度：** 第 5 张"坚断/波动"卡跨全宽（grid-column: 1/-1），前 4 张 2 列；类型码 5 位自动插连字符（ESTJ-A），加"坚断"蓝色角标
- **反馈动效：** hover 位移 -1px,-2px + 阴影加深；进格动画 350ms cubic-bezier(0.16, 1, 0.3, 1)；尊重 prefers-reduced-motion
- **双量表切换：** 结果页"换套量表"直接切换 classic/plus 并回答题页，底部有当前量表提示

## Accessibility Rules
- 翻面卡是 `<button>` + aria-pressed + aria-label（含状态描述"点击翻面/翻回"）
- 类型码分格渲染用 role="img" + aria-label 提供完整码（连字符格式）
- focus-visible 2.5px 蓝描边；触控目标 ≥44px

## Repo Conventions
- 原生 CSS 变量（src/index.css :root），无 Tailwind/UI 库
- 组件在 src/components/，ui/ 下原子组件（Button/Card/ProgressBar）
- 测试：vitest + RTL，断言用可访问角色/文本（分格渲染的文本要用 role+aria-label 断言）
- 数据 zod 校验：src/data/*.json + schemas.ts；升级版第 5 维度 pole 为 A/T（坚断/躁动）

## 2026-08-27 居中态组件（Result·Variant D 定稿）
- **ScoreResult.candidates:** 居中态结构化候选列表（可选字段），确定态 undefined；scoring.ts 的 mergeTypeParts 不再拼长 summary
- **x 类型码格：** 虚线边框 + 灰墨色 + `var(--color-paper-2)` 底色 + 小字号（区别于确定字母的实心贴纸格）；配合 `.f-x-hint` 提示文案「? = 两极倾向接近（居中）」
- **候选筛选器：** 按钮 pill（`border-radius: 999px`）+ `aria-pressed`，选中态蓝色马克笔底；点选切换用 `key={cur.code}` 触发 f-pop 弹入
- **详情面板：** 黄底马克笔高亮（`var(--color-marker-yellow)`）+ 硬阴影大号 + 斜切圆角；名称 → 3 条特质 → 完整 summary
- **间距基准：** f-traits gap 10px / margin-top 24px；result-actions gap 12px / margin-top var(--space-3)

---
*Updated by Design Variations plugin (design-and-refine) 2026-08-27*