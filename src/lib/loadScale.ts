import { SCALES } from './scales'
import type { Scale } from '../data/schemas'

function isScaleEntry(entry: [string, Scale | null]): entry is [string, Scale] {
  return entry[1] !== null
}

export const SCALE_LIST = Object.entries(SCALES)
  .filter(isScaleEntry)
  .map(([id, v]) => ({ id, name: v.name, description: v.description }))

export function loadScaleById(id: string): Scale | null {
  return SCALES[id] ?? null
}
