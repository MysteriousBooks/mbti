import { useState } from 'react'
import { ALL_KINDS, placeDoodles, poolOf } from '../../lib/doodles'
import type { DoodlePlacement } from '../../lib/doodles'
import { FIXTURE_QUESTIONS } from '../fixtures'
import { DoodleLayer } from '../../components/DoodleLayer'
import { QuizPanel, ReplayButton } from '../QuizPanel'

// E · 完卷庆祝：平时克制（每题 3 只维度主题涂鸦），
// 答完最后一题时全员涂鸦波浪式庆祝登场 + 黄底庆祝卡。
// 演示「结果页涂鸦庆祝联动」的高潮设计。
export function VariantE() {
  const qs = FIXTURE_QUESTIONS
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<Record<number, 0 | 1>>({})
  const [items, setItems] = useState<DoodlePlacement[]>(() =>
    qs.length ? placeDoodles(poolOf(qs[0].dimensionId), 3) : [],
  )
  const [celebration, setCelebration] = useState<DoodlePlacement[]>([])
  const [celebrating, setCelebrating] = useState(false)

  const choose = (oi: 0 | 1) => {
    setPicked(p => ({ ...p, [idx]: oi }))
    const next = idx + 1
    if (next >= qs.length) {
      setCelebration(placeDoodles(ALL_KINDS, ALL_KINDS.length))
      setCelebrating(true)
      return
    }
    setItems(placeDoodles(poolOf(qs[next].dimensionId), 3))
    setIdx(next)
  }
  const replay = () => {
    setIdx(0)
    setPicked({})
    setCelebrating(false)
    setItems(qs.length ? placeDoodles(poolOf(qs[0].dimensionId), 3) : [])
  }

  if (!qs.length) return <p className="dl-empty">题库加载失败，无法演示。</p>
  if (celebrating) {
    return (
      <>
        <DoodleLayer items={celebration} />
        <div className="dl-celebrate-card">
          <strong>答完啦！</strong>
          <p>涂鸦们为你欢呼——正式版中这里将过渡到结果页，并按你的类型码送上专属涂鸦庆祝。</p>
        </div>
        <ReplayButton onReplay={replay} />
      </>
    )
  }
  return (
    <>
      <DoodleLayer items={items} />
      <QuizPanel q={qs[idx]} index={idx} total={qs.length} selected={picked[idx]} onChoose={choose} />
      <ReplayButton onReplay={replay} />
    </>
  )
}
