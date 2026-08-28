import type { Scale, Question, Dimension } from '../data/schemas'

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 每题两选项权重相等（数据约定），以首选项权重为该题权重分层 */
function layerOf(q: Question): number {
  return q.options[0].weight
}

/**
 * 最大余数法配额：整数部分按层占比向下取整，余数单元按小数部分从大到小分配、
 * 并列时随机归属，消除固定向上取整对高权重层的偏置；Σ配额恒等于 count
 */
function allocateQuotas(layerSizes: number[], count: number, rng: () => number): number[] {
  const pool = layerSizes.reduce((sum, n) => sum + n, 0)
  if (pool === 0) return layerSizes.map(() => 0)
  const exact = layerSizes.map(n => (count * n) / pool)
  const quotas = exact.map(v => Math.floor(v))
  let leftover = count - quotas.reduce((sum, q) => sum + q, 0)
  const byFractionDesc = exact
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac || rng() - 0.5)
  for (const { i } of byFractionDesc) {
    if (leftover <= 0) break
    quotas[i] += 1
    leftover -= 1
  }
  return quotas
}

function drawForDimension(scale: Scale, dim: Dimension, count: number, rng: () => number): Question[] {
  const pool = scale.questions.filter(q => q.dimensionId === dim.id)

  // 按 权重 分层，权重从高到低处理
  const layers = new Map<number, Question[]>()
  for (const q of pool) {
    const w = layerOf(q)
    if (!layers.has(w)) layers.set(w, [])
    layers.get(w)!.push(q)
  }
  const weightsDescending = [...layers.keys()].sort((a, b) => b - a)
  const quotas = allocateQuotas(weightsDescending.map(w => layers.get(w)!.length), count, rng)

  const picked: Question[] = []
  let remaining = count
  for (const [i, w] of weightsDescending.entries()) {
    if (remaining <= 0) break
    const layer = shuffle(layers.get(w)!, rng)
    // take 以 remaining/层容量封顶：层不足配额时不挤占后续层，缺口交给降级补抽
    const take = Math.max(0, Math.min(quotas[i], layer.length, remaining))
    picked.push(...layer.slice(0, take))
    remaining -= take
  }

  // 兜底：某层不足配额时从剩余题中随机补足（题库校验保证正常不触发）
  if (remaining > 0) {
    console.warn(`[mbti] 维度 ${dim.id} 题库不足配额，已降级抽取`)
    const pickedIds = new Set(picked.map(q => q.id))
    const rest = shuffle(pool.filter(q => !pickedIds.has(q.id)), rng)
    picked.push(...rest.slice(0, remaining))
  }

  // 维度内乱序，消除题序位置效应
  return shuffle(picked, rng)
}

/**
 * 从量表题库分层随机抽取一份试卷：
 * 每维度抽 perDim 题（classic 16 / plus 16），权重构成按题库比例均衡（余数单元随机归属），
 * 每题选项顺序 50% 概率翻转。
 * rng 默认 Math.random，测试可注入 mulberry32 固定种子。
 */
export function drawQuestions(scale: Scale, perDim: number, rng: () => number = Math.random): Scale {
  const questions = scale.dimensions.flatMap(dim => drawForDimension(scale, dim, perDim, rng))
  return { ...scale, questions: questions.map(q => maybeFlipOptions(q, rng)) }
}

/** 50% 概率交换两选项位置（计分按 options[pick].pole，翻转不影响正确性） */
function maybeFlipOptions(q: Question, rng: () => number): Question {
  return rng() < 0.5 ? q : { ...q, options: [q.options[1], q.options[0]] as Question['options'] }
}