import classic from '../data/classic.json'
import plus from '../data/plus.json'
import { ScaleSchema, type Scale } from '../data/schemas'

function parse(raw: unknown): Scale | null {
  const r = ScaleSchema.safeParse(raw)
  if (!r.success) {
    console.error('[mbti] 量表校验失败', r.error)
    return null
  }
  return r.data
}

export const SCALES: Record<string, Scale | null> = {
  classic: parse(classic),
  plus: parse(plus),
}
