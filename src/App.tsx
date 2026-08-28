import { useState, useMemo } from 'react'
import { Button } from './components/ui/Button'
import { ScaleSelect } from './components/ScaleSelect'
import { Quiz } from './components/Quiz'
import { Result } from './components/Result'
import { loadScaleById, SCALE_LIST } from './lib/loadScale'
import { drawQuestions } from './lib/draw'
import { score } from './lib/scoring'
import type { Scale } from './data/schemas'
import { DesignLab } from './design_lab'

type Phase = 'select' | 'quiz' | 'result'

// 每维度答题量：classic/plus 题库均为每维度 32 题，抽 16 题（规格：总题数不变）
const PER_DIM = 16

export function App() {
  const [phase, setPhase] = useState<Phase>('select')
  const [scaleId, setScaleId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, 0 | 1>>({})
  // 本次抽取的试卷；选择量表/换量表时重新抽取
  const [drawn, setDrawn] = useState<Scale | null>(null)

  const result = useMemo(
    () => (drawn && phase === 'result' ? score(drawn, answers) : null),
    [drawn, answers, phase],
  )

  // 临时入口：?design_lab=true 打开设计实验室（设计会话产物，定稿后随 src/design_lab/ 一起删除）
  if (new URLSearchParams(window.location.search).has('design_lab')) {
    return <DesignLab />
  }

  const startScale = (id: string) => {
    const s = loadScaleById(id)
    if (!s) return
    setScaleId(id)
    setDrawn(drawQuestions(s, PER_DIM))
    setAnswers({})
    setPhase('quiz')
  }

  if (phase === 'select' || !drawn) {
    return <ScaleSelect onSelect={startScale} />
  }
  if (phase === 'quiz') {
    return (
      <Quiz
        scale={drawn}
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
        scale={drawn}
        onRetest={() => {
          setAnswers({})
          setPhase('select')
        }}
        onSwitchScale={() => {
          // 切到量表列表中的下一套（循环），不依赖具体量表数量
          const ids = SCALE_LIST.map(s => s.id)
          const cur = ids.indexOf(scaleId ?? '')
          startScale(ids[(cur + 1) % ids.length])
        }}
      />
    )
  }
  // 防御性兜底：TS 收窄下不可达（drawn 非空时 score 恒返回结果），保留以防状态异常白屏
  return (
    <main className="screen">
      <p>测试暂不可用，请稍后再试。</p>
      <Button variant="ghost" onClick={() => setPhase('select')}>返回选择页</Button>
    </main>
  )
}