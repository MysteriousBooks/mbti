import { useRef, useState } from 'react'
import { placeDoodles, poolOf } from '../../lib/doodles'
import type { DoodlePlacement } from '../../lib/doodles'
import { FIXTURE_QUESTIONS } from '../fixtures'
import { DoodleLayer } from '../../components/DoodleLayer'
import { QuizPanel, ReplayButton } from '../QuizPanel'

interface TraceLayer {
  id: number
  items: DoodlePlacement[]
}

// C · 累积画卷：答过的题的涂鸦以淡痕留在纸上（保留最近 3 层），新题涂鸦全彩登场。
// 答题过程变成"把一张纸画满"，呼应首页「拿起马克笔，画下你的类型」。
export function VariantC() {
  const qs = FIXTURE_QUESTIONS
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<Record<number, 0 | 1>>({})
  const [layers, setLayers] = useState<TraceLayer[]>(() =>
    qs.length ? [{ id: 0, items: placeDoodles(poolOf(qs[0].dimensionId), 4) }] : [],
  )
  const layerSeq = useRef(1)

  const choose = (oi: 0 | 1) => {
    setPicked(p => ({ ...p, [idx]: oi }))
    const next = Math.min(qs.length - 1, idx + 1)
    const fresh: TraceLayer = { id: layerSeq.current++, items: placeDoodles(poolOf(qs[next].dimensionId), 4) }
    setLayers(ls => {
      const kept = [...ls, fresh].slice(-3)
      // 旧层转淡痕：仅改 faded 标记（key 不变），由 CSS transition 平滑淡出
      return kept.map((l, i) =>
        i === kept.length - 1 ? l : { ...l, items: l.items.map(it => ({ ...it, faded: true })) },
      )
    })
    setIdx(next)
  }
  const replay = () => {
    setIdx(0)
    setPicked({})
    setLayers(qs.length ? [{ id: layerSeq.current++, items: placeDoodles(poolOf(qs[0].dimensionId), 4) }] : [])
  }

  if (!qs.length) return <p className="dl-empty">题库加载失败，无法演示。</p>
  return (
    <>
      {layers.map(l => <DoodleLayer key={l.id} items={l.items} />)}
      <QuizPanel q={qs[idx]} index={idx} total={qs.length} selected={picked[idx]} onChoose={choose} />
      <ReplayButton onReplay={replay} />
    </>
  )
}
