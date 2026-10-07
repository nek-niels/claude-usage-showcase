# Claude Code usage: Pro vs Max 5x

A one-page report of Claude Code usage per subscription, built from a [ccusage](https://github.com/ryoppippi/ccusage) daily export.

Live at **https://nek-niels.github.io/claude-usage-showcase/**. Every push to `main` redeploys it.

```sh
npm install
npm run dev     # local preview
npm test        # checks the per-plan numbers add up to usage.json
npm run build   # static site in dist/
```

To refresh the data, export from the last day in `usage.json` with `npx ccusage@latest claude daily --breakdown --since YYYYMMDD --json` and merge it in: the new export replaces that day and adds the ones after it. To record a plan change, add an entry to `src/config/plans.ts`.
