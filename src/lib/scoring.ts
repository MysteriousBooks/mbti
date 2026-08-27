import type { Scale, Pole, TypeResult } from '../data/schemas'

export interface DimensionScore {
  dimensionId: string
  primary: Pole | null
  percentage: number
  status: 'high' | 'low' | 'neutral'
}

export interface ScoreResult {
  typeCode: string
  typeName: string
  summary: string
  traits: string[]
  dimensions: DimensionScore[]
  /** 居中态（含 x 码）的候选类型列表；确定态为 undefined */
  candidates?: TypeCandidate[]
}

export interface TypeCandidate {
  code: string
  name: string
  summary: string
  traits: string[]
}

const FALLBACK = {
  typeName: '未知类型',
  summary: '当前结果暂无详细描述。',
  traits: [] as string[],
}

const ALL_NEUTRAL = {
  typeName: '各维度均不明显',
  summary: '你当前测得的各维度倾向都不明显，建议在更放松的状态下如实重测。',
  traits: [] as string[],
}

export function score(scale: Scale, answers: Record<string, 0 | 1>): ScoreResult {
  const dimensions: DimensionScore[] = scale.dimensions.map(dim => {
    const dimQuestions = scale.questions.filter(q => q.dimensionId === dim.id)
    const [highPole, lowPole] = dim.poles

    let highScore = 0
    let lowScore = 0
    for (const q of dimQuestions) {
      const pick = answers[q.id]
      if (pick === undefined) {
        continue
      }
      const opt = q.options[pick]
      if (opt.pole === highPole) {
        highScore += opt.weight
      } else if (opt.pole === lowPole) {
        lowScore += opt.weight
      }
    }

    const total = highScore + lowScore
    let percentage: number
    let primary: Pole | null
    let status: 'high' | 'low' | 'neutral'

    if (total === 0) {
      // 全未答/空维度：记居中（全跳过 → 全x码 → 命中"建议重测"通用文案）
      percentage = 50
      primary = null
      status = 'neutral'
    } else {
      percentage = Math.round((highScore / total) * 100)
      if (percentage >= 55) {
        primary = highPole
        status = 'high'
      } else if (percentage <= 45) {
        primary = lowPole
        status = 'low'
      } else {
        primary = null
        status = 'neutral'
      }
    }

    return { dimensionId: dim.id, primary, percentage, status }
  })

  const typeCode = dimensions.map(d => (d.primary === null ? 'x' : d.primary)).join('')
  const lookup = resolveType(scale, typeCode)

  return {
    typeCode,
    typeName: lookup.typeName,
    summary: lookup.summary,
    traits: lookup.traits,
    dimensions,
    ...(lookup.candidates ? { candidates: lookup.candidates } : {}),
  }
}

function resolveType(
  scale: Scale,
  code: string,
): { typeName: string; summary: string; traits: string[]; candidates?: TypeCandidate[] } {
  if (code in scale.types) {
    const t = scale.types[code]
    return { typeName: t.name, summary: t.summary, traits: t.traits }
  }
  if (code.includes('x')) {
    if (/^x+$/.test(code)) {
      return { ...ALL_NEUTRAL }
    }
    const variants = expandX(code, scale)
    if (variants.length) {
      // 附带 code 供 candidates 使用（mergeTypeParts 已改为结构化）
      // expandX 已保证 code===key，此处显式构造（spread 在前避免重复键告警）
      const parts = variants.map(v => ({ ...scale.types[v], code: v }))
      return mergeTypeParts(parts, code)
    }
  }
  console.warn(`[mbti] 缺少类型文案: ${code}`)
  return { ...FALLBACK }
}

function expandX(code: string, scale: Scale): string[] {
  const xi = code.indexOf('x')
  if (xi < 0) {
    return code in scale.types ? [code] : []
  }
  const dim = scale.dimensions[xi]
  const results: string[] = []
  for (const p of dim.poles) {
    const next = code.slice(0, xi) + p + code.slice(xi + 1)
    if (next.includes('x')) {
      results.push(...expandX(next, scale))
    } else if (next in scale.types) {
      results.push(next)
    }
  }
  return [...new Set(results)]
}

function mergeTypeParts(
  parts: (TypeResult & { code: string })[],
  code: string,
): { typeName: string; summary: string; traits: string[]; candidates?: TypeCandidate[] } {
  if (parts.length === 0) {
    return { ...FALLBACK }
  }
  const names = parts.map(p => p.name).filter(Boolean)
  const traits = Array.from(new Set(parts.flatMap(p => p.traits)))
  // 居中态改为结构化候选列表：
  // typeName 用分隔符串（兼容旧渲染兜底）、summary 改为引导语，完整数据进 candidates
  return {
    typeName: names.join(' / ') || FALLBACK.typeName,
    summary: `你有 ${code.split('').filter(c => c === 'x').length} 个维度的两极倾向接近，以下类型都接近你。点选查看详情。`,
    traits,
    candidates: parts.map(p => ({
      code: p.code,
      name: p.name,
      summary: p.summary,
      traits: p.traits.slice(0, 3),
    })),
  }
}
