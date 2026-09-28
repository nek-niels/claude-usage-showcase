import { describe, expect, it } from 'vitest'
import { da } from './da'
import { en } from './en'

type Entry = string | ((...args: never[]) => string) | { [key: string]: Entry }

/** Every leaf as `path: kind`, so structural drift between languages shows up as a readable diff. */
function shape(dict: Entry, path = ''): string[] {
  if (typeof dict === 'string') return [`${path}: string`]
  if (typeof dict === 'function') return [`${path}: function/${dict.length}`]
  return Object.entries(dict).flatMap(([k, v]) => shape(v, path ? `${path}.${k}` : k))
}

function strings(dict: Entry): string[] {
  if (typeof dict === 'string') return [dict]
  if (typeof dict === 'function') return []
  return Object.values(dict).flatMap(strings)
}

describe('dictionaries', () => {
  it('Danish has exactly the same entries as English', () => {
    expect(shape(da)).toEqual(shape(en))
  })

  it('no Danish entry is left empty or untranslated', () => {
    const english = new Set(strings(en))
    for (const s of strings(da)) {
      expect(s.trim()).not.toBe('')
      expect(english.has(s), `"${s}" is still English`).toBe(false)
    }
  })

  it('templated entries use every argument they are given', () => {
    expect(da.hero.headline('Max 5x', '2,3×', 'Pro')).toBe(
      'På Max 5x får jeg lavet 2,3× så meget arbejde med Claude Code om dagen som på Pro.',
    )
    expect(da.compare.periodValue('1. sep.', '22. sep.', 22)).toBe('1. sep. til 22. sep. (22 dage)')
  })
})
