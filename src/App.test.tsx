import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { App } from './App'
import { SCALES } from './lib/scales'

// App 集成测试：锁定"换套量表"行为 —— 切换到列表中另一套量表并重新开始答题
// （曾硬编码 classic↔plus 二值切换，量表扩充到 3+ 套时会失效；实现已改为 SCALE_LIST 驱动）

function answerAll() {
  // 每题点第一个选项卡，直到出现结果页
  for (let i = 0; i < 200; i++) {
    if (screen.queryByText('你的类型是')) return
    const card = document.querySelector('.quiz-options button')
    expect(card, `第 ${i} 题未渲染选项卡`).not.toBeNull()
    fireEvent.click(card!)
  }
  throw new Error('答题循环超限：未到达结果页')
}

describe('App 换套量表', () => {
  it('classic 结果页点"换套量表" → 进入另一套量表的第 1 题', () => {
    render(<App />)
    fireEvent.click(screen.getByText(SCALES.classic!.name))
    answerAll()
    expect(screen.getByText('你的类型是')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '换套量表' }))
    // classic 64 题 → 另一套是 plus 80 题
    expect(screen.getByText(/第 1 \/ 80 题/)).toBeInTheDocument()
  })

  it('plus 结果页点"换套量表" → 进入另一套量表的第 1 题', () => {
    render(<App />)
    fireEvent.click(screen.getByText(SCALES.plus!.name))
    answerAll()
    expect(screen.getByText('你的类型是')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '换套量表' }))
    // plus 80 题 → 另一套是 classic 64 题
    expect(screen.getByText(/第 1 \/ 64 题/)).toBeInTheDocument()
  })
})