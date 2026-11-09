# Contributing to start.blueteam.id

Thanks for considering a contribution. This project only works if it stays a
community effort: from community to community, not from us to you. If you
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

1. Open a pull request or issue on this repo, the fastest way for us to
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

1. **A catalog entry** in [`src/data/catalog.ts`](src/data/catalog.ts):
   `slug`, `title`, `category` (must be one of `CATALOG_CATEGORIES`),
   `status` (`'live'` or `'coming-soon'`), `summary`, `estimatedMinutes`,
   `lessonCount`, `icon`, and optionally `needsVM` / `handsOn`.
2. **A content entry** at `src/content/tracks/<slug>/index.md`, whose
   frontmatter satisfies `trackSchema` in
   [`src/content/config.ts`](src/content/config.ts): `title`, `category`,
   `order`, `status`, `summary`, `estimatedMinutes`, `lessonCount`, `author`,
   `reviewer`, `updatedAt`, `icon`, `version` (e.g. `'1.0'` for an initial
   public release; bump it on meaningful content revisions and mention the
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

Two mechanical rules on top of the schema:

- **English only.** This project intentionally has no translations, see
  the FAQ for why.
- **Commands:** use a plain ` ```bash ` fence when the exact same commands
  work identically across macOS/Linux/WSL. Only use the `<CodeTabs>`
  component (see `src/components/CodeTabs.astro`) when the commands
  genuinely differ per OS (e.g. package managers).

Everything else about how a track or lesson should read (structure, tone,
the cybersecurity tie-in, hands-on safety) is in the Content standard
below.

## Content standard

Beyond satisfying the schemas above, every track and lesson should follow
the same shape so the program reads as one coherent thing, not a pile of
individually-styled tutorials. This is the minimum bar for new content,
whether you're writing a brand-new track or editing an existing one.

### Track structure

- A track is a sequence of lesson files, grouped into **phases** via each
  lesson's `phase` frontmatter field (e.g. `'Orientation'`, `'Core
  Concepts'`, `'Wrap-up'`). Start with one or two Orientation lessons that
  place the topic in context (what it is, why it matters, how to get set up
  hands-on), move through the core skills, and end with exactly one
  **wrap-up lesson** (see below).
- The track's `index.md` intro is 2-3 short paragraphs: what the track
  covers and in how many lessons, what hands-on setup it needs (or
  doesn't), and how it connects to the rest of the program or real security
  work. Point unanswered questions at the Discord.
- If most learners won't already have the platform a track needs (for
  example, a Windows-focused track reaching Linux/macOS readers, or the
  reverse), say so explicitly in the first lesson's "Before you start"
  section, with at least one free way to get access.

### Lesson structure

- Each lesson is a handful of `##` sections that teach one coherent slice
  of the topic, building on the previous lesson. Prefer explaining *why*
  something works the way it does over just listing commands.
- **Connect it to cybersecurity, inline, not bolted on.** The tie-in to
  defensive work belongs inside the teaching sections themselves, as a
  natural "this is why it matters" aside, not a separate paragraph tacked
  on at the end.
- **Hands-on by default.** Give the learner commands to actually run, not
  just read. Reuse one dedicated practice folder/file across the whole
  track (created in an early lesson) instead of scattering throwaway
  state, and never have a hands-on step touch real system files,
  processes, or registry/config keys it doesn't own: read-only inspection
  is always safe; destructive or mutating commands need a disposable
  sandbox. See
  `src/content/lessons/linux-essentials/02-getting-oriented-in-the-shell.mdx`
  for the established pattern.
- Close every lesson with a `### What to notice` bullet list: 2-4 short
  callouts on the most important or most security-relevant takeaways, not
  a restatement of the whole lesson.
- `reflectQuestions` (at least 2) should ask the learner to connect what
  they just did to real practice or reasoning, not recall a fact the
  lesson already stated outright. Keep the wording short and plain: one
  idea per question, concrete nouns over abstractions, no stacked clauses
  or philosophical framing. Many learners read this track in a second
  language, so simple phrasing beats clever phrasing every time.
- `resources` (at least 1) should be free and, where possible, official
  documentation or a well-known free resource, never anything paywalled
  or promotional.

### The wrap-up lesson

Every track's final lesson, `phase: 'Wrap-up'`, has three parts:

1. A one-line recap of each prior lesson's core idea.
2. One combined hands-on exercise that chains skills from at least two
   earlier lessons into a single small, realistic scenario.
3. A short "Where to go from here" pointing to the Discord for open
   questions, and naming the track(s) that logically follow this one.

### Tone

- Plain, direct, and foundation-level, see "Keep it foundation level"
  above. Assume a genuine beginner, but don't pad or condescend.
- **No gimmicks, no upsell.** See "Keep it foundation level" above.

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
  satisfied: a mismatched or missing frontmatter field will fail the
  content collection build.

## Code style

- Keep components and content focused; colocate a component's test next to
  it (e.g. `Footer.astro` / `Footer.test.ts`).
- Match the existing dark, minimal visual style, see `src/styles/tokens.css`
  for the design tokens (colors, etc.) components should use instead of
  hardcoded values.
- No paid tiers, gated content, or tracking beyond what's already here.

## Questions

If any of this is unclear, ask in the
[Discord](https://blueteam.id/discord/) or email
[info@blueteam.id](mailto:info@blueteam.id). Thanks for helping keep this
project useful and free.
