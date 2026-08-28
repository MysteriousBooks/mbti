import { describe, it, expect } from 'vitest'
import { drawQuestions } from './draw'
import { mulberry32 } from './random'
import type { Scale } from '../data/schemas'

// 合成题库：2 维度 × 32 题（每维度 w3×16 + w2×16，两选项权重相等）
function makeScale(): Scale {
  const dims = ['aa', 'bb'].map(id => ({
    id,
    name: id,
    poles: [`${id}H`, `${id}L`] as [string, string],
    descriptions: { [`${id}H`]: '高', [`${id}L`]: '低' },
  }))
  const questions: Scale['questions'] = []
  let n = 0
  for (const dim of dims) {
    for (const w of [3, 2]) {
      for (let i = 0; i < 16; i++) {
        n++
        questions.push({
          id: `${dim.id}-${String(n).padStart(2, '0')}`,
          text: `题目 ${dim.id} 权重${w} 第${i}题`,
          dimensionId: dim.id,
          options: [
            { text: '选项甲', pole: dim.poles[0], weight: w },
            { text: '选项乙', pole: dim.poles[1], weight: w },
          ],
        })
      }
    }
  }
  const types: Scale['types'] = {}
  for (const a of dims[0].poles) {
    for (const b of dims[1].poles) {
      types[`${a}${b}`] = { code: `${a}${b}`, name: `${a}${b}`, summary: '', traits: [] }
    }
  }
  return { id: 'test', name: '测试', description: '', dimensions: dims, questions, types }
}

describe('drawQuestions', () => {
  const scale = makeScale()

  it('每维度抽 16 题，总题数不变', () => {
    const drawn = drawQuestions(scale, 16, mulberry32(1))
    expect(drawn.questions).toHaveLength(32)
    for (const dim of scale.dimensions) {
      expect(drawn.questions.filter(q => q.dimensionId === dim.id)).toHaveLength(16)
    }
  })

  it('权重构成均衡：每维度 w3×8 + w2×8', () => {
    const drawn = drawQuestions(scale, 16, mulberry32(2))
    for (const dim of scale.dimensions) {
      const qs = drawn.questions.filter(q => q.dimensionId === dim.id)
      expect(qs.filter(q => q.options[0].weight === 3)).toHaveLength(8)
      expect(qs.filter(q => q.options[0].weight === 2)).toHaveLength(8)
    }
  })

  it('卷内无重复题，且都来自题库', () => {
    const drawn = drawQuestions(scale, 16, mulberry32(3))
    const ids = drawn.questions.map(q => q.id)
    expect(new Set(ids).size).toBe(32)
    const bankIds = new Set(scale.questions.map(q => q.id))
    expect(ids.every(id => bankIds.has(id))).toBe(true)
  })

  it('不同种子产生不同题目组合', () => {
    const a = drawQuestions(scale, 16, mulberry32(4)).questions.map(q => q.id).join(',')
    const b = drawQuestions(scale, 16, mulberry32(5)).questions.map(q => q.id).join(',')
    expect(a).not.toBe(b)
  })

  it('选项顺序随机化：约一半题目两选项被交换', () => {
    const drawn = drawQuestions(scale, 16, mulberry32(6))
    const flipped = drawn.questions.filter(q => {
      const orig = scale.questions.find(o => o.id === q.id)!
      return q.options[0].pole !== orig.options[0].pole
    })
    // 32 题二项分布，翻转概率 0.5 → 期望 16，容忍 [6, 26]
    expect(flipped.length).toBeGreaterThanOrEqual(6)
    expect(flipped.length).toBeLessThanOrEqual(26)
  })

  it('翻转后两选项仍覆盖维度两极', () => {
    const drawn = drawQuestions(scale, 16, mulberry32(7))
    for (const q of drawn.questions) {
      const dim = scale.dimensions.find(d => d.id === q.dimensionId)!
      const poles = new Set(q.options.map(o => o.pole))
      expect([...poles].sort()).toEqual([...dim.poles].sort())
    }
  })

  it('除 questions 外其余字段不变', () => {
    const drawn = drawQuestions(scale, 16, mulberry32(8))
    const { questions: _q, ...rest } = drawn
    const { questions: _o, ...origRest } = scale
    expect(rest).toEqual(origRest)
  })

  it('维度内题目顺序被随机打乱', () => {
    const drawn = drawQuestions(scale, 16, mulberry32(9))
    const drawnOrder = drawn.questions.filter(q => q.dimensionId === 'aa').map(q => q.id)
    // 同一批题在原题库中的出现顺序（按题库顺序过滤出这 16 题）
    const bankOrder = scale.questions.filter(q => drawnOrder.includes(q.id)).map(q => q.id)
    expect(drawnOrder).toHaveLength(bankOrder.length) // 同一 id 集合
    expect(new Set(drawnOrder).size).toBe(16)
    expect(drawnOrder).not.toEqual(bankOrder) // 16! 排列，相同概率≈0
  })

  it('入参题库不被修改（纯函数）', () => {
    const before = JSON.stringify(scale)
    drawQuestions(scale, 16, mulberry32(10))
    expect(JSON.stringify(scale)).toBe(before)
  })

  it('权重层超过两层时仍精确返回 perDim 题（配额防御）', () => {
    // 构造 w3/w2/w1 三层题库，锁定「返回题数恒等于 perDim」不变量
    const threeLayer = makeScale()
    // 把 aa 维度一半的 w2 题改成 w1，形成三层
    const aaW2 = threeLayer.questions.filter(q => q.dimensionId === 'aa' && q.options[0].weight === 2)
    aaW2.slice(0, 8).forEach(q => {
      q.options = q.options.map(o => ({ ...o, weight: 1 as const })) as typeof q.options
    })
    for (const perDim of [3, 7, 16]) {
      const drawn = drawQuestions(threeLayer, perDim, mulberry32(11))
      expect(drawn.questions).toHaveLength(2 * perDim)
    }
  })

  it('权重层达到四层时仍精确返回 perDim 题（超抽防御）', () => {
    // 复刻已证实的超抽形状：每维 10 题、层大小 [3,3,3,1]、perDim=5。
    // 非末层配额 round(5·3/10)=2 连续三轮超配后 remaining 变负，修复前会静默返回 6 题
    const fourLayer = makeScale()
    const layerWeights = [4, 4, 4, 3, 3, 3, 2, 2, 2, 1]
    fourLayer.questions = fourLayer.dimensions.flatMap(dim =>
      fourLayer.questions
        .filter(q => q.dimensionId === dim.id)
        .slice(0, 10)
        .map((q, i) => ({
          ...q,
          options: q.options.map(o => ({ ...o, weight: layerWeights[i] })) as typeof q.options,
        })),
    )
    for (const perDim of [3, 5, 9]) {
      const drawn = drawQuestions(fourLayer, perDim, mulberry32(12))
      expect(drawn.questions).toHaveLength(2 * perDim)
      for (const dim of fourLayer.dimensions) {
        expect(drawn.questions.filter(q => q.dimensionId === dim.id)).toHaveLength(perDim)
      }
    }
  })

  it('perDim=1 时高低权重层都可能被抽中（余数随机归属）', () => {
    // 修复前 round(1·16/32)=0.5 恒向上 → 永远只抽 w3 层
    const drawnWeights = new Set<number>()
    for (let seed = 0; seed < 24; seed++) {
      const drawn = drawQuestions(scale, 1, mulberry32(seed))
      for (const q of drawn.questions.filter(q => q.dimensionId === 'aa')) {
        drawnWeights.add(q.options[0].weight)
      }
    }
    expect(drawnWeights).toEqual(new Set([3, 2]))
  })

  it('perDim=3 时权重构成随种子变化，不再恒为 2×w3+1×w2', () => {
    const w3Counts = new Set<number>()
    for (let seed = 0; seed < 24; seed++) {
      const drawn = drawQuestions(scale, 3, mulberry32(seed))
      const qs = drawn.questions.filter(q => q.dimensionId === 'aa')
      w3Counts.add(qs.filter(q => q.options[0].weight === 3).length)
    }
    expect(w3Counts).toEqual(new Set([1, 2]))
  })
})