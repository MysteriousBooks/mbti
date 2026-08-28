import { describe, it, expect, vi } from 'vitest'
import { SCALES, warnIfScaleUnbalanced } from './scales'
import type { Scale } from '../data/schemas'

// 合成最小量表：1 维度 N 题，每题两选项覆盖两极、权重由入参指定
function makeScale(weights: [number, number][]): Scale {
  const poles: [string, string] = ['AH', 'AL']
  return {
    id: 't',
    name: '测试',
    description: '',
    dimensions: [{ id: 'a', name: 'a', poles, descriptions: { AH: '高', AL: '低' } }],
    questions: weights.map(([h, l], i) => ({
      id: `a-${i + 1}`,
      text: `题 ${i + 1}`,
      dimensionId: 'a',
      options: [
        { text: '甲', pole: poles[0], weight: h },
        { text: '乙', pole: poles[1], weight: l },
      ],
    })),
    types: {},
  }
}

describe('warnIfScaleUnbalanced（dev 加载告警）', () => {
  it('两选项等权的题库不告警', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      warnIfScaleUnbalanced(makeScale([[3, 3], [2, 2]]))
      expect(warn).not.toHaveBeenCalled()
    } finally {
      warn.mockRestore()
    }
  })

  it('任一题两选项权重不等即告警并指出题目与权重', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      warnIfScaleUnbalanced(makeScale([[2, 2], [3, 1]]))
      expect(warn).toHaveBeenCalledTimes(1)
      const msg = String(warn.mock.calls[0]?.[0])
      expect(msg).toContain('a-2')
      expect(msg).toContain('3/1')
    } finally {
      warn.mockRestore()
    }
  })

  it('已注册量表解析成功（classic/plus 非 null 且不触发告警）', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      expect(SCALES.classic).not.toBeNull()
      expect(SCALES.plus).not.toBeNull()
      expect(warn).not.toHaveBeenCalled()
    } finally {
      warn.mockRestore()
    }
  })
})