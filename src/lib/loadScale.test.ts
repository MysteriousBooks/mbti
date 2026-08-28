import { describe, it, expect } from 'vitest'
import { loadScaleById, SCALE_LIST } from './loadScale'

describe('loadScaleById', () => {
  it('classic 与 plus 已注册', () => {
    expect(SCALE_LIST.map(s => s.id)).toEqual(['classic', 'plus'])
  })
  it('loadScaleById("classic") 返回有效量表', () => {
    const s = loadScaleById('classic')
    expect(s).not.toBeNull()
    expect(s!.id).toBe('classic')
    // 题库扩充后 4 维度 × 32 题
    expect(s!.questions.length).toBe(128)
    expect(s!.dimensions.length).toBe(4)
  })
  it('loadScaleById("plus") 返回 160 题 5 维度', () => {
    const s = loadScaleById('plus')
    expect(s).not.toBeNull()
    expect(s!.questions.length).toBe(160)
    expect(s!.dimensions.length).toBe(5)
  })
  it('未知 id 返回 null', () => {
    expect(loadScaleById('nope')).toBeNull()
  })
})
