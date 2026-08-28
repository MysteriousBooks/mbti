import { describe, it, expect } from 'vitest'
import { loadScaleById } from './loadScale'
import type { Scale } from '../data/schemas'

// 数据平衡性校验：防止权重不对称导致计分系统性偏向某一极
// （2026-08 审计发现：高极总权重 40 vs 低极 16，随机作答 90% 判高极）
// 题库扩充后每维度 32 题（w3×16 + w2×16），每极总权重 64，两极对称

const scales = ['classic', 'plus'].map(id => loadScaleById(id)!)

describe('量表数据平衡性', () => {
  it.each(scales.map(s => [s.id, s] as const))('%s 每题两选项权重相等', (_id, s: Scale) => {
    const unbalanced = s.questions.filter(q => q.options[0].weight !== q.options[1].weight)
    expect(unbalanced.map(q => q.id)).toEqual([])
  })

  it.each(scales.map(s => [s.id, s] as const))('%s 每维度两极总权重相等', (_id, s: Scale) => {
    for (const dim of s.dimensions) {
      let high = 0
      let low = 0
      for (const q of s.questions.filter(q => q.dimensionId === dim.id)) {
        for (const o of q.options) {
          if (o.pole === dim.poles[0]) high += o.weight
          else low += o.weight
        }
      }
      expect(high, `维度 ${dim.id}: ${dim.poles[0]}=${high} vs ${dim.poles[1]}=${low}`).toBe(low)
      expect(high, `维度 ${dim.id} 总权重不应为 0`).toBeGreaterThan(0)
    }
  })

  it.each(scales.map(s => [s.id, s] as const))('%s 每维度权重构成为 w3×16 + w2×16', (_id, s: Scale) => {
    for (const dim of s.dimensions) {
      const qs = s.questions.filter(q => q.dimensionId === dim.id)
      expect(qs, `维度 ${dim.id} 应有 32 题`).toHaveLength(32)
      expect(qs.filter(q => q.options[0].weight === 3), `维度 ${dim.id} w3`).toHaveLength(16)
      expect(qs.filter(q => q.options[0].weight === 2), `维度 ${dim.id} w2`).toHaveLength(16)
    }
  })

  it.each(scales.map(s => [s.id, s] as const))('%s 题目 id 无重复', (_id, s: Scale) => {
    const ids = s.questions.map(q => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})