import type { Dict } from './en'

export const da: Dict = {
  title: 'Claude Code på Pro og Max 5x',
  topbar: {
    brand: 'Pro og Max 5x',
    toLight: 'Lyst tema',
    toDark: 'Mørkt tema',
    language: 'Sprog',
  },
  hero: {
    kicker: (from, to) => `Brug af Claude Code, ${from} til ${to}`,
    headline: (upgrade, ratio, base) =>
      `På ${upgrade} får jeg lavet ${ratio} så meget arbejde med Claude Code om dagen som på ${base}.`,
    sub: (plan, share, model) =>
      `Forbruget er målt som det, de samme tokens ville have kostet via API’et. På ${plan} kørte ${share} af det på ${model}.`,
    barsLabel: 'Forbrug i API-priser pr. aktiv dag, fordelt på abonnement',
    perActiveDay: 'pr. aktiv dag',
    caption: (base, baseDays, upgrade, upgradeDays) =>
      `Forbrug i API-priser pr. dag, hvor jeg brugte Claude Code. ${base}: ${baseDays} aktive dage. ${upgrade}: ${upgradeDays} aktive dage indtil videre.`,
  },
  perDay: {
    title: 'En gennemsnitlig arbejdsdag på hvert abonnement',
    lede: (base, baseDays, upgrade, upgradeDays) =>
      `${base} kørte i ${baseDays} aktive dage og ${upgrade} kun i ${upgradeDays} indtil videre, så alle tal her er et gennemsnit pr. dag, hvor jeg brugte Claude Code.`,
    usage: 'Forbrug i API-priser',
    tokens: 'Tokens behandlet',
    output: 'Tokens skrevet af Claude',
  },
  daily: {
    title: 'Alle de dage, jeg brugte det',
    lede: 'Forbrug i API-priser pr. aktiv dag, fordelt på model. Weekender og fridage er udeladt.',
    onPlan: (plan) => `På ${plan}`,
    total: 'I alt',
    date: 'Dato',
  },
  mix: {
    title: 'Hvilke modeller lavede arbejdet',
    lede: 'Andel af forbruget i API-priser, fordelt på model. På Pro rationerede jeg Opus og lænede mig op ad Sonnet. På Max 5x kunne jeg bruge den nyeste Opus til næsten alt.',
    other: 'Andre modeller',
  },
  compare: {
    title: 'De to abonnementer side om side',
    lede: (base, upgrade) =>
      `Begge abonnementer gav langt mere, end de kostede. ${base} blev allerede brugt hårdt, så det gav mest pr. dollar. ${upgrade} handler om kapacitet: mere arbejde om dagen, og på den stærkeste model.`,
    measure: 'Mål',
    change: 'Ændring',
    price: 'Abonnementspris',
    perMonth: (price) => `${price} / md.`,
    period: 'Periode',
    periodValue: (from, to, days) => `${from} til ${to} (${days} dage)`,
    activeDays: 'Dage, jeg brugte Claude Code',
    usage: 'Forbrug i API-priser',
    usagePerDay: 'Forbrug pr. aktiv dag',
    tokensPerDay: 'Tokens pr. aktiv dag',
    outputPerDay: 'Output-tokens pr. aktiv dag',
    reread: 'Kontekst genlæst pr. skrevet token',
    periodCost: 'Abonnementspris for perioden',
    perDollar: 'Forbrug pr. dollar i abonnement',
  },
  tokens: {
    title: (total) => `Hvor de ${total} tokens kom fra`,
    lede: (share) =>
      `${share} af alle tokens er Claude, der genlæser en kodebase, den allerede har indlæst. Derfor ser antallet af tokens så stort ud i forhold til prisen.`,
    kind: 'Type',
    shareOfAll: 'Andel af alle',
    cacheRead: 'Genlæst fra cache',
    cacheReadNote: 'Kode og kontekst, Claude allerede har set. Den billigste slags.',
    cacheCreation: 'Skrevet til cache',
    cacheCreationNote: 'Filer og kontekst, der indlæses for første gang.',
    output: 'Skrevet af Claude',
    outputNote: 'Kode, rettelser, planer og svar.',
    input: 'Input uden cache',
    inputNote: 'Næsten alt andet går gennem cachen.',
  },
  reread: {
    title: 'Genlæst kontekst for hvert token, Claude skriver',
    lede: (baseValue, base, upgradeValue, upgrade) =>
      `Tokens læst fra cache divideret med output-tokens. Tallet stiger med større kodebaser og længere sessioner, fordi hver tur genlæser hele samtalen. Det lå i gennemsnit på ${baseValue} på ${base} og ${upgradeValue} på ${upgrade}.`,
    perToken: (value) => `${value} pr. token`,
    plan: 'Abonnement',
    column: 'Genlæst pr. skrevet token',
  },
  showNumbers: 'Vis tallene',
  method: {
    title: 'Sådan er tallene lavet',
    sourceBefore: 'Dataene kommer fra ',
    sourceAfter: (total) =>
      `, som læser de lokale Claude Code-logfiler. Forbruget i API-priser for begge abonnementer løber op i ${total}.`,
    apiEquivalent:
      'Forbrug i API-priser er det, de samme tokens ville have kostet med Anthropics API-priser. Det er ikke en regning: på et abonnement betalte jeg kun månedsprisen.',
    sample: (plan, days) =>
      `${plan} har kun ${days} aktive dage indtil videre, og det er et lille grundlag. Gennemsnittene pr. dag vil falde på plads, efterhånden som der kommer flere dage til.`,
    prorate: 'Abonnementsprisen for en periode er månedsprisen fordelt over en måned på 30 dage.',
  },
}
