import type { ReactNode } from 'react'
export function Card({ children, selected, onClick }: { children: ReactNode; selected?: boolean; onClick?: () => void }) {
  return (
    <button type="button" className={`card${selected ? ' card-selected' : ''}`} onClick={onClick} aria-pressed={selected}>
      {children}
    </button>
  )
}