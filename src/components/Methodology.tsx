import { useEffect, useRef, useState } from 'react'
import type { PlanSummary } from '../lib/aggregate'
import { useI18n } from '../i18n'

const COMMAND = 'npx ccusage@20 claude daily'
const COPIED_MS = 2000

type CopyState = 'idle' | 'copied' | 'selected'

/**
 * The colophon: how the numbers were made, the one thing a reader can do next, and the imprint. It is the
 * last screen of the page, so it is set still: no entrance, nothing that moves.
 */
export function Methodology({
  plans,
  total,
  from,
  to,
}: {
  plans: PlanSummary[]
  total: number
  from: string
  to: string
}) {
  const { t, fmtDate, fmtUsd } = useI18n()
  const m = t.method
  const last = plans[plans.length - 1]
  const longDate = { day: 'numeric', month: 'short', year: 'numeric' } as const

  return (
    <footer className="colophon" aria-labelledby="method-title">
      <h3 id="method-title" className="colophon-title">
        {m.title}
      </h3>
      <div className="colophon-columns">
        <p>
          <span className="colophon-runin">{m.sourceHead}</span>
          {m.sourceBefore}
          <a href="https://github.com/ryoppippi/ccusage">ccusage</a>
          {m.sourceAfter(fmtUsd(total))}
        </p>
        <p>
          <span className="colophon-runin">{m.apiHead}</span>
          {m.apiEquivalent}
        </p>
        <p>
          <span className="colophon-runin">{m.sampleHead}</span>
          {m.sample(last.plan.name, last.activeDays)}
        </p>
        <p>
          <span className="colophon-runin">{m.prorateHead}</span>
          {m.prorate}
        </p>
      </div>

      <RunCommand />

      <p className="colophon-imprint">
        <span>{m.imprint(fmtDate(from, longDate), fmtDate(to, longDate))}</span>
        <span>{m.built}</span>
      </p>
    </footer>
  )
}

/** The visitor's next action, set as running text with a plain copy control beside the command. */
function RunCommand() {
  const { t } = useI18n()
  const m = t.method
  const [state, setState] = useState<CopyState>('idle')
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (state === 'idle') return
    const id = setTimeout(() => setState('idle'), COPIED_MS)
    return () => clearTimeout(id)
  }, [state])

  async function copy() {
    try {
      await navigator.clipboard.writeText(COMMAND)
      setState('copied')
    } catch {
      // No clipboard access (insecure origin, denied permission): select the command so one keystroke copies it.
      const el = codeRef.current
      const selection = getSelection()
      if (!el || !selection) return
      const range = document.createRange()
      range.selectNodeContents(el)
      selection.removeAllRanges()
      selection.addRange(range)
      setState('selected')
    }
  }

  const visible = state === 'copied' ? m.copied : state === 'selected' ? m.selected : m.copy
  const name = state === 'copied' ? m.copiedName : state === 'selected' ? m.selectedName : m.copyName

  return (
    <p className="colophon-run">
      <span className="colophon-run-lead">{m.runLead}</span>{' '}
      <span className="colophon-run-cmd">
        <code ref={codeRef}>{COMMAND}</code>
        <button type="button" className="colophon-copy" onClick={copy} aria-label={name} data-state={state}>
          {/* Every label is stacked in one cell, so the control keeps its width as the label changes. */}
          {[m.copy, m.copied, m.selected].map((label) => (
            <span key={label} aria-hidden="true" className={label === visible ? 'is-shown' : undefined}>
              {label}
            </span>
          ))}
        </button>
      </span>
      <span className="visually-hidden" role="status">
        {state === 'idle' ? '' : name}
      </span>
    </p>
  )
}
