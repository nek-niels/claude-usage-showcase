# BRIEF: Claude Code on Pro vs Max 5x, the running edition

**Partly interviewed, partly authored under explicit creative delegation.**
The owner answered questions 1, 6, 7 and 8 and delegated 2 to 5 with:
"You decide based on what this website's purpose". Authored answers are marked *(authored)*.

The site: a one-page personal report of Claude Code usage per subscription
(Pro, then Max 5x), built live from a ccusage export (`usage.json`), in English
and Danish, light and dark, deployed to GitHub Pages. It is reworked in place in
the React app. Data, tests, i18n, theme toggle and the deploy all stay.

## The eight topics

1. **Vibe and references.** Owner: "magazine showing a finance report".
   *(authored)* In five words: printed, sober, exact, dry, quietly astonishing.
   References: the salmon pages of a finance broadsheet, a closing-prices table,
   an exchange ticker tape.
2. **The scroll journey** *(authored)*. The purpose of the page is one claim:
   Max 5x buys about 2.5x more Claude Code work per active day than Pro, and both
   plans return far more than they cost. The journey is chronological, because the
   data is a time series and the honest story is "what happened, day by day":
   front page claim, then the Pro month day by day, then the switch, then the Max
   weeks, then the analysis (an average day, the cache), then the closing ledger
   and how it was measured.
3. **Energy curve** *(authored)*. Calm, typeset front page. A steady, modest
   rhythm through the Pro month. A deliberate lull at the last Pro days. The
   loudest moment at the switch. Then calm analytical inside pages, and a firm,
   still close.
4. **Feeling and the one moment** *(authored)*. See the feeling curve and peak below.
5. **The one thing no other site does** *(authored)*. Scroll is the calendar.
   A market tape under the nameplate carries the dateline of the day you are
   scrolling through, and computes from the real data the plan in force, that
   day's usage, the running API-equivalent total, the subscription paid to date
   and the multiple between them. It ticks forward as you read and lands on the
   closing figures at the end.
6. **Aesthetic range.** Owner: "Finance magazine style like a newspaper". Family:
   **dense editorial / broadsheet**. Salmon newsprint, column rules, a serif
   text face, tabular figures, small caps labels, no cards, no rounded pills.
7. **Structure.** Owner: **one continuous journey**. Realised as one unbroken
   dateline that runs from 24 Aug 2026 to the last day in the data, not as a
   video worldflight (there is no geography here, the journey is through time).
8. **Assets.** Owner: **the data is the world**. No generated imagery, no
   video, no API spend. Every visual is computed from `usage.json`.

## Grammar: "Running edition" (new)

Why not the eight defined grammars: filmic one-shot needs footage and hides
seams; chaptered editorial forbids a continuous thread; live surface forbids
display headlines and this is a report, not a product; continuous world needs a
place to fly through and worldflight video; typographic poster bans data media;
gallery is about options, not an argument; split stage is two-sided but the
story is sequential (Pro became Max); rhythmic cutlist is the wrong energy.

- **What a section is:** a story on a broadsheet page, set in a column grid,
  separated by hairline and heavy column rules. Never a card.
- **Navigation:** the masthead plus the **tape**: a sticky strip whose dateline
  is the scroll playhead, with a story index (Front page, The record, An average
  day, The cache, Closing bell) that jumps.
- **Sequence:** chronological. The playhead runs the calendar inside one long
  pinned chronicle; before it the tape reads the first day, after it the tape
  holds the closing day.
- **Ending:** the closing bell. The tape stops on the final day and the closing
  ledger is the last spread, with the colophon below it.
- **Bans:** photography, video, `scrub`, scrims, `drift` (the paper never
  changes colour), `spotlight`, `magnet`, `tilt`, character-split kinetic type,
  cards and rounded pills, centred body copy, eyebrows above every story (at
  most one in three), em dashes in any visible text, invented numbers.

## Signature move

**The dateline tape.** Scroll position is a date. The tape shows that date,
the plan in force, the day's usage (or "No session" on days off), the running
API-equivalent total, the subscription paid to date (prorated per calendar day)
and the multiple between them, all computed from `usage.json`. A strip of tiny
daily ticks in the tape doubles as navigation: clicking a day jumps the
chronicle to it.

## Fingerprint gate

Registry is empty: first build, nothing to clear.

## Journey

```
1  Claim        the front page states the 2.5x headline
2  Baseline     the Pro month, day by day, rationed Opus
3  Lull         the last Pro days
4  Turn         23 Sep, upgrade to Max 5x, the record breaks
5  Abundance    the Max weeks, Opus 5.5 does almost everything
6  Substance    an average day, and why the token counts are huge
7  Verdict      the closing ledger, and how to run it on your own logs
```

## Feeling curve (curve first, cause second)

```
1  Intrigue       front page: a typeset claim, a huge 2.5x printed behind the headline on its own plane, the tape reading 24 Aug
2  Steadiness     the Pro month prints bar by bar, small and grey, the tape ticks; a margin note on rationing Opus
3  Quiet          the last Pro days: the chart's right side stays empty, the tape slows to 22 Sep (authored silence)
4  Astonishment   PEAK. Stop press rule, Max bars rise in model colours, smash through the dashed "Pro record $68" line, the axis has to zoom out
5  Momentum       the Max weeks keep printing; the sidebar model mix tilts from Sonnet to Opus 5.5
6  Clarity        an average working day on each plan, figures landing side by side
7  Surprise       96% of five billion tokens were Claude re-reading its own context; a wipe across the token bar
8  Resolve        closing bell: paid vs API-equivalent, the multiple, the tape stopped on the last day
```

## The peak

> "The bit where I upgraded and the bars smashed straight through the old Pro
> record line, so the whole chart had to zoom out."

Lives in the chronicle (act 2), at 23 to 25 Sep. It gets the largest scroll span
on the page, and the quiet stretch (the last Pro days) in front of it.

## Tell-someone sentence

> It's the site where scrolling is the calendar: a ticker at the top counts up
> my Claude bill day by day, and when I switch to Max the bars break the old
> record and the chart has to zoom out.

## Authored silence

The last Pro days (roughly 16 to 22 Sep) inside the chronicle pin: the bars are
low and the right part of the chart is intentionally empty. Not dead scroll.

## Score

| Act | Beat | Device | Span (vh) | Why |
|---|---|---|---|---|
| Front page | Claim | layered `parallax` planes + `count` | ~1.2 | A typeset front page; the depth comes from the ratio numeral, headline and tape on separate planes |
| The record | Baseline, lull, turn, abundance | `pin` with a bespoke data scrub (scroll = date) | ~5 (the largest) | The time series is the story; holding the frame lets the calendar play |
| An average day | Substance | `flow` + `in` + `count` | ~1 | Information, compressed |
| The cache | Substance | `reveal` wipe across the token bar, the re-read line draws | ~1.4 | A change of understanding is a change of state |
| Closing bell | Verdict | `flow` with the tape resolving to its closing state | ~1.3 | The page stops and holds |

Device families: parallax, pin, flow, reveal, count. No family twice in a row.
Total ~10vh across 5 acts, outside the 6-to-7 acts at 13.6vh band.

## Visitor's next action

Run ccusage on their own logs: `npx ccusage@20 claude daily`. Set as running
text in the colophon with a copy button, not a button island.
