import type { ScoreResult, DimensionScore } from '../lib/scoring'
import type { Scale, Dimension } from '../data/schemas'
import { Button } from './ui/Button'

type ResultProps = {
  result: ScoreResult
  scale: Scale
  onRetest: () => void
  onSwitchScale: () => void
}

// 5 位码（升级版）在倒数第 2 位前加连字符：ESTJA → ESTJ-A
function formatTypeCode(code: string): string {
  return code.length === 5 ? `${code.slice(0, 4)}-${code.slice(4)}` : code
}

export function Result({ result, scale, onRetest, onSwitchScale }: ResultProps) {
  return (
    <main className="screen result">
      <header className="result-head">
        <div className="result-code"><span>{formatTypeCode(result.typeCode)}</span></div>
        <div className="result-name">{result.typeName}</div>
      </header>

      <section className="result-dims">
        {scale.dimensions.map((dim: Dimension) => {
          const ds: DimensionScore | undefined = result.dimensions.find(d => d.dimensionId === dim.id)
          if (!ds) return null
          const label = ds.status === 'neutral' ? '居中' : `${ds.primary}`
          const neutral = ds.status === 'neutral'
          return (
            <div key={dim.id} className="dim-row">
              <div className="dim-labels"><span>{dim.poles[1]}</span><span>{dim.poles[0]}</span></div>
              <div className="dim-bar">
                <div className="dim-bar-mid" />
                <div className={`dim-bar-fill${neutral ? ' dim-bar-fill-neutral' : ''}`} style={{ transform: `scaleX(${ds.percentage / 100})` }} />
              </div>
              <div className="dim-pct">{label} {ds.percentage}%</div>
            </div>
          )
        })}
      </section>

      <section className="result-detail">
        <p className="result-summary">{result.summary}</p>
        {result.traits.length > 0 && (
          <ul className="result-traits">{result.traits.map((t: string) => <li key={t}>{t}</li>)}</ul>
        )}
      </section>

      <footer className="result-actions">
        <Button variant="primary" onClick={onRetest}>重新测试</Button>
        <Button variant="ghost" onClick={onSwitchScale}>换套量表</Button>
      </footer>
    </main>
  )
}