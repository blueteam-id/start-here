# Contributing to start.blueteam.id

Thanks for considering a contribution. This project only works if it stays a
community effort — from community to community, not from us to you. If you
have something to add, fix, or question, we want to hear from you.

## Ways to contribute

- Proposing or drafting a new track or lesson.
- Technical review of existing content: catching something inaccurate,
  outdated, or misleading.
- Small fixes: typos, broken commands, outdated screenshots, or wording
  that's unclear.
- Reporting bugs or rough edges in the site itself.

## How to reach us

In order of preference:

1. Open a pull request or issue on this repo — the fastest way for us to
   review and merge a change.
2. Not comfortable with GitHub? Email your contribution to
   [info@blueteam.id](mailto:info@blueteam.id) instead, and we'll take it
   from there.
3. Not sure where something belongs or how to start? Ask in the
   [Discord](https://blueteam.id/discord/). Someone will point you in the
   right direction.

## Keep it foundation level

This project is meant to stay foundation-level, free, and plain. We're not
upselling anything, and no lesson should ever read like a sales pitch. If a
contribution starts to feel like marketing rather than teaching, it probably
needs a rewrite before it fits here.

## Project structure

```
src/
├── content/
│   ├── tracks/<slug>/index.md       # one per track, see schema below
│   └── lessons/<slug>/NN-title.mdx  # one per lesson, see schema below
├── data/catalog.ts                  # the public track catalog shown on the site
├── components/                      # Astro components and their colocated tests
└── pages/                           # routes
```

## Adding or editing a track

A track needs two things, kept in sync:

1. **A catalog entry** in [`src/data/catalog.ts`](src/data/catalog.ts) —
   `slug`, `title`, `category` (must be one of `CATALOG_CATEGORIES`),
   `status` (`'live'` or `'coming-soon'`), `summary`, `estimatedMinutes`,
   `lessonCount`, `icon`, and optionally `needsVM` / `handsOn`.
2. **A content entry** at `src/content/tracks/<slug>/index.md`, whose
   frontmatter satisfies `trackSchema` in
   [`src/content/config.ts`](src/content/config.ts): `title`, `category`,
   `order`, `status`, `summary`, `estimatedMinutes`, `lessonCount`, `author`,
   `reviewer`, `updatedAt`, `icon`, `version` (e.g. `'1.0'` for an initial
   public release — bump it on meaningful content revisions and mention the
   change in a GitHub release).

A track only shows as live on the homepage and catalog once both the catalog
entry and the content entry agree it is `'live'`.

## Adding or editing a lesson

Lessons live at `src/content/lessons/<track-slug>/NN-title.mdx`, numbered in
the order they're taken. Frontmatter must satisfy `lessonSchema` in
[`src/content/config.ts`](src/content/config.ts): `title`, `track` (the
track's slug), `phase`, `order`, `estimatedMinutes`, optional
`prerequisites` and `needsVM`, plus `reflectQuestions` (at least a couple of
short questions that prompt the learner to connect the lesson to real
practice) and `resources` (external links for going further).

Guidelines that keep lessons consistent with the rest of the site:

- **English only.** This project intentionally has no translations — see
  the FAQ for why.
- **No gimmicks, no upsell.** See "Keep it foundation level" above.
- **Connect it to cybersecurity.** Every lesson should make clear, even
  briefly, why the topic matters for a defender and what it looks like in
  real practice — not just teach the mechanics in isolation.
- **Hands-on by default.** Prefer ending a lesson with a small, concrete
  task the learner can do on their own machine over pure reading.
- **Commands:** use a plain ` ```bash ` fence when the exact same commands
  work identically across macOS/Linux/WSL. Only use the `<CodeTabs>`
  component (see `src/components/CodeTabs.astro`) when the commands
  genuinely differ per OS (e.g. package managers).
- **Hands-on safety:** when a lesson has the learner run destructive or
  system-affecting commands (`rm`, `chmod`, `kill`, etc.), have them work
  inside a dedicated practice directory they create for the purpose,
  never against real system files or processes. See
  `src/content/lessons/linux-essentials/02-getting-oriented-in-the-shell.mdx`
  for the established pattern.

## Development workflow

```bash
npm install        # install dependencies
npm run dev         # start the dev server at localhost:4321
npm test            # run the test suite (vitest)
npm run verify       # build the static site + audit the output
```

Before opening a pull request:

- `npm test` passes.
- `npm run verify` passes (build + audit, which catches broken links and
  a few structural issues in the built HTML).
- If you added or changed a track or lesson, the schemas above are
  satisfied — a mismatched or missing frontmatter field will fail the
  content collection build.

## Code style

- Keep components and content focused; colocate a component's test next to
  it (e.g. `Footer.astro` / `Footer.test.ts`).
- Match the existing dark, minimal visual style — see `src/styles/tokens.css`
  for the design tokens (colors, etc.) components should use instead of
  hardcoded values.
- No paid tiers, gated content, or tracking beyond what's already here.

## Questions

If any of this is unclear, ask in the
[Discord](https://blueteam.id/discord/) or email
[info@blueteam.id](mailto:info@blueteam.id). Thanks for helping keep this
project useful and free.
