import { SCALE_LIST } from '../lib/loadScale'
import { Card } from './ui/Card'

export function ScaleSelect({ onSelect }: { onSelect: (scaleId: string) => void }) {
  return (
    <main className="screen">
      <header className="screen-head">
        <h1>MBTI 性格测试</h1>
        <p>选择一个版本开始</p>
      </header>
      <div className="scale-list">
        {SCALE_LIST.map(s => (
          <Card key={s.id} onClick={() => onSelect(s.id)}>
            <h2>{s.name}</h2>
            <p>{s.description}</p>
          </Card>
        ))}
      </div>
    </main>
  )
}