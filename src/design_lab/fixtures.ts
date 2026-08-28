import { loadScaleById } from '../lib/loadScale'
import type { Question } from '../data/schemas'

const classic = loadScaleById('classic')

// 每维度取前 2 题：8 题短流程即可体验 4 次维度主题切换
function pickFixtureQuestions(): Question[] {
  if (!classic) return []
  return classic.dimensions.flatMap(d =>
    classic.questions.filter(q => q.dimensionId === d.id).slice(0, 2),
  )
}

export const FIXTURE_QUESTIONS = pickFixtureQuestions()

export const DIM_NAME: Record<string, string> = Object.fromEntries(
  (classic?.dimensions ?? []).map(d => [d.id, d.name]),
)
