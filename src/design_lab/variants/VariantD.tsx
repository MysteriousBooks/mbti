import { useEffect, useRef, useState } from 'react'
import { ALL_KINDS, placeDoodles } from '../../lib/doodles'
import type { DoodlePlacement } from '../../lib/doodles'
import { FIXTURE_QUESTIONS } from '../fixtures'
import { DoodleLayer } from '../../components/DoodleLayer'
import { QuizPanel, ReplayButton } from '../QuizPanel'

// D · 即时回响：选中选项的瞬间，当前涂鸦先集体兴奋跳动；
// 随后新涂鸦弹入，且数量随答题进度从 3 只涨到 7 只——越答越热闹。
export function VariantD() {
  const qs = FIXTURE_QUESTIONS
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<Record<number, 0 | 1>>({})
  const [items, setItems] = useState<DoodlePlacement[]>(() =>
    qs.length ? placeDoodles(ALL_KINDS, 3) : [],
  )
  // 交替 a/b class 让既有涂鸦重放跳动动画
  const [pulse, setPulse] = useState<'is-pulse-a' | 'is-pulse-b'>('is-pulse-a')
  const [busy, setBusy] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
  }, [])

  const choose = (oi: 0 | 1) => {
    if (busy) return
    setPicked(p => ({ ...p, [idx]: oi }))
    setPulse(c => (c === 'is-pulse-a' ? 'is-pulse-b' : 'is-pulse-a'))
    setBusy(true)
    const next = Math.min(qs.length - 1, idx + 1)
    timer.current = window.setTimeout(() => {
      const progress = qs.length > 1 ? next / (qs.length - 1) : 1
      setItems(placeDoodles(ALL_KINDS, 3 + Math.round(progress * 4)))
      setIdx(next)
      setBusy(false)
    }, 420)
  }
  const replay = () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    setIdx(0)
    setPicked({})
    setBusy(false)
    setItems(placeDoodles(ALL_KINDS, 3))
  }

  if (!qs.length) return <p className="dl-empty">题库加载失败，无法演示。</p>
  return (
    <>
      <DoodleLayer items={items} pulseClass={pulse} />
      <QuizPanel q={qs[idx]} index={idx} total={qs.length} selected={picked[idx]} onChoose={choose} />
      <ReplayButton onReplay={replay} />
    </>
  )
}
