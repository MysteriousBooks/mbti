import { useState, useEffect, useCallback, useRef } from 'react'
import type { Scale } from '../data/schemas'
import { Card } from './ui/Card'
import { ProgressBar } from './ui/ProgressBar'
import { Button } from './ui/Button'
import { DoodleLayer } from './DoodleLayer'
import { placeDoodles, poolOf, doodleCountFor } from '../lib/doodles'
import type { DoodlePlacement } from '../lib/doodles'

export function Quiz({ scale, answers, onAnswer, onComplete }: {
  scale: Scale
  answers: Record<string, 0 | 1>
  onAnswer: (qid: string, optionIndex: 0 | 1) => void
  onComplete: () => void
}) {
  const total = scale.questions.length
  const [idx, setIdx] = useState(() => {
    const firstUnanswered = scale.questions.findIndex(q => answers[q.id] === undefined)
    return firstUnanswered === -1 ? 0 : firstUnanswered
  })
  // idxRef 让键盘事件处理器始终读到最新索引，避免 stale closure
  const idxRef = useRef(idx)
  useEffect(() => { idxRef.current = idx }, [idx])
  const q = scale.questions[idx]

  // 涂鸦随题重画：新 id 强制重建 DOM，重放弹跳入场动画
  const [doodles, setDoodles] = useState<DoodlePlacement[]>([])
  // 答题页接管背景：压制 body 全局静态涂鸦（保留画纸纹理），卸载时恢复
  useEffect(() => {
    document.body.classList.add('quiz-doodles-live')
    return () => document.body.classList.remove('quiz-doodles-live')
  }, [])
  useEffect(() => {
    const cur = scale.questions[idx]
    // 数量随视口面积伸缩：重画时机只在切题（resize 不重画，位置本就是百分比坐标）
    if (cur) setDoodles(placeDoodles(poolOf(cur.dimensionId), doodleCountFor(window.innerWidth, window.innerHeight)))
  }, [idx, scale.questions])

  const choose = useCallback((optionIndex: 0 | 1) => {
    const cur = idxRef.current
    const curQ = scale.questions[cur]
    if (!curQ) return
    onAnswer(curQ.id, optionIndex)
    if (cur + 1 >= total) onComplete()
    else setIdx(i => i + 1)
  }, [scale, total, onAnswer, onComplete])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === '1') choose(0)
      else if (e.key === '2') choose(1)
      else if (e.key === 'ArrowRight') {
        const curQ = scale.questions[idxRef.current]
        if (curQ && answers[curQ.id] !== undefined) setIdx(i => Math.min(total - 1, i + 1))
      }
      else if (e.key === 'ArrowLeft' || e.key === 'Backspace') setIdx(i => Math.max(0, i - 1))
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [choose, answers, scale, total])

  return (
    <main className="screen quiz f-quiz">
      <DoodleLayer items={doodles} />
      <div className="quiz-top f-quiz-top">
        <Button variant="ghost" onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}>上一题</Button>
        <span className="quiz-progress-label f-count">第 {idx + 1} / {total} 题</span>
      </div>
      <ProgressBar value={idx + 1} max={total} />
      <h2 className="quiz-text f-question">{q.text}</h2>
      <div className="quiz-options f-options">
        {q.options.map((o, i) => (
          <Card key={i} selected={answers[q.id] === i} onClick={() => choose(i as 0 | 1)}>
            <span className="quiz-option-key f-key">{i === 0 ? '1' : '2'}</span>
            <span>{o.text}</span>
          </Card>
        ))}
      </div>
    </main>
  )
}