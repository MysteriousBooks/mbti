import { useState, useMemo } from 'react'
import { Button } from './components/ui/Button'
import { ScaleSelect } from './components/ScaleSelect'
import { Quiz } from './components/Quiz'
import { Result } from './components/Result'
import { loadScaleById, SCALE_LIST } from './lib/loadScale'
import { score } from './lib/scoring'
import type { Scale } from './data/schemas'

type Phase = 'select' | 'quiz' | 'result'

export function App() {
  const [phase, setPhase] = useState<Phase>('select')
  const [scaleId, setScaleId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, 0 | 1>>({})

  const scale: Scale | null = scaleId ? loadScaleById(scaleId) : null

  const result = useMemo(
    () => (scale && phase === 'result' ? score(scale, answers) : null),
    [scale, answers, phase],
  )

  if (phase === 'select' || !scale) {
    return (
      <ScaleSelect
        onSelect={(id) => {
          setScaleId(id)
          setAnswers({})
          setPhase('quiz')
        }}
      />
    )
  }
  if (phase === 'quiz') {
    return (
      <Quiz
        scale={scale}
        answers={answers}
        onAnswer={(qid, oi) => setAnswers(a => ({ ...a, [qid]: oi }))}
        onComplete={() => setPhase('result')}
      />
    )
  }
  if (result) {
    return (
      <Result
        result={result}
        scale={scale}
        onRetest={() => {
          setAnswers({})
          setPhase('select')
        }}
        onSwitchScale={() => {
          // 切到量表列表中的下一套（循环），不依赖具体量表数量
          const ids = SCALE_LIST.map(s => s.id)
          const cur = ids.indexOf(scaleId ?? '')
          setAnswers({})
          setScaleId(ids[(cur + 1) % ids.length])
          setPhase('quiz')
        }}
      />
    )
  }
  return (
    <main className="screen">
      <p>测试暂不可用，请稍后再试。</p>
      <Button variant="ghost" onClick={() => setPhase('select')}>返回选择页</Button>
    </main>
  )
}