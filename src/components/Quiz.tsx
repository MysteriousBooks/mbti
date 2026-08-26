import { useState, useEffect, useCallback, useRef } from 'react'
import type { Scale } from '../data/schemas'
import { Card } from './ui/Card'
import { ProgressBar } from './ui/ProgressBar'
import { Button } from './ui/Button'

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
    <main className="screen quiz">
      <div className="quiz-top">
        <Button variant="ghost" onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}>上一题</Button>
        <span className="quiz-progress-label">第 {idx + 1} / {total} 题</span>
      </div>
      <ProgressBar value={idx + 1} max={total} />
      <h2 className="quiz-text">{q.text}</h2>
      <div className="quiz-options">
        {q.options.map((o, i) => (
          <Card key={i} selected={answers[q.id] === i} onClick={() => choose(i as 0 | 1)}>
            <span className="quiz-option-key">{i === 0 ? '1' : '2'}</span>
            <span>{o.text}</span>
          </Card>
        ))}
      </div>
    </main>
  )
}