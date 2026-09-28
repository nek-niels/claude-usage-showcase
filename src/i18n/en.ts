/** English copy. Other languages are typed against this, so a missing or misnamed entry fails the build. */
export const en = {
  title: 'Claude Code on Pro vs Max 5x',
  topbar: {
    brand: 'Pro vs Max 5x',
    toLight: 'Light mode',
    toDark: 'Dark mode',
    language: 'Language',
  },
  hero: {
    kicker: (from: string, to: string) => `Claude Code usage, ${from} to ${to}`,
    headline: (upgrade: string, ratio: string, base: string) =>
      `On ${upgrade}, I get through ${ratio} as much Claude Code work per day as on ${base}.`,
    sub: (plan: string, share: string, model: string) =>
      `Usage is measured as what the same tokens would cost on the API. On ${plan}, ${share} of it ran on ${model}.`,
    barsLabel: 'API-equivalent usage per active day, by plan',
    perActiveDay: 'per active day',
    caption: (base: string, baseDays: number, upgrade: string, upgradeDays: number) =>
      `API-equivalent usage per day I used Claude Code. ${base}: ${baseDays} active days. ${upgrade}: ${upgradeDays} active days so far.`,
  },
  perDay: {
    title: 'An average working day on each plan',
    lede: (base: string, baseDays: number, upgrade: string, upgradeDays: number) =>
      `${base} ran for ${baseDays} active days and ${upgrade} for only ${upgradeDays} so far, so every figure here is an average per day I used Claude Code.`,
    usage: 'API-equivalent usage',
    tokens: 'Tokens processed',
    output: 'Tokens written by Claude',
  },
  daily: {
    title: 'Every day I used it',
    lede: 'API-equivalent usage per active day, split by model. Weekends and days off are left out.',
    onPlan: (plan: string) => `On ${plan}`,
    total: 'Total',
    date: 'Date',
  },
  mix: {
    title: 'Which models did the work',
    lede: 'Share of API-equivalent usage by model. On Pro I rationed Opus and leaned on Sonnet. On Max 5x I could use the newest Opus for almost everything.',
    other: 'Other models',
  },
  compare: {
    title: 'The two plans side by side',
    lede: (base: string, upgrade: string) =>
      `Both plans returned far more than they cost. ${base} was already used hard, so it returned more per dollar. ${upgrade} is about capacity: more work per day, and on the strongest model.`,
    measure: 'Measure',
    change: 'Change',
    price: 'Subscription price',
    perMonth: (price: string) => `${price} / month`,
    period: 'Period',
    periodValue: (from: string, to: string, days: number) => `${from} to ${to} (${days} days)`,
    activeDays: 'Days I used Claude Code',
    usage: 'API-equivalent usage',
    usagePerDay: 'Usage per active day',
    tokensPerDay: 'Tokens per active day',
    outputPerDay: 'Output tokens per active day',
    reread: 'Context re-read per token written',
    periodCost: 'Subscription cost for the period',
    perDollar: 'Usage per $1 of subscription',
  },
  tokens: {
    title: (total: string) => `Where ${total} tokens came from`,
    lede: (share: string) =>
      `${share} of all tokens are Claude re-reading a codebase it has already loaded. That is why the token counts look so large next to the cost.`,
    kind: 'Kind',
    shareOfAll: 'Share of all',
    cacheRead: 'Re-read from cache',
    cacheReadNote: 'Code and context Claude has already seen. The cheapest kind.',
    cacheCreation: 'Written to cache',
    cacheCreationNote: 'Files and context loaded for the first time.',
    output: 'Written by Claude',
    outputNote: 'Code, edits, plans and answers.',
    input: 'Uncached input',
    inputNote: 'Almost everything else goes through the cache.',
  },
  reread: {
    title: 'Context re-read for each token Claude writes',
    lede: (baseValue: string, base: string, upgradeValue: string, upgrade: string) =>
      `Cache-read tokens divided by output tokens. It rises with bigger codebases and longer sessions, because every turn re-reads the whole conversation. It averaged ${baseValue} on ${base} and ${upgradeValue} on ${upgrade}.`,
    perToken: (value: string) => `${value} per token`,
    plan: 'Plan',
    column: 'Re-read per token written',
  },
  showNumbers: 'Show the numbers',
  method: {
    title: 'How these numbers were made',
    sourceBefore: 'The data comes from ',
    sourceAfter: (total: string) =>
      `, which reads the local Claude Code logs. API-equivalent usage across both plans comes to ${total}.`,
    apiEquivalent:
      'API-equivalent usage is what the same tokens would have cost at Anthropic API prices. It is not a bill: on a subscription I paid only the monthly price.',
    sample: (plan: string, days: number) =>
      `${plan} has ${days} active days so far, which is a small sample. The per-day averages will settle as more days come in.`,
    prorate: 'Subscription cost for a period is the monthly price prorated over a 30-day month.',
  },
}

export type Dict = typeof en
