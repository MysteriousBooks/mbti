import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Quiz } from './Quiz'
import type { Scale } from '../data/schemas'

const scale: Scale = {
  id: 't', name: '', description: '',
  dimensions: [{ id: 'ei', name: '', poles: ['E', 'I'], descriptions: { E: '', I: '' } }],
  questions: [
    { id: 'q1', text: '第一题', dimensionId: 'ei', options: [{ text: '选A', pole: 'E', weight: 2 }, { text: '选B', pole: 'I', weight: 1 }] },
    { id: 'q2', text: '第二题', dimensionId: 'ei', options: [{ text: '选C', pole: 'E', weight: 2 }, { text: '选D', pole: 'I', weight: 1 }] },
  ],
  types: {},
}

describe('Quiz', () => {
  it('显示进度 第1/2，点选项A 调用 onAnswer(q1,0)', () => {
    const onAnswer = vi.fn()
    render(<Quiz scale={scale} answers={{}} onAnswer={onAnswer} onComplete={vi.fn()} />)
    expect(screen.getByText(/第 1 \/ 2 题/)).toBeInTheDocument()
    fireEvent.click(screen.getByText('选A'))
    expect(onAnswer).toHaveBeenCalledWith('q1', 0)
  })
  it('最后一题选中后调用 onComplete', () => {
    const onComplete = vi.fn()
    render(<Quiz scale={scale} answers={{ q1: 0 }} onAnswer={vi.fn()} onComplete={onComplete} />)
    fireEvent.click(screen.getByText('选C'))
    expect(onComplete).toHaveBeenCalled()
  })
  it('键盘 1 选项0，2 选项1', () => {
    const onAnswer = vi.fn()
    render(<Quiz scale={scale} answers={{}} onAnswer={onAnswer} onComplete={vi.fn()} />)
    fireEvent.keyDown(window, { key: '1' })
    expect(onAnswer).toHaveBeenCalledWith('q1', 0)
  })
  it('上一题按钮可回溯', () => {
    render(<Quiz scale={scale} answers={{ q1: 0 }} onAnswer={vi.fn()} onComplete={vi.fn()} />)
    const prev = screen.getByText('上一题')
    fireEvent.click(prev)
    expect(screen.getByText(/第 1 \/ 2 题/)).toBeInTheDocument()
  })
  it('Backspace 回上一题', () => {
    render(<Quiz scale={scale} answers={{ q1: 0 }} onAnswer={vi.fn()} onComplete={vi.fn()} />)
    fireEvent.keyDown(window, { key: 'Backspace' })
    expect(screen.getByText(/第 1 \/ 2 题/)).toBeInTheDocument()
  })
  it('ArrowRight 仅对已答题前进', () => {
    const onAnswer = vi.fn()
    render(<Quiz scale={scale} answers={{ q1: 0 }} onAnswer={onAnswer} onComplete={vi.fn()} />)
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText(/第 2 \/ 2 题/)).toBeInTheDocument()
    expect(onAnswer).not.toHaveBeenCalled()
  })
  it('ArrowRight 对未答题不前进', () => {
    render(<Quiz scale={scale} answers={{}} onAnswer={vi.fn()} onComplete={vi.fn()} />)
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText(/第 1 \/ 2 题/)).toBeInTheDocument()
  })
  it('第 1 题时"上一题"按钮禁用', () => {
    render(<Quiz scale={scale} answers={{}} onAnswer={vi.fn()} onComplete={vi.fn()} />)
    expect(screen.getByRole('button', { name: '上一题' })).toBeDisabled()
  })
})