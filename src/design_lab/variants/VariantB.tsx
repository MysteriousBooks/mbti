import { useState } from 'react'
import { placeDoodles, poolOf } from '../../lib/doodles'
import type { DoodlePlacement } from '../../lib/doodles'
import { DIM_NAME, FIXTURE_QUESTIONS } from '../fixtures'
import { DoodleLayer } from '../../components/DoodleLayer'
import { QuizPanel, ReplayButton } from '../QuizPanel'

// B · 维度画笔：涂鸦按维度主题化——题目属于哪个维度，背景就画哪个主题的涂鸦
export function VariantB() {
  const qs = FIXTURE_QUESTIONS
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<Record<number, 0 | 1>>({})
  const [items, setItems] = useState<DoodlePlacement[]>(() =>
    qs.length ? placeDoodles(poolOf(qs[0].dimensionId), 5) : [],
  )

  const choose = (oi: 0 | 1) => {
    setPicked(p => ({ ...p, [idx]: oi }))
    const next = Math.min(qs.length - 1, idx + 1)
    setItems(placeDoodles(poolOf(qs[next].dimensionId), 5))
    setIdx(next)
  }
  const replay = () => {
    setIdx(0)
    setPicked({})
    setItems(qs.length ? placeDoodles(poolOf(qs[0].dimensionId), 5) : [])
  }

  if (!qs.length) return <p className="dl-empty">题库加载失败，无法演示。</p>
  const q = qs[idx]
  return (
    <>
      <DoodleLayer items={items} />
      <QuizPanel
        q={q}
        dimName={DIM_NAME[q.dimensionId]}
        index={idx}
        total={qs.length}
        selected={picked[idx]}
        onChoose={choose}
      />
      <ReplayButton onReplay={replay} />
    </>
  )
}
