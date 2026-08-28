import { useEffect } from 'react'
import './lab.css'
import { FeedbackOverlay } from './FeedbackOverlay'
import { VariantA } from './variants/VariantA'
import { VariantB } from './variants/VariantB'
import { VariantC } from './variants/VariantC'
import { VariantD } from './variants/VariantD'
import { VariantE } from './variants/VariantE'

const VARIANTS = [
  {
    id: 'A',
    title: 'A · 换页纸',
    rationale: '每答一题整套涂鸦随机洗牌——最直白的「每题翻一页新纸」',
    notes: (
      <>重点感受：<strong>随机洗牌</strong>的节奏感。全池 67 种涂鸦随机抽 6 种、换位置弹跳登场。旧涂鸦直接让位（正式实现建议补一个淡出退场）。</>
    ),
    Component: VariantA,
  },
  {
    id: 'B',
    title: 'B · 维度画笔',
    rationale: '涂鸦按维度主题化——题目在问哪个维度，背景就画哪个主题',
    notes: (
      <>重点感受：<strong>语义关联</strong>。E/I 题是对话气泡、火苗、笑脸、气球；S/N 题是月亮、星球、彩虹、流星；T/F 题是信封、小猫、蝴蝶、礼物；J/P 题是皇冠、钻石、雪花、奖杯。左上角蓝色徽章提示当前维度。</>
    ),
    Component: VariantB,
  },
  {
    id: 'C',
    title: 'C · 累积画卷',
    rationale: '答过的题的涂鸦以淡痕留在纸上，越答越满',
    notes: (
      <>重点感受：<strong>过程感</strong>。答题变成「把一张纸画满」，呼应首页文案「拿起马克笔，画下你的类型」。演示保留最近 3 层，正式实现建议随进度做透明度衰减曲线。</>
    ),
    Component: VariantC,
  },
  {
    id: 'D',
    title: 'D · 即时回响',
    rationale: '选中瞬间涂鸦先兴奋跳动，新涂鸦随进度越变越多',
    notes: (
      <>重点感受：<strong>即时反馈</strong>。点选项的一刻现有涂鸦集体跳一下，随后换班弹入；数量从 3 只涨到 7 只，营造「越答越热闹」的强度曲线。</>
    ),
    Component: VariantD,
  },
  {
    id: 'E',
    title: 'E · 完卷庆祝',
    rationale: '平时克制，答完最后一题全员涂鸦庆祝登场',
    notes: (
      <>重点感受：<strong>仪式感高潮</strong>。答题过程每题只有 3 只主题涂鸦；答完最后一题，全员涂鸦波浪式弹入 + 黄底庆祝卡——这是「结果页庆祝联动」的预演。请答满 8 题触发。</>
    ),
    Component: VariantE,
  },
] as const

export function DesignLab() {
  // Lab 期间压制 body 的全局静态涂鸦，离开时恢复
  useEffect(() => {
    document.body.classList.add('dl-suppress')
    return () => document.body.classList.remove('dl-suppress')
  }, [])

  return (
    <div className="dl-root">
      <header className="dl-head">
        <h1>Design Lab · 答题页涂鸦变化机制</h1>
        <p>5 个变体 × 同一套 8 道真实题目（不记分）。点选项卡片作答，感受背景涂鸦如何变化；每个变体右下角可「重玩」。</p>
        <div className="dl-brief">
          <strong>需求：</strong>每答一题进入下一题时背景涂鸦变化——随机洗牌 × 维度主题化 × 累积画卷组合，动效为弹跳登场，结果页做涂鸦庆祝联动。<br />
          <strong>反馈：</strong>点右下角「💬 Add Feedback」进入点评模式，点击任意元素留言；全部提交后把复制的文本粘回终端即可。
        </div>
      </header>
      <main className="dl-grid">
        {VARIANTS.map(v => (
          <section key={v.id} className="dl-cell" data-variant={v.id}>
            <div className="dl-cell-head">
              <h2>{v.title}</h2>
              <p>{v.rationale}</p>
            </div>
            <div className="dl-stage">
              <v.Component />
            </div>
            <p className="dl-notes">{v.notes}</p>
          </section>
        ))}
      </main>
      <FeedbackOverlay targetName="QuizDoodles" />
    </div>
  )
}
