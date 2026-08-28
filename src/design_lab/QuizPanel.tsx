import type { Question } from '../data/schemas'

// 答题面板：复用 index.css 的 quiz-options/card/quiz-option-key 样式，
// 保证与正式答题页观感一致，变体间对比才公平。
export function QuizPanel({ q, dimName, index, total, selected, onChoose }: {
  q: Question
  /** 维度名徽章（仅维度主题变体显示） */
  dimName?: string
  index: number
  total: number
  selected?: 0 | 1
  onChoose: (optionIndex: 0 | 1) => void
}) {
  return (
    <div className="dl-quiz">
      <p className="dl-quiz-meta">
        <span className="quiz-progress-label">第 {index + 1} / {total} 题</span>
        {dimName ? <span className="dl-dim-badge">{dimName}</span> : null}
      </p>
      <h3 className="quiz-text">{q.text}</h3>
      <div className="quiz-options">
        {q.options.map((o, i) => (
          <button
            key={o.text}
            type="button"
            className={`card${selected === i ? ' card-selected' : ''}`}
            aria-pressed={selected === i}
            onClick={() => onChoose(i as 0 | 1)}
          >
            <span className="quiz-option-key">{i === 0 ? '1' : '2'}</span>
            <span>{o.text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function ReplayButton({ onReplay }: { onReplay: () => void }) {
  return (
    <button type="button" className="dl-replay" onClick={onReplay}>↺ 重玩</button>
  )
}
