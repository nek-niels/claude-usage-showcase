import type { Dict } from './en'

export const da: Dict = {
  title: 'Claude Code på Pro og Max 5x',
  topbar: {
    brand: 'Forbrugsbladet',
    subject: 'Claude Code, Pro og Max 5x',
    edition: (date) => `Personlig udgave, ${date}`,
    toLight: 'Lyst tema',
    toDark: 'Mørkt tema',
    language: 'Sprog',
  },
  hero: {
    kicker: (from, to, activeDays, calendarDays) =>
      `${from} til ${to}. Claude Code i brug ${activeDays} af ${calendarDays} dage.`,
    headline: (upgrade, ratio, base) =>
      `${upgrade} giver mig ${ratio} så meget Claude Code-arbejde om dagen som ${base}`,
    sub: (plan, share, model) =>
      `Forbruget er målt som det, de samme tokens ville have kostet via API’et. På ${plan} kørte ${share} af det på ${model}.`,
    barsLabel: 'Forbrug i API-priser pr. aktiv dag, fordelt på abonnement',
    chartTitle: 'Forbrug pr. aktiv dag',
    chartUnit: 'I API-priser, US$',
    caption: (base, baseDays, upgrade, upgradeDays) =>
      `Gennemsnit over de dage, hvor jeg brugte Claude Code. ${base}: ${baseDays} aktive dage. ${upgrade}: ${upgradeDays} aktive dage indtil videre.`,
    source: 'Kilde: daglig eksport fra ccusage (usage.json)',
  },
  tape: {
    label: 'Datolinje',
    stories: {
      front: 'Forsiden',
      record: 'Rekorden',
      averageDay: 'En gennemsnitsdag',
      cache: 'Cachen',
      closing: 'Slutopgørelse',
    },
    plan: 'Abonnement',
    day: 'Dagen',
    noSession: 'Ingen brug',
    total: 'API-værdi',
    totalShort: 'Værdi',
    paid: 'Betalt til dato',
    multiple: 'Faktor',
    dayOf: (n, total) => `Dag ${n} af ${total}`,
    dayOfLabel: 'Placering',
    closing: 'Lukket',
    ticks: 'Gå til en dag',
    tickLabel: (date, usage) => `${date}: ${usage}`,
    menu: 'Indhold',
  },
  perDay: {
    kicker: 'Analyse',
    title: (base, upgrade) => `En gennemsnitlig arbejdsdag, ${base} mod ${upgrade}`,
    lede: (base, baseDays, upgrade, upgradeDays) =>
      `${base} kørte i ${baseDays} aktive dage og ${upgrade} kun i ${upgradeDays} indtil videre, så alle tal her er et gennemsnit pr. dag, hvor jeg brugte Claude Code.`,
    usage: 'Forbrug i API-priser',
    tokens: 'Tokens behandlet',
    output: 'Tokens skrevet af Claude',
    ratioNote: (upgrade, base) => `${upgrade} som et multiplum af ${base}`,
  },
  daily: {
    title: 'Forløbet, dag for dag',
    unitLabel: 'Vis som',
    units: {
      cost: {
        name: 'API-pris',
        lede: 'Forbrug i API-priser pr. kalenderdag, fordelt på model. En prik på grundlinjen markerer en dag uden session.',
      },
      tokens: {
        name: 'Antal tokens',
        lede: 'Tokens pr. kalenderdag, fordelt på slags. En prik på grundlinjen markerer en dag uden session.',
      },
    },
    onPlan: (plan) => `På ${plan}`,
    total: 'I alt',
    date: 'Dato',
    noSession: 'Ingen session',
  },
  mix: {
    title: 'Modelfordeling indtil nu',
    other: 'Andre modeller',
    notYet: (date) => `Fra ${date}`,
  },
  chronicle: {
    record: (plan, value) => `${plan}-rekord ${value}`,
    stopPress: 'Stop pressen',
    zoomed: (from, to) => `Skalaen er zoomet ud fra ${from} til ${to}`,
    pro: {
      headline: (plan) => `En stabil måned på ${plan}`,
      body: (plan, days, perDay) =>
        `Hver søjle er én kalenderdag. På ${plan} brugte jeg Claude Code ${days} dage, til omkring ${perDay} om dagen i API-priser.`,
      note: (model, share) => `Opus blev rationeret. ${model} lavede ${share} af arbejdet.`,
    },
    lull: {
      headline: 'Den sidste stille uge',
      body: (plan, record, date) => `${plan}-rekorden står på ${record}, sat den ${date}.`,
    },
    switch: {
      kicker: (date) => `Stop pressen, ${date}`,
      headline: (plan) => `Skiftet til ${plan}, og rekorden falder`,
      body: (plan, record) =>
        `De nye søjler skyder lige forbi ${plan}-rekorden på ${record}. Diagrammet må zoome ud for at få plads til dem.`,
    },
    max: {
      headline: (plan) => `Ugerne på ${plan}`,
      body: (model, share, perDay) =>
        `Ingen rationering mere: ${model} har lavet ${share} af arbejdet, og en aktiv dag ligger nu på ${perDay}.`,
    },
  },
  compare: {
    title: 'De to abonnementer side om side',
    ledeBaseLeads: (base, baseValue, upgrade, upgradeValue, ratio) =>
      `${base} blev allerede brugt hårdt, så det gav mest pr. dollar: ${baseValue} i forbrug for hver dollar, mod ${upgradeValue} på ${upgrade}. ${upgrade} handler om kapacitet: ${ratio} så meget arbejde på hver aktiv dag.`,
    ledeUpgradeLeads: (base, baseValue, upgrade, upgradeValue, ratio) =>
      `${upgrade} gav også mest pr. dollar: ${upgradeValue} i forbrug for hver dollar, mod ${baseValue} på ${base}. Men først og fremmest handler det om kapacitet: ${ratio} så meget arbejde på hver aktiv dag.`,
    notes: {
      activeDays: 'Dage med mindst én session.',
      usage: 'Hvad de samme tokens koster med API-priser.',
      reread: 'Tokens læst fra cache divideret med output-tokens.',
      periodCost: 'Månedsprisen fordelt pr. kalenderdag.',
      perDollar: 'Forbrug i API-priser divideret med abonnementsprisen.',
    },
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
    title: (total) => `${total} tokens, og de fleste havde Claude læst før`,
    lede: 'Hver tur sender hele samtalen igen, og cachen leverer den tilbage til en brøkdel af prisen. Derfor ser antallet af tokens så stort ud i forhold til prisen.',
    shareCaption: 'af alle tokens var kontekst, Claude allerede havde indlæst, og som blev læst igen fra cachen.',
    barLabel: (share) => `Alle tokens fordelt på type. Genlæst fra cache: ${share}.`,
    rest: (share) => `Alt andet ${share}`,
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
    lede: 'Tokens læst fra cache divideret med output-tokens, dag for dag. Tallet stiger med større kodebaser og længere sessioner.',
    chartLabel: (baseValue, base, upgradeValue, upgrade) =>
      `Kurve over genlæst kontekst pr. skrevet token, pr. dag. Gennemsnittet var ${baseValue} på ${base} og ${upgradeValue} på ${upgrade}.`,
    avg: (value) => `gns. ${value}`,
    date: 'Dato',
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
    sourceHead: 'Kilde.',
    apiHead: 'API-priser.',
    sampleHead: 'Datagrundlag.',
    prorateHead: 'Fordeling.',
    runLead: 'Kør det på dine egne logfiler:',
    copy: 'Kopiér',
    copied: 'Kopieret',
    selected: 'Markeret',
    copyName: 'Kopiér kommandoen',
    copiedName: 'Kommandoen er kopieret',
    selectedName: 'Kommandoen er markeret og klar til at blive kopieret',
    imprint: (from, to) => `Denne udgave: ${from} til ${to}.`,
    built: 'Bygget af usage.json og opdateret hver hverdag.',
  },
  close: {
    headline: (upgrade) => `Begge abonnementer gav langt mere igen, end de kostede. ${upgrade} køber kapacitet.`,
    standfirst: (date, days) =>
      `Kursbåndet stopper ${date}. Over ${days} dage er det her, hvad arbejdet ville have kostet med API-priser, sat over for hvad abonnementerne faktisk kostede.`,
    ledgerTitle: 'Slutopgørelse',
    ledgerRange: (from, to) => `${from} til ${to}`,
    usage: 'Forbrug i API-priser',
    usageNote: 'Hver token prissat efter API-takster',
    paid: 'Betalt for abonnementer',
    paidNote: (base, upgrade) => `${base} og siden ${upgrade}, fordelt pr. dag`,
    multiple: 'Faktor',
    multipleNote: 'Forbrug for hver betalt dollar',
  },
}
