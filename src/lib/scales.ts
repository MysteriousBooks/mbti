import classic from '../data/classic.json'
import plus from '../data/plus.json'
import { ScaleSchema, type Scale } from '../data/schemas'

function parse(raw: unknown): Scale | null {
  const r = ScaleSchema.safeParse(raw)
  if (!r.success) {
    console.error('[mbti] 量表校验失败', r.error)
    return null
  }
  warnIfScaleUnbalanced(r.data)
  return r.data
}

/** dev 环境校验等权约定：任一题两选项权重不等即告警（两极失衡必先表现为单题不等权） */
export function warnIfScaleUnbalanced(scale: Scale): void {
  if (!import.meta.env.DEV) return
  for (const q of scale.questions) {
    const [a, b] = q.options
    if (a.weight !== b.weight) {
      console.warn(
        `[mbti] 量表 ${scale.id} 题目 ${q.id} 两选项权重不等（${a.weight}/${b.weight}），抽题分层与两极平衡依赖等权约定`,
      )
    }
  }
}

export const SCALES: Record<string, Scale | null> = {
  classic: parse(classic),
  plus: parse(plus),
}
