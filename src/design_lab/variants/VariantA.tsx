import { useState } from 'react'
import { ALL_KINDS, placeDoodles } from '../../lib/doodles'
import type { DoodlePlacement } from '../../lib/doodles'
import { FIXTURE_QUESTIONS } from '../fixtures'
import { DoodleLayer } from '../../components/DoodleLayer'
import { QuizPanel, ReplayButton } from '../QuizPanel'

// A · 换页纸：每答一题，全池涂鸦随机抽 6 种、位置重排、弹跳登场
export function VariantA() {
  const qs = FIXTURE_QUESTIONS
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<Record<number, 0 | 1>>({})
  const [items, setItems] = useState<DoodlePlacement[]>(() =>
    qs.length ? placeDoodles(ALL_KINDS, 6) : [],
  )

  const deal = () => {
    setItems(placeDoodles(ALL_KINDS, 6))
  }
  const choose = (oi: 0 | 1) => {
    setPicked(p => ({ ...p, [idx]: oi }))
    deal()
    setIdx(i => Math.min(qs.length - 1, i + 1))
  }
  const replay = () => {
    setIdx(0)
    setPicked({})
    deal()
  }

  if (!qs.length) return <p className="dl-empty">题库加载失败，无法演示。</p>
  return (
    <>
      <DoodleLayer items={items} />
      <QuizPanel q={qs[idx]} index={idx} total={qs.length} selected={picked[idx]} onChoose={choose} />
      <ReplayButton onReplay={replay} />
    </>
  )
}
