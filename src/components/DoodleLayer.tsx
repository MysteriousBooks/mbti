import type { CSSProperties } from 'react'
import type { DoodlePlacement } from '../lib/doodles'
import { DOODLE_SVGS } from '../lib/doodles'

/**
 * pulseClass：交替传入 'is-pulse-a' / 'is-pulse-b' 可让既有涂鸦重放跳动动画
 * （同名动画需 class 变化才会重放，两个等价 class 交替即可）
 */
export function DoodleLayer({ items, pulseClass }: { items: DoodlePlacement[]; pulseClass?: 'is-pulse-a' | 'is-pulse-b' }) {
  return (
    <div className="dl-layer" aria-hidden="true">
      {items.map(p => (
        <span
          key={p.id}
          className={`dl-doodle${p.faded ? ' is-faded' : ''}${pulseClass ? ` ${pulseClass}` : ''}`}
          style={
            {
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              backgroundImage: `url("${DOODLE_SVGS[p.kind]}")`,
              '--rot': `${p.rot}deg`,
              '--delay': `${p.delay}ms`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
