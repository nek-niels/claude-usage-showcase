// Refreshes usage.json from a ccusage export, then tests, commits and pushes it.
// Runs unattended every weekday from Windows Task Scheduler on a clone of main (see README).
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const FILE = 'usage.json'
const BOM = '﻿'
const CCUSAGE = 'ccusage@20'

const run = (cmd, opts = {}) => execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], ...opts })
const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`)

// --dry-run updates usage.json and runs the tests on any branch, but doesn't commit or push.
const DRY = process.argv.includes('--dry-run')

const branch = run('git rev-parse --abbrev-ref HEAD').trim()
if (branch !== 'main' && !DRY) throw new Error(`expected to be on main, not ${branch}`)
if (run('git status --porcelain --untracked-files=no').trim()) throw new Error('working tree has local changes')

const current = JSON.parse(readFileSync(FILE, 'utf8').replace(BOM, ''))
const lastDate = current.daily.map((d) => d.date).sort().at(-1)
const since = lastDate.replaceAll('-', '')

const sortKeys = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)))
const TOKENS = ['cacheCreationTokens', 'cacheReadTokens', 'inputTokens', 'outputTokens']

// Keep only the fields usage.json already has; ccusage has renamed and added fields between versions.
function normalize(row) {
  const date = row.date ?? row.period
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`unexpected row date: ${JSON.stringify(date)}`)
  const pick = (o, keys) => Object.fromEntries(keys.map((k) => [k, o[k]]))
  const out = sortKeys({
    ...pick(row, [...TOKENS, 'totalCost', 'totalTokens', 'modelsUsed']),
    date,
    modelBreakdowns: row.modelBreakdowns.map((b) => sortKeys(pick(b, [...TOKENS, 'cost', 'modelName']))),
  })
  for (const [k, v] of Object.entries(out))
    if (v === undefined || (typeof v === 'number' && !Number.isFinite(v))) throw new Error(`${date}: bad ${k}`)
  return out
}

log(`exporting with ${CCUSAGE} since ${since}`)
const version = run(`npx --yes ${CCUSAGE} --version`).trim().replace(/^ccusage /, '')
const exported = JSON.parse(run(`npx --yes ${CCUSAGE} claude daily --breakdown --since ${since} --json`)).daily.map(normalize)
if (exported.length === 0) throw new Error(`export since ${since} is empty`)

// The export replaces the last (usually partial) day and adds the ones after it.
const daily = [...current.daily.filter((d) => d.date < lastDate), ...exported].sort((a, b) => a.date.localeCompare(b.date))
const totals = sortKeys(
  Object.fromEntries(
    [...TOKENS, 'totalCost', 'totalTokens'].map((k) => [k, daily.reduce((a, d) => a + d[k], 0)]),
  ),
)
const text = JSON.stringify({ daily, totals }, null, 2) + '\n'

// Compare days only: re-summing totals can differ from the stored ones in the last float digit.
if (JSON.stringify(daily) === JSON.stringify(current.daily)) {
  log('no new usage, nothing to commit')
  process.exit(0)
}
writeFileSync(FILE, BOM + text)

try {
  run('npm test', { stdio: 'inherit' })
} catch (err) {
  run(`git checkout -- ${FILE}`)
  throw new Error('npm test failed with the new data; usage.json restored, nothing committed')
}

const newest = daily.at(-1).date
const added = exported.map((d) => d.date).filter((d) => d > lastDate)
const knownModels = new Set(current.daily.flatMap((d) => d.modelBreakdowns.map((b) => b.modelName)))
const newModels = [...new Set(exported.flatMap((d) => d.modelBreakdowns.map((b) => b.modelName)))].filter(
  (m) => !knownModels.has(m),
)

const message = [
  `Append usage through ${newest}`,
  '',
  `Export with \`ccusage claude daily --breakdown --since ${since} --json\``,
  `(ccusage ${version}) and merge it into usage.json: the export replaces the`,
  `${lastDate} entry${added.length ? ` and adds ${added.join(', ')}` : ''}.`,
  ...(newModels.length
    ? ['', `New model${newModels.length > 1 ? 's' : ''}: ${newModels.join(', ')}. Give ${newModels.length > 1 ? 'them' : 'it'} a colour in src/lib/colors.ts.`]
    : []),
  '',
  'Automated weekday update (scripts/update-usage.mjs).',
].join('\n')

if (DRY) {
  log(`dry run: usage.json updated, would commit:\n\n${message}`)
  process.exit(0)
}

run(`git add ${FILE}`)
run('git commit -F -', { input: message, stdio: ['pipe', 'inherit', 'inherit'] })
run('git push origin main', { stdio: 'inherit' })
log(`pushed usage through ${newest}`)
