import { describe, it, expect } from 'vitest'
import { score } from './scoring'
import type { Scale } from '../data/schemas'

// 测试用迷你量表：2 维度，每维度 2 题
// 计分模型：选中选项的 weight 累加到该选项 pole 对应的极上
const mini: Scale = {
  id: 'mini', name: 'mini', description: '',
  dimensions: [
    { id: 'ei', name: 'EI', poles: ['E', 'I'], descriptions: { E: '', I: '' } },
    { id: 'sn', name: 'SN', poles: ['S', 'N'], descriptions: { S: '', N: '' } },
  ],
  questions: [
    { id: 'q1', text: 'q1', dimensionId: 'ei', options: [{ text: 'a', pole: 'E', weight: 3 }, { text: 'b', pole: 'I', weight: 1 }] },
    { id: 'q2', text: 'q2', dimensionId: 'ei', options: [{ text: 'a', pole: 'E', weight: 3 }, { text: 'b', pole: 'I', weight: 1 }] },
    { id: 'q3', text: 'q3', dimensionId: 'sn', options: [{ text: 'a', pole: 'S', weight: 3 }, { text: 'b', pole: 'N', weight: 1 }] },
    { id: 'q4', text: 'q4', dimensionId: 'sn', options: [{ text: 'a', pole: 'S', weight: 3 }, { text: 'b', pole: 'N', weight: 1 }] },
  ],
  types: {
    ES: { code: 'ES', name: 'ES型', summary: 'es-sum', traits: ['es-t1'] },
    EN: { code: 'EN', name: 'EN型', summary: 'en-sum', traits: ['en-t1'] },
    IS: { code: 'IS', name: 'IS型', summary: 'is-sum', traits: ['is-t1'] },
    IN: { code: 'IN', name: 'IN型', summary: 'in-sum', traits: ['in-t1'] },
  },
}

describe('score', () => {
  it('全选高分极(选项0) → ES, 各维度100%', () => {
    const answers = { q1: 0, q2: 0, q3: 0, q4: 0 } as Record<string, 0 | 1>
    const r = score(mini, answers)
    expect(r.typeCode).toBe('ES')
    expect(r.dimensions[0]).toMatchObject({ primary: 'E', status: 'high', percentage: 100 })
    expect(r.dimensions[1]).toMatchObject({ primary: 'S', status: 'high', percentage: 100 })
  })

  it('全选低分极(选项1) → IN, 各维度0%', () => {
    // 新模型：低分极选项累加 lowScore，highScore=0 → 0%
    const answers = { q1: 1, q2: 1, q3: 1, q4: 1 } as Record<string, 0 | 1>
    const r = score(mini, answers)
    expect(r.typeCode).toBe('IN')
    expect(r.dimensions[0]).toMatchObject({ primary: 'I', status: 'low', percentage: 0 })
    expect(r.dimensions[1]).toMatchObject({ primary: 'N', status: 'low', percentage: 0 })
  })

  it('混合答案 → 两极分别累加（ei: 选E=3 + 选I=1 → high=3, low=1, pct=75%）', () => {
    const answers = { q1: 0, q2: 1, q3: 0, q4: 1 } as Record<string, 0 | 1>
    const r = score(mini, answers)
    expect(r.dimensions[0].percentage).toBe(75)
    expect(r.dimensions[0].primary).toBe('E')
    expect(r.dimensions[1].percentage).toBe(75)
  })

  it('按 pole 累加而非选项位置（I 选项在 options[0] 时选它计 low）', () => {
    const m: Scale = {
      id: 'rev', name: 'rev', description: '',
      dimensions: [{ id: 'ei', name: 'EI', poles: ['E', 'I'], descriptions: { E: '', I: '' } }],
      questions: [{ id: 'q1', text: 'q1', dimensionId: 'ei', options: [{ text: 'i-opt', pole: 'I', weight: 1 }, { text: 'e-opt', pole: 'E', weight: 3 }] }],
      types: {},
    }
    const r = score(m, { q1: 0 })
    expect(r.dimensions[0]).toMatchObject({ primary: 'I', status: 'low', percentage: 0 })
  })

  it('high=low → 50% 精确居中', () => {
    // 题1选I(low=1)，题2选E(high=1) → high=1, low=1 → 50% neutral
    const m: Scale = {
      id: 'x', name: 'x', description: '',
      dimensions: [{ id: 'ei', name: 'ei', poles: ['E', 'I'], descriptions: { E: '', I: '' } }],
      questions: [
        { id: 'q1', text: 'q1', dimensionId: 'ei', options: [{ text: 'e', pole: 'E', weight: 3 }, { text: 'i', pole: 'I', weight: 1 }] },
        { id: 'q2', text: 'q2', dimensionId: 'ei', options: [{ text: 'e', pole: 'E', weight: 1 }, { text: 'i', pole: 'I', weight: 3 }] },
      ],
      types: { E: { code: 'E', name: '', summary: '', traits: [] }, I: { code: 'I', name: '', summary: '', traits: [] } },
    }
    const r = score(m, { q1: 1, q2: 0 })
    expect(r.dimensions[0].percentage).toBe(50)
    expect(r.dimensions[0].status).toBe('neutral')
    expect(r.dimensions[0].primary).toBeNull()
    expect(r.typeCode).toBe('x')
  })

  it('占比 46~54 区间均判居中', () => {
    // high=6, low=5 → round(6/11*100)=55 → high 边界
    // 构造 46%：high=6, low=7 → round(46.15)=46 ≤ ... 实际 46<55 且 >45 → neutral
    const m: Scale = {
      id: 'n', name: 'n', description: '',
      dimensions: [{ id: 'ei', name: 'ei', poles: ['E', 'I'], descriptions: { E: '', I: '' } }],
      questions: [
        { id: 'q1', text: 'q1', dimensionId: 'ei', options: [{ text: 'e', pole: 'E', weight: 3 }, { text: 'i', pole: 'I', weight: 1 }] },
        { id: 'q2', text: 'q2', dimensionId: 'ei', options: [{ text: 'e', pole: 'E', weight: 3 }, { text: 'i', pole: 'I', weight: 1 }] },
        { id: 'q3', text: 'q3', dimensionId: 'ei', options: [{ text: 'e', pole: 'E', weight: 3 }, { text: 'i', pole: 'I', weight: 1 }] },
        { id: 'q4', text: 'q4', dimensionId: 'ei', options: [{ text: 'e', pole: 'E', weight: 3 }, { text: 'i', pole: 'I', weight: 1 }] },
      ],
      types: {},
    }
    // 选 q1:0(E3) q2:0(E3) q3:1(I1) q4:1(I1) → high=6, low=2 → round(75)=75 → high
    const rHigh = score(m, { q1: 0, q2: 0, q3: 1, q4: 1 } as Record<string, 0 | 1>)
    expect(rHigh.dimensions[0].status).toBe('high')
    expect(rHigh.dimensions[0].percentage).toBe(75)
    // 全选 I → low=4, high=0 → 0% low
    const rLow = score(m, { q1: 1, q2: 1, q3: 1, q4: 1 } as Record<string, 0 | 1>)
    expect(rLow.dimensions[0].status).toBe('low')
    expect(rLow.dimensions[0].percentage).toBe(0)
  })

  it('含 x 居中码回退：Ex 风格 → 合并两极文案', () => {
    // ei 维度 1 题选 E → 100%（确定极性）
    // tf 维度 2 题构成居中（high=1, low=1）→ x
    // typeCode = 'Ex'，types 有 ET/EF 但无 Ex → expandX 合并 ET+EF 文案
    const m: Scale = {
      id: 'x2', name: 'x2', description: '',
      dimensions: [
        { id: 'ei', name: 'ei', poles: ['E', 'I'], descriptions: { E: '', I: '' } },
        { id: 'tf', name: 'tf', poles: ['T', 'F'], descriptions: { T: '', F: '' } },
      ],
      questions: [
        { id: 'q1', text: 'q1', dimensionId: 'ei', options: [{ text: 'e', pole: 'E', weight: 3 }, { text: 'i', pole: 'I', weight: 1 }] },
        { id: 'q2', text: 'q2', dimensionId: 'tf', options: [{ text: 't', pole: 'T', weight: 3 }, { text: 'f', pole: 'F', weight: 1 }] },
        { id: 'q3', text: 'q3', dimensionId: 'tf', options: [{ text: 't', pole: 'T', weight: 1 }, { text: 'f', pole: 'F', weight: 3 }] },
      ],
      types: {
        ET: { code: 'ET', name: 'ET型', summary: 'et-sum', traits: ['et'] },
        EF: { code: 'EF', name: 'EF型', summary: 'ef-sum', traits: ['ef'] },
      },
    }
    const r = score(m, { q1: 0, q2: 1, q3: 0 })
    expect(r.typeCode).toBe('Ex')
    // 居中态改为结构化：summary 是引导语，完整内容进 candidates
    expect(r.summary).toContain('维度的两极倾向接近')
    expect(r.traits).toEqual(expect.arrayContaining(['et', 'ef']))
    expect(r.candidates).toHaveLength(2)
    expect(r.candidates?.map(c => c.code)).toEqual(expect.arrayContaining(['ET', 'EF']))
    expect(r.candidates?.[0].summary).toMatch(/et-sum|ef-sum/)
    expect(r.candidates?.[0].traits.length).toBeGreaterThan(0)
  })

  it('缺类型码 → 回退文案不崩', () => {
    const answers = { q1: 0, q2: 0, q3: 0, q4: 0 } as Record<string, 0 | 1>
    const noTypes: Scale = { ...mini, types: {} }
    const r = score(noTypes, answers)
    expect(r.typeName).toBeTruthy()
    expect(r.summary).toBeTruthy()
    expect(r.typeCode).toBe('ES')
  })

  it('空维度（high+low=0）→ 不除零，percentage=50', () => {
    const m: Scale = {
      id: 'x', name: 'x', description: '',
      dimensions: [{ id: 'ei', name: 'ei', poles: ['E', 'I'], descriptions: { E: '', I: '' } }],
      questions: [],
      types: {},
    }
    const r = score(m, {})
    expect(r.dimensions[0].percentage).toBe(50)
  })

  it('全未答 → 各维度记 50 居中', () => {
    const r = score(mini, {})
    r.dimensions.forEach(d => {
      expect(d.percentage).toBe(50)
      expect(d.status).toBe('neutral')
      expect(d.primary).toBeNull()
    })
    expect(r.typeCode).toBe('xx')
  })

  it('未答某题 → 该题不累加（已答题照常判定）', () => {
    const answers = { q1: 0 } as Record<string, 0 | 1>  // q2 未答
    const r = score(mini, answers)
    // ei: q1选E(weight3) → high=3, low=0, total=3 → 100% high（未答的q2不拉低）
    expect(r.dimensions[0].status).toBe('high')
    expect(r.dimensions[0].percentage).toBe(100)
    // sn 全未答 → 50 neutral
    expect(r.dimensions[1].status).toBe('neutral')
    expect(r.typeCode).toBe('Ex')
  })
})
