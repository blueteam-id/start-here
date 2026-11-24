# start.blueteam.id

Free, community-run foundations for blue team and cybersecurity beginners:
13 short tracks that start with how a computer works and build up through
Linux and Windows, Git and GitHub/GitLab, networking, security concepts, the
web, Python, SQL, running your own server, and AI and LLMs.

No sign-up, no paid tiers, no gimmicks: built by
[blueteam.id](https://blueteam.id) volunteers, human-made with AI help.

## What learners get

- **13 tracks, about 30 hours**, laid out as a roadmap on the homepage, with a
  suggested order on the Start here page.
- **Hands-on lessons** with commands for macOS, Linux, and Windows, run in a
  practice folder (or, for Servers & Services, a lab VM) so nothing important
  can break. Some tracks include downloadable lab files with SHA-256 hashes.
- **Search** across every lesson, a **glossary**, copy buttons, and code tabs
  that remember your OS.
- **Progress** saved only in the learner's own browser, with copy, paste, and
  reset on the Privacy page. No accounts, no cookies, no analytics.

## Tech stack

- [Astro](https://docs.astro.build) static site; no server-side code.
- Content collections (MDX lessons, Markdown track pages) validated with
  [Zod](https://zod.dev) schemas.
- [Pagefind](https://pagefind.app) for search, built from the HTML at build
  time and run in the browser.
- [Vitest](https://vitest.dev), jsdom, and the Astro Container API for tests.
- Small vanilla TypeScript scripts for the interactive parts; no UI framework.

## Project structure

```
src/
├── content/
│   ├── tracks/<slug>/index.md       # one per track (title, summary, version...)
│   └── lessons/<slug>/NN-title.mdx  # one per lesson
├── data/
│   ├── catalog.ts                   # the public track list (cards, catalog, search)
│   ├── roadmap.ts                   # homepage roadmap stages and Start here order
│   └── glossary.ts                  # glossary terms
├── components/                      # Astro components, tests next to each one
│   └── views/                       # full-page views (home, catalog, lesson...)
├── pages/                           # routes: tracks, start, glossary, search, privacy...
├── scripts/                         # browser scripts (*.client.ts), each with tests
├── lib/                             # shared logic: progress, preferences, report links
├── layouts/                         # the page shell
└── styles/                          # design tokens and search styles
public/labs/<track>/                 # downloadable lab files
scripts/
├── audit-dist.mjs                   # checks the built HTML (viewport tag, no em dash)
├── labs/build_labs.py               # regenerates the lab files
└── visit-stats*.mjs                 # optional footer visit counter (runs on the server)
docs/                                # design spec, plans, review, release notes, setup guides
```

## Commands

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the dev server at `localhost:4321` (search is not available in dev) |
| `npm test` | Run the test suite |
| `npm run build` | Build the static site to `./dist/` and its search index |
| `npm run audit` | Audit the built HTML for structural issues |
| `npm run verify` | `build` + `audit` |
| `npm run preview` | Serve the built site locally (search works here) |
| `python3 scripts/labs/build_labs.py` | Regenerate the lab files after changing them |

## Deploying

`npm run build` produces a fully static `dist/` folder: any static web host
works. The optional footer visit counter needs a small hourly job on the
server; see [docs/visit-stats.md](docs/visit-stats.md). Without it, the counter
simply stays hidden.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md): new tracks and lessons, technical
review, small fixes, and bug reports are all welcome. Every lesson also has a
"Report it" link that opens a prefilled issue.
