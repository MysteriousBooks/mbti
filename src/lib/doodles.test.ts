import { describe, it, expect } from 'vitest'
import { ALL_KINDS, DIM_THEMES, doodleCountFor, placeDoodles } from './doodles'

describe('doodleCountFor', () => {
  it('手机竖屏给最少 3 只', () => {
    expect(doodleCountFor(375, 812)).toBe(3)
  })
  it('笔记本桌面约 8 只', () => {
    expect(doodleCountFor(1280, 800)).toBe(8)
  })
  it('大桌面封顶 14 只', () => {
    expect(doodleCountFor(1920, 1080)).toBe(14)
  })
  it('极小窗口保底 3 只', () => {
    expect(doodleCountFor(200, 400)).toBe(3)
  })
})

describe('DIM_THEMES 完整性', () => {
  it('主题池引用的涂鸦都存在于 DOODLE_SVGS', () => {
    for (const pool of Object.values(DIM_THEMES)) {
      for (const kind of pool) expect(ALL_KINDS).toContain(kind)
    }
  })
  it('每种涂鸦都至少归入一个维度主题池', () => {
    const themed = new Set(Object.values(DIM_THEMES).flat())
    for (const kind of ALL_KINDS) expect(themed.has(kind)).toBe(true)
  })
})

describe('placeDoodles', () => {
  it('按 count 生成、坐标落在安全区内、id 唯一', () => {
    const items = placeDoodles(ALL_KINDS, 10)
    expect(items).toHaveLength(10)
    expect(new Set(items.map(p => p.id)).size).toBe(10)
    for (const p of items) {
      expect(p.x).toBeGreaterThanOrEqual(4)
      expect(p.x).toBeLessThanOrEqual(96)
      expect(p.y).toBeGreaterThanOrEqual(3)
      expect(p.y).toBeLessThanOrEqual(96)
      expect(p.size).toBeGreaterThanOrEqual(30)
      expect(p.size).toBeLessThanOrEqual(52)
    }
  })
})