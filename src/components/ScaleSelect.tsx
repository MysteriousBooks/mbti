import { SCALE_LIST } from '../lib/loadScale'
import { Card } from './ui/Card'

// 首页 doodle 贴纸：第一张黄星星，第二张粉彩虹
const DOODLES = ['star', 'rainbow'] as const

export function ScaleSelect({ onSelect }: { onSelect: (scaleId: string) => void }) {
  return (
    <main className="screen f-select">
      <header className="screen-head">
        <p className="f-kicker">PERSONALITY SKETCH</p>
        <h1>MBTI <span className="f-mark">性格测试</span></h1>
        <p>拿起马克笔，画下你的类型</p>
      </header>
      <div className="scale-list f-scale-list">
        {SCALE_LIST.map((s, i) => (
          <Card key={s.id} onClick={() => onSelect(s.id)}>
            <span className="f-doodle" data-kind={DOODLES[i % 2]} aria-hidden="true" />
            <h2>{s.name}</h2>
            <p>{s.description}</p>
            <em className="f-start">开始 →</em>
          </Card>
        ))}
      </div>
    </main>
  )
}