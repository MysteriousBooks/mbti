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
    expect(screen.getByText('INxJ')).toBeInTheDocument()
    expect(screen.getByText(/建筑师/)).toBeInTheDocument()
  })
  it('居中维度显示"居中"标签', () => {
    render(<Result result={result} scale={scale} onRetest={vi.fn()} onSwitchScale={vi.fn()} />)
    expect(screen.getByText(/居中/)).toBeInTheDocument()
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
    expect(screen.getByText('ESTJ-A')).toBeInTheDocument()
  })
})