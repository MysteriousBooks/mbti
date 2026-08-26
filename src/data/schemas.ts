import { z } from 'zod'

export const ScaleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  dimensions: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    poles: z.tuple([z.string(), z.string()]),
    descriptions: z.record(z.string(), z.string()),
  })).min(1),
  questions: z.array(z.object({
    id: z.string().min(1),
    text: z.string().min(1),
    dimensionId: z.string(),
    options: z.tuple([
      z.object({ text: z.string().min(1), pole: z.string().min(1), weight: z.number().int().min(1).max(3) }),
      z.object({ text: z.string().min(1), pole: z.string().min(1), weight: z.number().int().min(1).max(3) }),
    ]),
  })).min(1),
  types: z.record(z.string(), z.object({
    code: z.string(),
    name: z.string(),
    summary: z.string(),
    traits: z.array(z.string()),
  })),
}).superRefine((s, ctx) => {
  const dimMap = new Map(s.dimensions.map(d => [d.id, d]))
  for (const q of s.questions) {
    const dim = dimMap.get(q.dimensionId)
    if (!dim) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `题目 ${q.id} 指向不存在的维度 ${q.dimensionId}`, path: ['questions', q.id, 'dimensionId'] })
      continue
    }
    const poles = new Set(q.options.map(o => o.pole))
    if (poles.size !== 2 || !dim.poles.every(p => poles.has(p))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `题目 ${q.id} 的两选项 pole 必须恰好覆盖维度 ${q.dimensionId} 的两极 ${dim.poles.join('/')}`,
        path: ['questions', q.id, 'options'],
      })
    }
  }
})

export type Scale = z.infer<typeof ScaleSchema>
export type Dimension = Scale['dimensions'][number]
export type Question = Scale['questions'][number]
export type Option = Question['options'][number]
export type TypeResult = Scale['types'][string]
export type Pole = string