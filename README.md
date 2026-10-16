# Claude Code usage: Pro vs Max 5x

A one-page report of Claude Code usage per subscription, built from a [ccusage](https://github.com/ryoppippi/ccusage) daily export.

Live at **https://nek-niels.github.io/claude-usage-showcase/**. Every push to `main` redeploys it.

```sh
npm install
npm run dev     # local preview
npm test        # checks the per-plan numbers add up to usage.json
npm run build   # static site in dist/
```

To refresh the data, run `node scripts/update-usage.mjs` on `main`. It exports from the last day in `usage.json` with `npx ccusage@20 claude daily --breakdown --since YYYYMMDD --json` and merges it in: the new export replaces that day and adds the ones after it. Then it runs the tests, commits and pushes. Add `--dry-run` to update `usage.json` and run the tests without committing, on any branch. To record a plan change, add an entry to `src/config/plans.ts`.

A Windows scheduled task, `Claude usage update`, runs this every weekday at 14:00 on a separate clone of `main` (`C:\Users\DSE\repos\claude-usage-autoupdate`), so this checkout can stay on any branch. ccusage reads the Claude Code logs on that PC, so the task has to run there. If the PC is off at 14:00, the task runs at the next logon. The log is at `%LOCALAPPDATA%\claude-usage-update\update.log`. A model seen for the first time is drawn in the muted colour, and the commit message says so, until it gets a slot in `src/lib/colors.ts`.
