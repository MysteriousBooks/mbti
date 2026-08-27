import { useState } from 'react'
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

// 类型码分格渲染：5 位码拆成单字母格 + 连字符分隔格，逐格弹出；居中格标记 isX
function formatCodeCells(code: string): { ch: string; sep?: boolean; isX?: boolean }[] {
  if (code.length !== 5) return code.split('').map(ch => ({ ch, isX: ch.toLowerCase() === 'x' }))
  const cells: { ch: string; sep?: boolean; isX?: boolean }[] = []
  for (let i = 0; i < code.length; i++) {
    cells.push({ ch: code[i], isX: code[i].toLowerCase() === 'x' })
    if (i === code.length - 2) cells.push({ ch: '-', sep: true })
  }
  return cells
}

export function Result({ result, scale, onRetest, onSwitchScale }: ResultProps) {
  const isPlus = scale.id === 'plus'
  const codeCells = formatCodeCells(result.typeCode.toUpperCase())
  const hasCandidates = (result.candidates?.length ?? 0) > 1
  const [sel, setSel] = useState(0)
  const cur = hasCandidates ? result.candidates![sel] : null
  return (
    <main className="screen result f-result">
      <header className="result-head">
        <p className="f-kicker">你的类型是</p>
        <div className="f-code" role="img" aria-label={formatTypeCode(result.typeCode.toUpperCase())}>
          {codeCells.map((cell, i) => (
            <span
              key={i}
              className={cell.sep ? 'f-code-sep' : cell.isX ? 'f-code-cell-x' : undefined}
              style={cell.sep ? undefined : { rotate: `${i % 2 === 0 ? -4 : 3}deg`, animationDelay: `${i * 60}ms` }}
            >
              {cell.isX ? '?' : cell.ch}
            </span>
          ))}
          {isPlus && <span className="f-assert-badge" title="坚断型 Assertive">坚断</span>}
        </div>
        {codeCells.some(c => c.isX) && (
          <p className="f-x-hint">? = 两极倾向接近（居中）</p>
        )}
        <div className="result-name">{result.typeName}</div>
      </header>

      {/* 居中态：候选类型筛选按钮 + 黄底详情面板（D 变体） */}
      {hasCandidates && (
        <section className="f-candidates" aria-label="候选类型">
          <p className="f-candidates-lead f-summary">{result.summary}</p>
          <div className="f-candidates-bar">
            {result.candidates!.map((c, i) => (
              <button
                key={c.code}
                type="button"
                aria-pressed={i === sel}
                className={`f-cand-btn${i === sel ? ' is-sel' : ''}`}
                onClick={() => setSel(i)}
                style={{ animationDelay: `${250 + i * 40}ms` }}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div key={cur!.code} className="f-cand-panel" style={{ borderRadius: 'var(--radius-card)' }}>
            <strong className="f-cand-panel-name">{cur!.name}</strong>
            <ul className="f-cand-panel-traits">
              {cur!.traits.map(t => <li key={t}>{t}</li>)}
            </ul>
            <p className="f-cand-panel-summary">{cur!.summary}</p>
          </div>
        </section>
      )}

      {!hasCandidates && <p className="f-summary">{result.summary}</p>}

      <p className="f-dims-hint">点击卡片翻面，看维度详细解读 ↻</p>
      <section className={`f-flip-grid${isPlus ? ' is-plus' : ''}`} aria-label="维度卡片，点击翻面看解读">
        {result.dimensions.map((ds, i) => {
          const dim = scale.dimensions.find(d => d.id === ds.dimensionId)
          if (!dim) return null
          return <FlipCard key={ds.dimensionId} dim={dim} ds={ds} tilt={i % 2 === 0 ? -0.8 : 0.8} isAssert={isPlus && i === result.dimensions.length - 1} />
        })}
      </section>

      {result.traits.length > 0 && (
        <div className="f-traits" aria-label="特质标签">
          {result.traits.slice(0, 8).map((t: string, i: number) => (
            <span key={t} className="f-trait" style={{ rotate: `${i % 2 === 0 ? -2 : 1.6}deg` }}>{t}</span>
          ))}
        </div>
      )}

      <footer className="result-actions">
        <Button variant="primary" onClick={onRetest}>重新测试</Button>
        <Button variant="ghost" onClick={onSwitchScale}>换套量表</Button>
      </footer>
    </main>
  )
}

function FlipCard({ dim, ds, tilt, isAssert }: {
  dim: Dimension
  ds: DimensionScore
  tilt: number
  isAssert: boolean
}) {
  const [flipped, setFlipped] = useState(false)
  const isNeutral = ds.status === 'neutral'
  const pct = ds.percentage
  const primaryLabel = isNeutral ? '居中' : (ds.primary ?? '')
  // 背面文案：居中给中性说明，否则给该极详细描述
  const backText = isNeutral
    ? '你的两极倾向接近，两种描述都适用，建议在放松状态下如实重测。'
    : dim.descriptions[ds.primary as string] ?? ''
  return (
    <div className={`f-flip${flipped ? ' is-flipped' : ''}${isAssert ? ' is-assert' : ''}`}>
      <button
        type="button"
        className="f-flip-inner"
        onClick={() => setFlipped(f => !f)}
        aria-pressed={flipped}
        aria-label={`${dim.name}，${pct}%，点击${flipped ? '翻回' : '翻面'}看详细解读`}
      >
        <span className="f-flip-front" style={{ rotate: `${tilt}deg` }}>
          <span className="f-flip-name">{dim.name}</span>
          <strong className="f-flip-primary">{isNeutral ? '倾向居中' : `${primaryLabel} ${pct}%`}</strong>
          <span className="f-flip-bar"><i style={{ width: `${pct}%` }} /></span>
          <span className="f-flip-pct">{pct}%</span>
          <em className="f-flip-hint">翻面 ↻</em>
        </span>
        <span className="f-flip-back">
          <strong>{isNeutral ? '两极接近' : `${primaryLabel} ${pct}%`}</strong>
          <p>{backText}</p>
        </span>
      </button>
    </div>
  )
}