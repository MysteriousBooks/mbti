import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Result } from './Result'
import type { ScoreResult } from '../lib/scoring'
import type { Scale } from '../data/schemas'

const result: ScoreResult = {
  typeCode: 'INxJ',
  typeName: '建筑师 / 调停者',
  summary: '你是 INTJ 与 INFJ 倾向接近的人。',
  traits: ['理性', '共情'],
  dimensions: [
    { dimensionId: 'ei', primary: 'I', percentage: 30, status: 'low' },
    { dimensionId: 'tf', primary: null, percentage: 50, status: 'neutral' },
  ],
}

// 测试只需 scale.dimensions 渲染维度行，构造符合 Scale 部分结构的最小对象
const scale = {
  dimensions: [
    { id: 'ei', name: 'EI', poles: ['E', 'I'], descriptions: { E: '', I: '' } },
    { id: 'tf', name: 'TF', poles: ['T', 'F'], descriptions: { T: '', F: '' } },
  ],
} as unknown as Scale

describe('Result', () => {
  it('显示类型码与绰号', () => {
    render(<Result result={result} scale={scale} onRetest={vi.fn()} onSwitchScale={vi.fn()} />)
    // 类型码分格渲染（每字母一个 span），完整码由 aria-label 提供
    expect(screen.getByRole('img', { name: 'INXJ' })).toBeInTheDocument()
    expect(screen.getByText(/建筑师/)).toBeInTheDocument()
  })
  it('居中维度显示"居中"标签', () => {
    render(<Result result={result} scale={scale} onRetest={vi.fn()} onSwitchScale={vi.fn()} />)
    // 居中维度卡正面显示「倾向居中」；顶部 x 提示也同时存在
    expect(screen.getByText('倾向居中')).toBeInTheDocument()
    expect(screen.getByText('? = 两极倾向接近（居中）')).toBeInTheDocument()
  })
  it('点击"重新测试"与"换套量表"回调', () => {
    const onRetest = vi.fn(), onSwitch = vi.fn()
    render(<Result result={result} scale={scale} onRetest={onRetest} onSwitchScale={onSwitch} />)
    fireEvent.click(screen.getByRole('button', { name: '重新测试' }))
    fireEvent.click(screen.getByRole('button', { name: '换套量表' }))
    expect(onRetest).toHaveBeenCalled()
    expect(onSwitch).toHaveBeenCalled()
  })
  it('5 位码（升级版）显示为带连字符格式', () => {
    const plusResult: ScoreResult = { ...result, typeCode: 'ESTJA' }
    render(<Result result={plusResult} scale={scale} onRetest={vi.fn()} onSwitchScale={vi.fn()} />)
    expect(screen.getByRole('img', { name: 'ESTJ-A' })).toBeInTheDocument()
  })

  it('居中态（含候选类型）渲染筛选按钮 + 详情面板（D 变体）', () => {
    // 构造 2 候选的居中态结果：x2 类型 + candidates 结构化字段
    const neutralResult: ScoreResult = {
      ...result,
      typeCode: 'INxJ',
      candidates: [
        { code: 'INTJ', name: '建筑师', summary: 'intj 完整描述', traits: ['理性', '独立', '远见'] },
        { code: 'INFJ', name: '调停者', summary: 'infj 完整描述', traits: ['共情', '理想', '深刻'] },
      ],
    }
    render(<Result result={neutralResult} scale={scale} onRetest={vi.fn()} onSwitchScale={vi.fn()} />)
    // 候选筛选按钮（默认选中第 0 个）
    expect(screen.getByRole('button', { name: '建筑师' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '调停者' })).toBeInTheDocument()
    // 详情面板展示默认候选的前 3 条特质
    expect(screen.getByText('intj 完整描述')).toBeInTheDocument()
    expect(screen.getByText('远见')).toBeInTheDocument()
    // 点选切换
    fireEvent.click(screen.getByRole('button', { name: '调停者' }))
    expect(screen.getByText('infj 完整描述')).toBeInTheDocument()
    expect(screen.getByText('理想')).toBeInTheDocument()
  })

  it('classic 量表即使维度多于 4 个也不显示坚断徽章（按 scale.id 判断）', () => {
    // 回归：曾按 dimensions.length > 4 猜测量表身份，量表扩充维度会误判
    // 构造 5 维度 classic：旧逻辑 length>4 会误判为 plus 显示徽章
    const dims = [1, 2, 3, 4, 5].map(n => ({ id: 'd' + n, name: 'D' + n, poles: ['X', 'Y'], descriptions: { X: '', Y: '' } }))
    const classic5 = { ...scale, id: 'classic', dimensions: dims } as unknown as Scale
    const result5: ScoreResult = {
      ...result,
      dimensions: dims.map(d => ({ dimensionId: d.id, primary: null, percentage: 50, status: 'neutral' as const })),
    }
    render(<Result result={result5} scale={classic5} onRetest={vi.fn()} onSwitchScale={vi.fn()} />)
    expect(screen.queryByText('坚断')).not.toBeInTheDocument()
  })
})