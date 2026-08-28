import { describe, it, expect } from 'vitest'
import { drawQuestions } from './draw'
import { mulberry32 } from './random'
import { loadScaleById } from './loadScale'

// 统计验证：多次抽取的计分基准稳定性（对应规格"维度+权重双均衡"）
// 注：题目两选项对称覆盖两极，两极总权重在任意组合下自动相等，此处作回归防线
// 固定种子是本套测试的特性（确定性、零 flake），禁止改回 Math.random

const RUNS = 200
const PER_DIM = 16

describe('抽题统计均衡性', () => {
  it.each(['classic', 'plus'])(`%s：${RUNS} 次抽取每次两极总权重相等`, id => {
    const scale = loadScaleById(id)!
    expect(scale).not.toBeNull()
    for (let seed = 0; seed < RUNS; seed++) {
      const drawn = drawQuestions(scale, PER_DIM, mulberry32(seed))
      for (const dim of scale.dimensions) {
        let high = 0
        let low = 0
        for (const q of drawn.questions.filter(q => q.dimensionId === dim.id)) {
          for (const o of q.options) {
            if (o.pole === dim.poles[0]) high += o.weight
            else low += o.weight
          }
        }
        expect(high, `seed=${seed} dim=${dim.id}`).toBe(low)
      }
    }
  })

  it.each(['classic', 'plus'])(`%s：${RUNS} 次抽取每次权重构成 = 每维度 w3×8 + w2×8`, id => {
    const scale = loadScaleById(id)!
    for (let seed = 0; seed < RUNS; seed++) {
      const drawn = drawQuestions(scale, PER_DIM, mulberry32(seed))
      for (const dim of scale.dimensions) {
        const qs = drawn.questions.filter(q => q.dimensionId === dim.id)
        expect(qs.filter(q => q.options[0].weight === 3), `seed=${seed}`).toHaveLength(8)
        expect(qs.filter(q => q.options[0].weight === 2), `seed=${seed}`).toHaveLength(8)
      }
    }
  })

  it.each(['classic', 'plus'])(`%s：${RUNS} 次抽取覆盖题库全部题目`, id => {
    const scale = loadScaleById(id)!
    const seen = new Set<string>()
    for (let seed = 0; seed < RUNS; seed++) {
      for (const q of drawQuestions(scale, PER_DIM, mulberry32(seed)).questions) seen.add(q.id)
    }
    expect(seen.size).toBe(scale.questions.length)
  })

  it.each(['classic', 'plus'])(`%s：${RUNS} 次抽取无重复卷`, id => {
    const scale = loadScaleById(id)!
    const sigs = new Set<string>()
    for (let seed = 0; seed < RUNS; seed++) {
      sigs.add(drawQuestions(scale, PER_DIM, mulberry32(seed)).questions.map(q => q.id).join(','))
    }
    // 200 次独立抽取组合碰撞概率极低
    expect(sigs.size).toBe(RUNS)
  })

  it.each(['classic', 'plus'])(`%s：${RUNS} 次抽取单题选中频率均匀`, id => {
    const scale = loadScaleById(id)!
    const perDim = PER_DIM
    const total = scale.questions.length
    // 每次抽 total/2 题 → 单题期望选中次数 = RUNS / 2
    const expected = RUNS / 2
    const counts = new Map<string, number>()
    for (let seed = 0; seed < RUNS; seed++) {
      for (const q of drawQuestions(scale, perDim, mulberry32(seed)).questions) {
        counts.set(q.id, (counts.get(q.id) ?? 0) + 1)
      }
    }
    expect(counts.size).toBe(total)
    // 宽松区间 ±40：二项分布 n=200 p=0.5 的 σ≈5，±40 约覆盖 8σ，仅拦截系统性偏斜
    for (const [qid, n] of counts) {
      expect(n, `题目 ${qid} 选中 ${n} 次`).toBeGreaterThanOrEqual(expected - 40)
      expect(n, `题目 ${qid} 选中 ${n} 次`).toBeLessThanOrEqual(expected + 40)
    }
  })
})