# start.blueteam.id

Free, community-run foundations in blue team / cybersecurity basics: how
computers, operating systems, networks and the web actually work, the
groundwork every defender needs before anything else.

No sign-up, no paid tiers, no gimmicks — built by
[blueteam.id](https://blueteam.id) volunteers, human-made with AI help.

## Tech stack

- [Astro](https://docs.astro.build) (static site generation)
- Content collections (MDX lessons, Markdown track indexes) validated with
  [Zod](https://zod.dev) schemas
- [Vitest](https://vitest.dev) + the Astro Container API for component/page
  tests

## Project structure

```
src/
├── content/
│   ├── tracks/<slug>/index.md       # one per track
│   └── lessons/<slug>/NN-title.mdx  # one per lesson
├── data/catalog.ts                  # the public track catalog
├── components/                      # Astro components, colocated tests
├── layouts/                         # shared page layout
└── pages/                           # routes
```

## Commands

| Command          | Action                                        |
| :---------------- | :--------------------------------------------- |
| `npm install`      | Install dependencies                           |
| `npm run dev`       | Start the dev server at `localhost:4321`       |
| `npm test`          | Run the test suite                             |
| `npm run build`     | Build the static site to `./dist/`             |
| `npm run audit`     | Audit the built HTML for structural issues     |
| `npm run verify`    | `build` + `audit`                              |
| `npm run preview`   | Preview the production build locally           |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) — new tracks and lessons, technical
review, small fixes, and bug reports are all welcome.
