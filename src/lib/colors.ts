import type { PlanId } from '../config/plans'

export const planColor = (id: PlanId) => `var(--plan-${id})`

/** Colour follows the model, never its rank in a given chart: slot n is --model-n. */
const MODEL_SLOTS = ['Sonnet 5', 'Opus 5', 'Opus 5.5', 'Haiku 4.5', 'Sonnet 5.5', 'Haiku 5.5']
export const modelColor = (model: string) => {
  const i = MODEL_SLOTS.indexOf(model)
  return i >= 0 ? `var(--model-${i + 1})` : 'var(--muted)'
}
