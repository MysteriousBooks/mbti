import { describe, it, expect } from 'vitest'
import { ScaleSchema } from './schemas'

const validScale = {
  id: 'demo',
  name: '示例',
  description: 'desc',
  dimensions: [
    { id: 'ei', name: '外向/内向', poles: ['E', 'I'], descriptions: { E: 'e', I: 'i' } },
  ],
  questions: [
    { id: 'q1', text: 't', dimensionId: 'ei', options: [{ text: 'a', pole: 'E', weight: 2 }, { text: 'b', pole: 'I', weight: 1 }] },
  ],
  types: { EEEE: { code: 'EEEE', name: 'n', summary: 's', traits: ['t'] } },
}

describe('ScaleSchema', () => {
  it('接受合规量表', () => {
    expect(() => ScaleSchema.parse(validScale)).not.toThrow()
  })
  it('拒绝指向不存在维度的题目', () => {
    const bad = { ...validScale, questions: [{ ...validScale.questions[0], dimensionId: 'xx' }] }
    expect(() => ScaleSchema.parse(bad)).toThrow()
  })
  it('拒绝 weight 超出 1-3', () => {
    const bad = { ...validScale, questions: [{ ...validScale.questions[0], options: [{ text: 'a', pole: 'E', weight: 5 }, { text: 'b', pole: 'I', weight: 1 }] }] }
    expect(() => ScaleSchema.parse(bad)).toThrow()
  })
  it('拒绝两极数量不为2', () => {
    const bad = { ...validScale, dimensions: [{ ...validScale.dimensions[0], poles: ['E'] }] }
    expect(() => ScaleSchema.parse(bad)).toThrow()
  })
  it('拒绝选项 pole 不在维度 poles 内', () => {
    const bad = { ...validScale, questions: [{ ...validScale.questions[0], options: [{ text: 'a', pole: 'X', weight: 2 }, { text: 'b', pole: 'I', weight: 1 }] }] }
    expect(() => ScaleSchema.parse(bad)).toThrow()
  })
  it('拒绝两选项 pole 相同', () => {
    const bad = { ...validScale, questions: [{ ...validScale.questions[0], options: [{ text: 'a', pole: 'E', weight: 2 }, { text: 'b', pole: 'E', weight: 1 }] }] }
    expect(() => ScaleSchema.parse(bad)).toThrow()
  })
  it('拒绝选项缺 pole 字段', () => {
    const bad = { ...validScale, questions: [{ ...validScale.questions[0], options: [{ text: 'a', weight: 2 }, { text: 'b', pole: 'I', weight: 1 }] }] }
    expect(() => ScaleSchema.parse(bad)).toThrow()
  })
  it('允许两选项 pole 顺序与 poles 相反', () => {
    const ok = { ...validScale, questions: [{ ...validScale.questions[0], options: [{ text: 'a', pole: 'I', weight: 1 }, { text: 'b', pole: 'E', weight: 2 }] }] }
    expect(() => ScaleSchema.parse(ok)).not.toThrow()
  })
  it('拒绝 weight 为 0', () => {
    const bad = { ...validScale, questions: [{ ...validScale.questions[0], options: [{ text: 'a', pole: 'E', weight: 0 }, { text: 'b', pole: 'I', weight: 1 }] }] }
    expect(() => ScaleSchema.parse(bad)).toThrow()
  })
  it('拒绝 weight 非整数', () => {
    const bad = { ...validScale, questions: [{ ...validScale.questions[0], options: [{ text: 'a', pole: 'E', weight: 1.5 }, { text: 'b', pole: 'I', weight: 1 }] }] }
    expect(() => ScaleSchema.parse(bad)).toThrow()
  })
  it('拒绝空 questions 数组', () => {
    const bad = { ...validScale, questions: [] }
    expect(() => ScaleSchema.parse(bad)).toThrow()
  })
  it('拒绝空 dimensions 数组', () => {
    const bad = { ...validScale, dimensions: [] }
    expect(() => ScaleSchema.parse(bad)).toThrow()
  })
  it('拒绝 types 值结构非法（traits 非数组）', () => {
    const bad = { ...validScale, types: { EEEE: { code: 'EEEE', name: 'n', summary: 's', traits: 't' } } }
    expect(() => ScaleSchema.parse(bad)).toThrow()
  })
})
