# foundation.blueteam.id — Design Document

## Intent and why

blueteam.id (the community) constantly gets asked the same questions by
newcomers: how do I even start in cybersecurity, what's the roadmap, what
foundational skills do I need. foundation.blueteam.id is the answer: a
free, community-run site of short foundational tracks that gets people
oriented on the basics, then routes them into the blueteam.id Discord for
real discussion and mentorship. It is explicitly "from community to
community," not a funnel into a paid product.

The working folder for this project currently has no name tied to a final
domain; the owner is still deciding on the domain, so nothing in the code
or config should hardcode a domain name.

## Goals

- Multiple short, independent tracks covering general IT and security
  foundations (networking, OS basics, programming basics, security
  concepts, etc.), not a full cybersecurity curriculum.
- Hands-on by default: most lessons include a real task to run locally,
  with OS-specific instructions (macOS / Linux / Windows) where the task
  differs by OS, or an explicit prerequisite (e.g. "needs a VM") when a
  lab can't run natively everywhere.
- Visual identity aligned with blueteam.id's existing look: dark
  navy/charcoal background, white shield mark, blue and yellow accents,
  technical/monospace touches for code and terminal UI, not the light
  "SaaS" look of the reference site.
- Mobile-friendly on every page, going forward, as a standing rule.
- No "dash-em" (em dash, —) anywhere in UI copy or content; use periods,
  colons, or commas instead.
- Fully static output. Deploy flow: build (locally or CI), push to
  GitHub (owner's personal account or the blueteam.id org, undecided),
  pull on a server, point a domain at it later. No backend, no database.
- Content authored as Markdown with frontmatter, so AI-drafted lessons are
  easy for the human maintainer to review via plain git diffs.
- No login, no accounts. Per-lesson progress (checkmarks, percent
  complete) is saved client-side via `localStorage` only.
- Every track visibly shows who wrote it, who reviewed it, and when it
  was last updated, so it's clear each course is human-made with AI
  help and human-reviewed, not AI output posted unsupervised.
- Every lesson ends with a short "reflect on your own" section (a few
  open-ended critical-thinking questions, for after class, not graded or
  submitted anywhere) and a "go further" section (external books, videos,
  articles for the curious).

## Non-goals / anti-goals

- Not a replacement for the Discord. Content stays at foundation depth;
  anything deeper is explicitly left to Discord discussion and
  mentorship. If a lesson starts feeling like it duplicates what a mentor
  conversation is for, it has gone too deep.
- No paid tiers, no "unlock more," no upsell of any kind, anywhere.
- No gamification: no certificates, no leaderboards, no badges.
- Not attempting to cover all of cybersecurity. The track list is a
  curated subset the owner chooses; "we can't cover everything" is an
  accepted constraint, not a bug.

## Prior art

- **academy.naipospos.cloud** (DevOps Indonesia) is the direct visual and
  structural inspiration: a catalog page with search/filter chips over
  track cards, a track landing page with an architecture diagram and a
  phase/module curriculum list, and a lesson page with a sidebar
  phase/module tree (with progress checkmarks) plus step-by-step content
  with copyable code blocks. We like this UX but it's implemented as a
  hash-routed single-page app; we are not cloning that implementation,
  see "Tech decisions" below.
- **blueteam.id** (the existing brand site) sets the visual direction:
  dark navy/charcoal background, white shield logo with "BlueTeam.id"
  wordmark, blue and yellow accent colors, playful icon illustrations.

## Content scope: v1 track list

Nine short tracks, grouped into five categories. The general topic list
was inspired by the overview of SANS's public "Foundations" course
page (https://www.sans.org/cyber-security-courses/foundations) as a
starting point for "what does a complete beginner need" — the syllabus
content itself was not used; every title and description here is written
fresh for blueteam.id.

1. **Computing Basics** — *How a Computer Actually Works*: hardware,
   storage, data representation, operating systems, virtualization and
   cloud, at a glance.
2. **OS & Linux/Windows** — *Linux Essentials*: shell navigation,
   permissions, core commands (`grep`, `cp`, etc.), hands-on.
3. **OS & Linux/Windows** — *Windows Foundations*: CLI, file system,
   permissions, PowerShell, Event Viewer, registry basics, hands-on.
4. **Networking & Web** — *Networking Fundamentals*: addressing, ports,
   TCP/UDP, subnetting, how a packet moves, hands-on.
5. **Networking & Web** — *How the Web Really Works*: search engines, web
   servers, HTML, cookies.
6. **Networking & Web** — *Servers & Services*: web/DB/DNS/log/mail
   servers, basic setup and first hardening steps, hands-on, needs a VM.
7. **Programming & Data** — *Programming Basics (Python)*: variables,
   input, files, a first TCP socket. Python only, deliberately not also
   covering C, to stay focused.
8. **Programming & Data** — *SQL Basics*: statements, joins, basic
   database administration.
9. **Security Foundations** — *Security Concepts*: CIA triad, threat vs.
   vulnerability vs. risk, crypto basics, ethics and legal boundaries, a
   first taste of recon and forensics. This is the natural bridge into
   deeper blueteam.id content and the Discord.

Two topics from the SANS overview, **Assembly** and **Advanced Computer
Hardware**, were deliberately cut from v1: they read as intermediate
specialization rather than "everyone needs this to start," which is the
scope this project is holding itself to.

## Tech decisions (already made, not open for re-litigation by the builder)

- **Astro, with Markdown content collections**, static output. Not a
  client-side SPA, and not hash-based routing. Every lesson gets a real
  URL (e.g. `/tracks/computing-basics/lesson-2`), which matters for
  sharing a specific lesson link in Discord and for it being indexable.
- Styling is plain CSS (Astro component-scoped styles), no CSS framework
  dependency required. Dark theme approximating blueteam.id's palette:
  background `#0a0f1a`, elevated surface `#101729`, card `#131b2e`,
  border `#1f2a40`, text `#e9edf5` / dim `#8d97ad`, accent blue `#4f8ef7`,
  accent yellow `#f2b705`, success/done green `#38d996`. These exact hex
  values are the builder's call to refine; the roles (bg/card/border/text/
  blue accent/yellow accent/green success) are the part that's fixed.
- No JS framework runtime. Small islands of vanilla JS only, for: reading
  and writing lesson-complete state in `localStorage`, the OS-tab switcher
  inside code blocks, and the catalog search/filter.
- Every page includes a `<meta name="viewport">` tag and is responsive
  down to phone width (this was a concrete bug found and fixed during
  mockup review; don't regress it).
- Content structure: each track is a collection of Markdown lesson files
  with frontmatter carrying at minimum: title, track, phase, order,
  prerequisites (free text), estimated time, whether it needs a VM, and
  whatever's needed to drive the OS-tabbed code blocks. Each track also
  carries track-level frontmatter (on its landing page content): author
  (human name/handle), reviewer (human name/handle), and last-updated
  date. Author/reviewer/last-updated are shown per track, not
  re-displayed on every individual lesson.
- Deploy target is a static `dist/` build. No domain name, absolute URL,
  or hosting-specific path may be hardcoded anywhere in source.

## Visual/UX system (already validated with the owner via interactive mockups)

- **Homepage**: sticky header (shield mark + "foundation.blueteam.id" +
  nav links + a persistent "Join Discord" button, no donate/paid CTA
  anywhere), hero with a "100% free, no sign-up, community-run" badge,
  headline, sub-copy, two CTAs (Browse tracks / what's this about), and a
  terminal-style visual (a fake `auth.log` tail with a flagged line,
  not a generic pipeline animation). Below: four pillar cards (hands-on
  by default / pick your own path / built by the community / no upsell
  ever), a 3-card tracks teaser, and a Discord CTA band.
- **Catalog page**: search input plus category filter chips (All /
  Computing Basics / OS & Linux-Windows / Networking & Web / Programming &
  Data / Security Foundations), tracks rendered grouped by category, each
  card showing an icon, a "FOUNDATION" pill, track number, title,
  one-line description, and meta row (time estimate, lesson count,
  hands-on flag, "needs a VM" flag when relevant). The canonical mockup
  for this page is `catalog-v2.html` (category-grouped, 3-column, with a
  mobile breakpoint), which superseded the earlier flat `catalog.html`
  once the real v1 track list and category grouping were decided; the
  builder should work from v2, not v1.
- **Track landing page** (confirmed with the owner, sits between the
  catalog and Lesson 1): shows the track title, a short description, an
  architecture/overview visual or a simple ordered list of what it
  covers, the full phase/lesson list (titles only, not full lesson
  content), total lesson count and time estimate, and a "start" button
  into Lesson 1. This is the thing the reference site
  (academy.naipospos.cloud) does with its per-track page, and the owner
  confirmed wanting it kept rather than linking catalog cards straight
  into Lesson 1. No mockup exists for this page yet; the builder designs
  it consistent with the established visual system (same card/badge/
  color language as the catalog and lesson pages). It also shows an
  attribution strip: written by [author], reviewed by [reviewer], last
  updated [date], small and unobtrusive but present, communicating
  that a human made and checked this with AI help, not that it is
  unsupervised AI output.
- **Lesson page**: left sidebar with track title, a progress bar
  (completed/total), and the phase/module tree (checkmark circles for
  done, highlighted row for current, plain for not-yet-started);
  breadcrumb, module tag, title, lede; a yellow-accented "Prerequisites"
  callout box; step-by-step body content; an OS-tabbed code block
  component (macOS / Linux / Windows); an inline "ask in Discord, don't
  get stuck here alone" nudge; then, before the footer, two closing
  sections every lesson ends with: **Reflect on your own** (a handful of
  open-ended critical-thinking questions, not graded, meant to be
  chewed on after class) and **Go further** (external books, videos,
  articles for whoever wants to dig deeper than this lesson goes); and a
  footer with a green "mark complete" button plus a "next lesson" link.
- **Mobile** (confirmed working down to 375px width): header nav text
  links hide, logo and Discord button shrink slightly so they stay on one
  line; hero/pillars/track grids collapse to one or two columns; the
  lesson sidebar becomes a capped-height scrollable block stacked above
  the lesson content rather than a fixed side column.
- **Logo**: the owner's actual logo file has not come through yet (a
  pasted image was blank). Until it's supplied, use the 🛡️ emoji as a
  placeholder shield mark; swapping in the real asset is a trivial
  follow-up, not a blocker.

## Site-wide pages: FAQ and Contributing

Beyond the homepage/catalog/track/lesson flow, the site gets two more
top-level pages, linked from the header nav alongside "Tracks":

- **FAQ page**: a route and a basic styled page (same shell as the rest
  of the site) exists in this iteration, but the owner is drafting the
  actual questions and answers later. Ship it with a short placeholder
  ("FAQ content coming soon, ask in Discord in the meantime") rather than
  inventing questions, so the route and nav link exist and are easy to
  fill in afterward.
- **Contributing page**: this one does get real content now, since the
  "from community to community" spirit depends on people knowing they
  can contribute, not just consume. It should cover, in plain language:
  - The kinds of contributions welcome: proposing or drafting a new
    short course/track, technical review of existing content (catching
    something inaccurate or outdated), and small fixes (typos, broken
    commands, outdated screenshots, unclear wording).
  - How to actually contribute, in order of preference: open a pull
    request or issue on the project's GitHub repo once it's public
    (exact repo URL is not yet known, leave as a clearly marked
    placeholder for the owner to fill in); or email a contribution in if
    GitHub isn't comfortable (contact address is also a placeholder,
    e.g. `[contribution email TBD]`); or just ask in the Discord if
    unsure where something belongs or how to start.
  - A short note reinforcing the site's anti-goals so contributors don't
    push it off course: foundation-level only, no upsell, no content
    that would make a lesson feel like a sales pitch.
  Both the GitHub repo link and the contribution email are unresolved
  values; the builder should make them obviously-placeholder (not a
  guessed real-looking URL/address) so they can't be mistaken for real
  contact info before the owner fills them in.

## This iteration's scope: one full course, rest as "coming soon"

This build pass does not need to produce all nine tracks. It needs to:

- Scaffold the Astro project: content collections config, a base layout,
  and the shared components implied by the mockups (header/nav with
  Discord CTA, footer/Discord band, track card, category group, OS-tabbed
  code block, lesson sidebar with progress tree, progress bar), plus a
  track landing page template (see above).
- Build **one** track completely as the reference implementation:
  **Track 1, "How a Computer Actually Works"** (Computing Basics), the
  most basic of the nine, including its landing page and all its
  lessons, with real AI-drafted content following the hands-on-by-default
  / prerequisites-callout / OS-tab patterns established in the mockups,
  reviewed by the owner afterward. Track 1 is the most conceptual/survey
  topic of the nine (hardware, storage, OS, virtualization "at a
  glance"), so "hands-on by default" here means concrete small
  inspection tasks (e.g. check your own CPU/RAM/disk info, confirm
  virtualization support, look at how your OS reports storage) rather
  than a build-a-thing lab; later tracks like Linux Essentials will lean
  more heavily hands-on. Since this track sets the template the other
  eight inherit, keep the hands-on task genuinely concrete even where the
  subject matter is conceptual, not reading-only.
- The catalog page lists all nine tracks. Track 1 is live and clickable.
  The other eight render as visibly-disabled "Coming soon" cards: same
  card shape and category grouping, muted styling, no link.
- The homepage's "tracks to start with" teaser and any other link into
  tracks only points at what's actually live (Track 1) or the catalog.
- Progress tracking (`localStorage`) is wired up and working for Track 1.
- Track 1's landing page shows its author/reviewer/last-updated
  attribution strip; every one of Track 1's lessons ends with a
  "Reflect on your own" and a "Go further" section with real content
  (not placeholders, since this is the reference implementation the
  pattern gets judged on).
- FAQ page exists (placeholder content) and Contributing page exists
  (real content per the drafted copy above), both linked from the nav.

## What's left to the builder

- Exact content-collection schema shape and file/folder layout.
- Exact component breakdown, naming, and prop shapes.
- The specific wording and structure of Track 1's lessons (AI-drafted,
  human-reviewed after the fact, per the owner's standing editorial
  control over what goes in and what doesn't).
- Final color token values (the roles are fixed above, the precise hex
  values can be refined against the real logo once it's supplied).
- How many lessons/phases Track 1 ends up with; the mockup's phase/module
  breakdown ("Orientation," "Core Concepts," etc.) was for a different
  track and is illustrative of the pattern, not a literal spec for Track
  1's structure.
- Track 1's "written by" / "reviewed by" fields are both **Wahyu N**
  (owner-confirmed), who is drafting with AI assistance and reviewing
  manually.
