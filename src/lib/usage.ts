import raw from '../../usage.json'

export interface TokenCounts {
  inputTokens: number
  outputTokens: number
  cacheCreationTokens: number
  cacheReadTokens: number
}

export interface ModelBreakdown extends TokenCounts {
  modelName: string
  cost: number
}

export interface DailyUsage extends TokenCounts {
  date: string
  totalCost: number
  totalTokens: number
  modelBreakdowns: ModelBreakdown[]
}

export interface UsageExport {
  daily: DailyUsage[]
  totals: TokenCounts & { totalCost: number; totalTokens: number }
}

export const usage = raw as UsageExport
