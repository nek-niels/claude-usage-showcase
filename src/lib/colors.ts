import type { PlanId } from '../config/plans'
import { sortModels } from './aggregate'

export const planColor = (id: PlanId) => `var(--plan-${id})`

/** Colour follows the model, never its rank in a given chart. */
const MODEL_SLOTS = sortModels(['Sonnet 5', 'Opus 5', 'Opus 5.5', 'Haiku 4.5'])
export const modelColor = (model: string) => {
  const i = MODEL_SLOTS.indexOf(model)
  return i >= 0 ? `var(--model-${i + 1})` : 'var(--muted)'
}
