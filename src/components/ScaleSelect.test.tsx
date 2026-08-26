import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ScaleSelect } from './ScaleSelect'

vi.mock('../lib/loadScale', () => ({
  SCALE_LIST: [
    { id: 'classic', name: '经典版', description: '经典' },
    { id: 'plus', name: '升级版', description: '升级' },
  ],
}))

describe('ScaleSelect', () => {
  it('显示两套量表选项，点击回调 id', async () => {
    const onSelect = vi.fn()
    render(<ScaleSelect onSelect={onSelect} />)
    expect(screen.getByText('经典版')).toBeInTheDocument()
    expect(screen.getByText('升级版')).toBeInTheDocument()
    await userEvent.click(screen.getByText('升级版'))
    expect(onSelect).toHaveBeenCalledWith('plus')
  })
})