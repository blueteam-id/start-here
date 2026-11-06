# foundation.blueteam.id — Track 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a static Astro site for foundation.blueteam.id with a working homepage, catalog (9 tracks: 1 live, 8 "coming soon"), FAQ and Contributing pages, and one fully-authored track ("How a Computer Actually Works") with a track landing page and every lesson following the hands-on / prerequisites / OS-tabbed-code / reflect / go-further pattern, with client-side progress tracking and no backend.

**Architecture:** Astro static site, content authored in the `astro:content` collections API. Track landing pages are plain Markdown (`.md`); lessons are MDX (`.mdx`) so the OS-tabbed code block pattern can be authored as a real component (`<CodeTabs>`) inside lesson bodies rather than a brittle text convention — this is still Markdown-based authoring (MDX is a Markdown superset) and satisfies the spec's "content authored as Markdown with frontmatter" requirement. Every page's real markup lives in a `*View.astro` component under `src/components/views/`; the matching file under `src/pages/` is a thin wrapper that fetches content-collection data and renders the view. This keeps every page unit-testable via Astro's Container API without needing a browser. Client-side interactivity (progress persistence, OS-tab switching, catalog search/filter) is implemented as small vanilla-JS islands wrapping pure, dependency-injected TypeScript modules in `src/lib/`, so the logic is unit-testable in plain Node and the DOM glue stays thin.

**Tech Stack:** Astro (latest 5.x), TypeScript, `@astrojs/mdx`, Vitest (+ Astro's Container API, `astro/container`, for component/page tests), no UI framework (no React/Vue/Svelte), plain CSS.

**Spec:** [docs/superpowers/specs/2026-11-06-foundation-blueteam-design.md](../specs/2026-11-06-foundation-blueteam-design.md)

## Global Constraints

- No em dash (`—`, U+2014) anywhere in shipped UI copy or lesson content; use periods, colons, or commas instead.
- Every page is responsive down to 375px width and includes `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- Fully static output. No backend, no database, no accounts/login. No hardcoded domain name or absolute self-referential URL anywhere in source (external links like Discord or the main blueteam.id site are fine).
- No JS framework runtime; only small vanilla-JS islands.
- Progress is tracked only in `localStorage`, keyed per track, and must degrade gracefully (no thrown errors) when storage is unavailable (e.g. private browsing).
- Color tokens (roles fixed, hex values are this plan's call): `--bg:#0a0f1a`, `--bg-elev:#101729`, `--bg-card:#131b2e`, `--border:#1f2a40`, `--text:#e9edf5`, `--text-dim:#8d97ad`, `--blue:#4f8ef7`, `--yellow:#f2b705`, `--green:#38d996`.
- Catalog shows all 9 v1 tracks; only Track 1 ("How a Computer Actually Works") is live/clickable, the other 8 render as visibly-disabled "coming soon" cards with no link.
- Every track has a landing page (between the catalog and Lesson 1) and an attribution strip: written-by, reviewed-by, last-updated. Track 1's author and reviewer are both "Wahyu N".
- Every lesson ends with a "Reflect on your own" section and a "Go further" section, before the mark-complete footer.
- FAQ page ships with placeholder content ("coming soon, ask in Discord"). Contributing page ships with real content; its GitHub repo URL and contribution email are clearly-marked placeholders (not invented real-looking values).

## Review Focus

- Lesson or track Markdown/MDX missing a required frontmatter field (e.g. no `author`, no `order`) should fail the content build loudly, not silently render a broken page.
- A "coming soon" track card must never be clickable or produce a navigable link, even if someone forgets to set its status correctly later.
- Progress-percent calculation must not divide by zero or show negative/over-100% when a track has zero lessons or zero completed lessons.
- `localStorage` being unavailable or throwing (private browsing, storage disabled) must not crash progress read/write; it should degrade to a safe default.
- An em dash slipping into any committed lesson, track, or UI copy file must be caught automatically, not rely on manual re-reading.

---

### Task 1: Project scaffold, base layout, global styles

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`
- Create: `src/styles/tokens.css`
- Create: `src/layouts/BaseLayout.astro`
- Test: `src/layouts/BaseLayout.test.ts`

**Interfaces:**
- Produces: `BaseLayout.astro` accepting props `{ title: string; description?: string }`, rendering `<html lang="en">`, the viewport meta tag, `tokens.css`, a `<slot />` for page content. Later tasks' views are rendered inside this layout by their pages.

- [ ] **Step 1: Initialize the Astro project**

Run: `npm create astro@latest . -- --template minimal --typescript strict --no-install --no-git`, then `npm install`, then `npx astro add mdx vitest -y` (installs `@astrojs/mdx`; if the Vitest integration add-on doesn't exist for Astro, instead run `npm install -D vitest`). Add a `"test": "vitest run"` script to `package.json`.

- [ ] **Step 2: Write the failing test for `BaseLayout`**

```ts
// src/layouts/BaseLayout.test.ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import BaseLayout from './BaseLayout.astro';

test('renders viewport meta, lang, and title', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(BaseLayout, {
    props: { title: 'Test Page' },
    slots: { default: '<p>hello</p>' },
  });
  expect(html).toContain('<html lang="en"');
  expect(html).toContain('name="viewport"');
  expect(html).toContain('width=device-width, initial-scale=1');
  expect(html).toContain('<title>Test Page</title>');
  expect(html).toContain('<p>hello</p>');
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- BaseLayout` — Expected: FAIL (module/file not found).

- [ ] **Step 4: Implement `tokens.css` and `BaseLayout.astro`**

`tokens.css` defines the `:root` custom properties listed in Global Constraints, plus `body { background: var(--bg); color: var(--text); }`. `BaseLayout.astro` takes `{ title, description }`, emits `<html lang="en">`, `<head>` with the viewport meta tag, `<title>{title}</title>`, a `<meta name="description">` when provided, a link/import of `tokens.css`, and `<body><slot /></body>`.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- BaseLayout` — Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Scaffold Astro project with base layout and design tokens"
```

---

### Task 2: Progress tracking utility

**Files:**
- Create: `src/lib/progress.ts`
- Test: `src/lib/progress.test.ts`

**Interfaces:**
- Produces: `interface ProgressStore { getItem(key: string): string | null; setItem(key: string, value: string): void }`; `getProgress(trackId: string, store?: ProgressStore | null): Record<string, boolean>`; `setLessonComplete(trackId: string, lessonId: string, complete: boolean, store?: ProgressStore | null): Record<string, boolean>`; `getPercentComplete(progress: Record<string, boolean>, totalLessons: number): number` (0-100, integer). `store` defaults to the real `localStorage` wrapped so any thrown error yields `null` behavior (no-op / empty progress). Later tasks (Lesson view, Track landing view) import these three functions.

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/progress.test.ts
import { expect, test } from 'vitest';
import { getProgress, setLessonComplete, getPercentComplete } from './progress';

function fakeStore(): ProgressStoreTestDouble {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => { data.set(k, v); },
  };
}

test('getProgress returns empty object for a track with no saved state', () => {
  expect(getProgress('computing-basics', fakeStore())).toEqual({});
});

test('setLessonComplete persists and getProgress reads it back', () => {
  const store = fakeStore();
  setLessonComplete('computing-basics', 'lesson-1', true, store);
  expect(getProgress('computing-basics', store)).toEqual({ 'lesson-1': true });
});

test('setLessonComplete can unset a lesson', () => {
  const store = fakeStore();
  setLessonComplete('computing-basics', 'lesson-1', true, store);
  setLessonComplete('computing-basics', 'lesson-1', false, store);
  expect(getProgress('computing-basics', store)).toEqual({ 'lesson-1': false });
});

test('a throwing store degrades to empty progress instead of throwing', () => {
  const throwingStore = {
    getItem: () => { throw new Error('storage disabled'); },
    setItem: () => { throw new Error('storage disabled'); },
  };
  expect(() => getProgress('computing-basics', throwingStore)).not.toThrow();
  expect(getProgress('computing-basics', throwingStore)).toEqual({});
  expect(() => setLessonComplete('computing-basics', 'lesson-1', true, throwingStore)).not.toThrow();
});

test('getPercentComplete is 0 when there are zero total lessons', () => {
  expect(getPercentComplete({}, 0)).toBe(0);
});

test('getPercentComplete is 0 when nothing is complete', () => {
  expect(getPercentComplete({}, 5)).toBe(0);
});

test('getPercentComplete rounds to an integer percent', () => {
  expect(getPercentComplete({ a: true, b: true }, 3)).toBe(67);
});

test('getPercentComplete caps at 100 even with stale extra entries', () => {
  expect(getPercentComplete({ a: true, b: true, c: true, d: true }, 3)).toBe(100);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- progress` — Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/lib/progress.ts`**

Key under which progress for a track is stored: `` `fbt:progress:${trackId}` ``. `getPercentComplete` counts `true` values in `progress`, divides by `totalLessons`, multiplies by 100, rounds, and clamps to `[0, 100]`; returns `0` when `totalLessons <= 0`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- progress` — Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/progress.ts src/lib/progress.test.ts
git commit -m "Add localStorage-backed progress tracking with graceful degradation"
```

---

### Task 3: Content collections schema (tracks and lessons)

**Files:**
- Create: `src/content/config.ts`
- Test: `src/content/config.test.ts`

**Interfaces:**
- Produces: a `tracks` collection (type `content`, `.md`, one entry per track landing page at `src/content/tracks/<slug>/index.md`) with schema fields: `title: string`, `category: string`, `order: number`, `status: 'live' | 'coming-soon'`, `summary: string`, `estimatedMinutes: number`, `lessonCount: number`, `author: string`, `reviewer: string`, `updatedAt: Date`, `icon: string`. Produces a `lessons` collection (type `content`, `.mdx`, at `src/content/lessons/<trackSlug>/<nn-slug>.mdx`) with schema fields: `title: string`, `track: string` (matches a track slug), `phase: string`, `order: number`, `prerequisites: string.optional()`, `needsVM: boolean.default(false)`, `estimatedMinutes: number`. Later tasks (`src/data/tracks.ts`, Track landing view, Lesson view) query these two collections by slug/track.

- [ ] **Step 1: Write the failing test**

```ts
// src/content/config.test.ts
import { expect, test } from 'vitest';
import { z } from 'astro:content';
import { trackSchema, lessonSchema } from './config';

test('trackSchema accepts a fully-specified track', () => {
  expect(() => trackSchema.parse({
    title: 'How a Computer Actually Works',
    category: 'Computing Basics',
    order: 1,
    status: 'live',
    summary: 'Hardware, storage, OS, virtualization, at a glance.',
    estimatedMinutes: 180,
    lessonCount: 5,
    author: 'Wahyu N',
    reviewer: 'Wahyu N',
    updatedAt: new Date('2026-11-06'),
    icon: '🖥️',
  })).not.toThrow();
});

test('trackSchema rejects a track missing a required field', () => {
  expect(() => trackSchema.parse({ title: 'Incomplete Track' })).toThrow();
});

test('lessonSchema defaults needsVM to false when omitted', () => {
  const parsed = lessonSchema.parse({
    title: 'What Is a Computer',
    track: 'computing-basics',
    phase: 'Orientation',
    order: 1,
    estimatedMinutes: 20,
  });
  expect(parsed.needsVM).toBe(false);
});

test('lessonSchema rejects a lesson missing a required field', () => {
  expect(() => lessonSchema.parse({ title: 'No Track Set' })).toThrow();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- config` — Expected: FAIL (export not found).

- [ ] **Step 3: Implement `src/content/config.ts`**

Export `trackSchema` and `lessonSchema` as named Zod schemas (so the test above can import and exercise them directly), then use them in two `defineCollection({ type: 'content', schema: trackSchema })` / `lessonSchema` entries exported via `collections = { tracks, lessons }`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- config` — Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/content/config.ts src/content/config.test.ts
git commit -m "Define tracks and lessons content collection schemas"
```

---

### Task 4: Static track catalog data

**Files:**
- Create: `src/data/catalog.ts`
- Test: `src/data/catalog.test.ts`

**Interfaces:**
- Produces: `interface CatalogTrack { slug: string; title: string; category: string; status: 'live' | 'coming-soon'; summary: string; estimatedMinutes: number; lessonCount: number; icon: string; needsVM?: boolean }`; `export const CATALOG_TRACKS: CatalogTrack[]` (all 9 v1 tracks from the spec, slugs kebab-case, `computing-basics` is `status: 'live'`, the other 8 are `status: 'coming-soon'`); `groupByCategory(tracks: CatalogTrack[]): Array<{ category: string; tracks: CatalogTrack[] }>` preserving the 5-category order from the spec (Computing Basics, OS & Linux/Windows, Networking & Web, Programming & Data, Security Foundations). Later tasks (Catalog view, Homepage view) import `CATALOG_TRACKS` and `groupByCategory`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/data/catalog.test.ts
import { expect, test } from 'vitest';
import { CATALOG_TRACKS, groupByCategory } from './catalog';

test('there are exactly 9 v1 tracks', () => {
  expect(CATALOG_TRACKS).toHaveLength(9);
});

test('exactly one track is live, the rest are coming-soon', () => {
  const live = CATALOG_TRACKS.filter((t) => t.status === 'live');
  expect(live).toHaveLength(1);
  expect(live[0].slug).toBe('computing-basics');
});

test('groupByCategory preserves the 5-category spec order', () => {
  const groups = groupByCategory(CATALOG_TRACKS);
  expect(groups.map((g) => g.category)).toEqual([
    'Computing Basics',
    'OS & Linux/Windows',
    'Networking & Web',
    'Programming & Data',
    'Security Foundations',
  ]);
});

test('every track slug is unique', () => {
  const slugs = CATALOG_TRACKS.map((t) => t.slug);
  expect(new Set(slugs).size).toBe(slugs.length);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- catalog` — Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/data/catalog.ts`**

Populate `CATALOG_TRACKS` with the nine tracks and one-liners from the spec's "Content scope: v1 track list" section verbatim (title, category, summary, estimated time, lesson count, hands-on/needs-VM flags). `groupByCategory` buckets by a fixed category-order array and filters out empty buckets.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- catalog` — Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/catalog.ts src/data/catalog.test.ts
git commit -m "Add static v1 catalog data for all 9 tracks"
```

---

### Task 5: TrackCard and CategoryGroup components

**Files:**
- Create: `src/components/TrackCard.astro`
- Create: `src/components/CategoryGroup.astro`
- Test: `src/components/TrackCard.test.ts`

**Interfaces:**
- Consumes: `CatalogTrack` shape from Task 4.
- Produces: `TrackCard.astro` prop `{ track: CatalogTrack }`; renders a live card as `<a href={`/tracks/${track.slug}/`}>` and a coming-soon card as a non-link `<div aria-disabled="true">` with a "Coming soon" label, same visual shape either way. `CategoryGroup.astro` prop `{ category: string; tracks: CatalogTrack[] }`; renders a heading with the category name and a `TrackCard` per track. Consumed by the Catalog view (Task 8).

- [ ] **Step 1: Write the failing tests**

```ts
// src/components/TrackCard.test.ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import TrackCard from './TrackCard.astro';

const liveTrack = { slug: 'computing-basics', title: 'How a Computer Actually Works', category: 'Computing Basics', status: 'live' as const, summary: 's', estimatedMinutes: 180, lessonCount: 5, icon: '🖥️' };
const comingSoonTrack = { ...liveTrack, slug: 'linux-essentials', title: 'Linux Essentials', status: 'coming-soon' as const };

test('a live track renders as a link to its landing page', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(TrackCard, { props: { track: liveTrack } });
  expect(html).toContain('href="/tracks/computing-basics/"');
});

test('a coming-soon track renders with no link at all', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(TrackCard, { props: { track: comingSoonTrack } });
  expect(html).not.toContain('<a ');
  expect(html).not.toContain('href=');
  expect(html).toContain('aria-disabled="true"');
  expect(html).toMatch(/coming soon/i);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- TrackCard` — Expected: FAIL (module not found).

- [ ] **Step 3: Implement `TrackCard.astro` and `CategoryGroup.astro`**

`TrackCard` branches on `track.status` to pick the `<a>` vs `<div aria-disabled="true">` wrapper tag around identical inner markup (icon, "FOUNDATION" pill, title, summary, meta row: time, lesson count, hands-on/needs-VM flags per spec).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- TrackCard` — Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/TrackCard.astro src/components/CategoryGroup.astro src/components/TrackCard.test.ts
git commit -m "Add TrackCard and CategoryGroup components"
```

---

### Task 6: Header/nav and footer components

**Files:**
- Create: `src/components/Header.astro`
- Create: `src/components/DiscordBand.astro`
- Test: `src/components/Header.test.ts`

**Interfaces:**
- Produces: `Header.astro` (no props; static nav), rendering the shield mark + "foundation.blueteam.id" wordmark, nav links to `/tracks/`, `/faq/`, `/contributing/`, and a `/blueteam.id` style external link to the main site, plus a persistent "Join Discord" button linking to a Discord invite placeholder constant `DISCORD_INVITE_URL` exported from the same file. `DiscordBand.astro` prop `{ heading: string; body: string }`, rendering the Discord CTA band. Consumed by `BaseLayout.astro` (Task 1, updated here) and by the Homepage view (Task 9).

- [ ] **Step 1: Write the failing tests**

```ts
// src/components/Header.test.ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Header, { DISCORD_INVITE_URL } from './Header.astro';

test('nav includes Tracks, FAQ, and Contributing links', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Header, {});
  expect(html).toContain('href="/tracks/"');
  expect(html).toContain('href="/faq/"');
  expect(html).toContain('href="/contributing/"');
});

test('the only call-to-action button is Join Discord, no donate or paid CTA', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Header, {});
  expect(html).toContain(DISCORD_INVITE_URL);
  expect(html.toLowerCase()).not.toContain('donat');
  expect(html.toLowerCase()).not.toContain('upgrade');
  expect(html.toLowerCase()).not.toContain('pricing');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- Header` — Expected: FAIL (module not found).

- [ ] **Step 3: Implement `Header.astro` and `DiscordBand.astro`**

`DISCORD_INVITE_URL` is a clearly-marked placeholder constant, e.g. `'https://discord.gg/REPLACE_ME'`, with a comment noting the owner must supply the real invite link.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- Header` — Expected: PASS

- [ ] **Step 5: Update `BaseLayout.astro` to render `<Header />` before `<slot />`**

No new test needed; Task 1's `BaseLayout.test.ts` still asserts the slot content is present, which still passes since `<Header />` only adds markup around it. Re-run `npm test -- BaseLayout` to confirm.

- [ ] **Step 6: Commit**

```bash
git add src/components/Header.astro src/components/DiscordBand.astro src/components/Header.test.ts src/layouts/BaseLayout.astro
git commit -m "Add site header/nav and Discord CTA band"
```

---

### Task 7: CodeTabs component

**Files:**
- Create: `src/components/CodeTabs.astro`
- Create: `src/scripts/codeTabs.client.ts`
- Test: `src/components/CodeTabs.test.ts`

**Interfaces:**
- Produces: `CodeTabs.astro` accepting named slots per OS: `macos`, `linux`, `windows` (a lesson author writes `<CodeTabs><Fragment slot="macos">...</Fragment>...</CodeTabs>` in MDX), rendering three tab buttons (labelled "macOS", "Linux", "Windows") plus three panels; the first supplied panel is visible by default (no `hidden` attribute), the rest carry `hidden`. `codeTabs.client.ts` is a vanilla-JS module (loaded via `<script>` in `CodeTabs.astro`) that toggles the `hidden` attribute and an `aria-selected` state on click; it exports `wireCodeTabs(root: HTMLElement): void` for direct unit testing against a hand-built DOM fragment. Consumed by lesson MDX content (Task 14) through the Lesson view (Task 11).

- [ ] **Step 1: Write the failing tests**

```ts
// src/components/CodeTabs.test.ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import CodeTabs from './CodeTabs.astro';

test('renders three OS tabs with the first panel visible by default', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(CodeTabs, {
    slots: { macos: '<pre>mac cmd</pre>', linux: '<pre>linux cmd</pre>', windows: '<pre>win cmd</pre>' },
  });
  expect(html).toMatch(/macOS/);
  expect(html).toMatch(/Linux/);
  expect(html).toMatch(/Windows/);
  const macPanelIndex = html.indexOf('mac cmd');
  const linuxPanelIndex = html.indexOf('linux cmd');
  expect(html.slice(Math.max(0, macPanelIndex - 200), macPanelIndex)).not.toContain('hidden');
  expect(html.slice(Math.max(0, linuxPanelIndex - 200), linuxPanelIndex)).toContain('hidden');
});
```

Also, for the client-side logic:

```ts
// src/scripts/codeTabs.client.test.ts
// @vitest-environment jsdom
import { expect, test } from 'vitest';
import { wireCodeTabs } from './codeTabs.client';

function buildFixture(): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = `
    <div class="tabs">
      <button data-tab="macos" aria-selected="true"></button>
      <button data-tab="linux" aria-selected="false"></button>
    </div>
    <div data-panel="macos"></div>
    <div data-panel="linux" hidden></div>
  `;
  return root;
}

test('clicking a tab shows its panel and hides the others', () => {
  const root = buildFixture();
  wireCodeTabs(root);
  root.querySelector('[data-tab="linux"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  expect(root.querySelector('[data-panel="linux"]')!.hasAttribute('hidden')).toBe(false);
  expect(root.querySelector('[data-panel="macos"]')!.hasAttribute('hidden')).toBe(true);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- CodeTabs codeTabs.client` — Expected: FAIL (modules not found).

- [ ] **Step 3: Implement `CodeTabs.astro`, `codeTabs.client.ts`**

`CodeTabs.astro` gives each tab button `data-tab="macos|linux|windows"` and each panel `data-panel="macos|linux|windows"`; only renders a tab/panel pair when that named slot was actually supplied. It imports `codeTabs.client.ts` via `<script>` and calls `wireCodeTabs(document.currentScript.parentElement)` (or an equivalent root lookup) on load. `wireCodeTabs(root)` adds a click listener on `root` that, on a `[data-tab]` click, sets `hidden` on every `[data-panel]` except the one matching the clicked tab's `data-tab`, and toggles `aria-selected` on the tab buttons.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- CodeTabs codeTabs.client` — Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/CodeTabs.astro src/scripts/codeTabs.client.ts src/components/CodeTabs.test.ts src/scripts/codeTabs.client.test.ts
git commit -m "Add OS-tabbed code block component"
```

---

### Task 8: Catalog view and page

**Files:**
- Create: `src/components/views/CatalogView.astro`
- Create: `src/pages/tracks/index.astro`
- Test: `src/components/views/CatalogView.test.ts`

**Interfaces:**
- Consumes: `CATALOG_TRACKS`, `groupByCategory` (Task 4), `CategoryGroup` (Task 5).
- Produces: `CatalogView.astro` (no props, reads `CATALOG_TRACKS` directly), rendering the page heading, a search input, category filter chips, and one `CategoryGroup` per non-empty category. `src/pages/tracks/index.astro` renders `<BaseLayout title="All Tracks"><CatalogView /></BaseLayout>`.

- [ ] **Step 1: Write the failing test**

```ts
// src/components/views/CatalogView.test.ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import CatalogView from './CatalogView.astro';

test('lists all 9 tracks, with exactly one live link and eight disabled cards', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(CatalogView, {});
  expect((html.match(/aria-disabled="true"/g) ?? []).length).toBe(8);
  expect(html).toContain('href="/tracks/computing-basics/"');
  expect(html).toContain('Computing Basics');
  expect(html).toContain('Security Foundations');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- CatalogView` — Expected: FAIL (module not found).

- [ ] **Step 3: Implement `CatalogView.astro` and `src/pages/tracks/index.astro`**

Search/filter chip interactivity is a small vanilla-JS island (out of scope for this task's test; client-side filtering is a progressive enhancement over the always-fully-rendered list asserted above).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- CatalogView` — Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/views/CatalogView.astro src/pages/tracks/index.astro src/components/views/CatalogView.test.ts
git commit -m "Add catalog page listing all 9 tracks"
```

---

### Task 9: Homepage view and page

**Files:**
- Create: `src/components/views/HomeView.astro`
- Create: `src/pages/index.astro`
- Test: `src/components/views/HomeView.test.ts`

**Interfaces:**
- Consumes: `CATALOG_TRACKS` (Task 4), `DiscordBand` (Task 6).
- Produces: `HomeView.astro` rendering the hero (badge, headline, sub-copy, two CTAs), four pillar cards, a tracks teaser (only tracks with `status === 'live'`, plus a "see all tracks" link to `/tracks/`), and a `DiscordBand`.

- [ ] **Step 1: Write the failing test**

```ts
// src/components/views/HomeView.test.ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import HomeView from './HomeView.astro';

test('the tracks teaser only links to live tracks, never a coming-soon one', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(HomeView, {});
  expect(html).toContain('href="/tracks/computing-basics/"');
  expect(html).not.toContain('href="/tracks/linux-essentials/"');
  expect(html).toContain('/tracks/');
});

test('renders exactly four pillar cards', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(HomeView, {});
  expect((html.match(/class="pillar/g) ?? []).length).toBe(4);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- HomeView` — Expected: FAIL (module not found).

- [ ] **Step 3: Implement `HomeView.astro` and `src/pages/index.astro`**

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- HomeView` — Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/views/HomeView.astro src/pages/index.astro src/components/views/HomeView.test.ts
git commit -m "Add homepage"
```

---

### Task 10: Track landing view and page

**Files:**
- Create: `src/components/AttributionStrip.astro`
- Create: `src/components/views/TrackLandingView.astro`
- Create: `src/pages/tracks/[track]/index.astro`
- Test: `src/components/views/TrackLandingView.test.ts`

**Interfaces:**
- Consumes: the `tracks` and `lessons` collections (Task 3).
- Produces: `AttributionStrip.astro` prop `{ author: string; reviewer: string; updatedAt: Date }`. `TrackLandingView.astro` prop `{ track: CollectionEntry<'tracks'>; lessons: CollectionEntry<'lessons'>[] }`, rendering title, summary, `AttributionStrip`, an ordered lesson list (title + phase, no lesson body), total time/lesson count, and a "Start track" link to the first lesson by `order`. `src/pages/tracks/[track]/index.astro` implements `getStaticPaths()` over the `tracks` collection, loads that track's `lessons` filtered by `track` slug and sorted by `order`, and renders `<BaseLayout><TrackLandingView track={...} lessons={...} /></BaseLayout>`.

- [ ] **Step 1: Write the failing test**

```ts
// src/components/views/TrackLandingView.test.ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import TrackLandingView from './TrackLandingView.astro';

const fixtureTrack = { slug: 'computing-basics', data: {
  title: 'How a Computer Actually Works', category: 'Computing Basics', order: 1, status: 'live',
  summary: 'Hardware, storage, OS, virtualization, at a glance.', estimatedMinutes: 180, lessonCount: 2,
  author: 'Wahyu N', reviewer: 'Wahyu N', updatedAt: new Date('2026-11-06'), icon: '🖥️',
} } as any;

const fixtureLessons = [
  { slug: 'computing-basics/02-storage', data: { title: 'Storage and Data', track: 'computing-basics', phase: 'Core Concepts', order: 2, estimatedMinutes: 20, needsVM: false } },
  { slug: 'computing-basics/01-what-is-a-computer', data: { title: 'What Is a Computer', track: 'computing-basics', phase: 'Orientation', order: 1, estimatedMinutes: 15, needsVM: false } },
] as any[];

test('shows the attribution strip and an ordered lesson list with a start link to lesson 1', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(TrackLandingView, { props: { track: fixtureTrack, lessons: fixtureLessons } });
  expect(html).toContain('Wahyu N');
  const firstIndex = html.indexOf('What Is a Computer');
  const secondIndex = html.indexOf('Storage and Data');
  expect(firstIndex).toBeGreaterThan(-1);
  expect(firstIndex).toBeLessThan(secondIndex);
  expect(html).toContain('href="/tracks/computing-basics/01-what-is-a-computer/"');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- TrackLandingView` — Expected: FAIL (module not found).

- [ ] **Step 3: Implement `AttributionStrip.astro`, `TrackLandingView.astro`, and the `[track]/index.astro` page**

The lesson URL pattern is `` `/tracks/${track.slug}/${lessonSlugWithoutTrackPrefix}/` ``; sort `lessons` by `data.order` ascending before rendering.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- TrackLandingView` — Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/AttributionStrip.astro src/components/views/TrackLandingView.astro src/pages/tracks/[track]/index.astro src/components/views/TrackLandingView.test.ts
git commit -m "Add track landing page with attribution and lesson list"
```

---

### Task 11: Lesson view and page

**Files:**
- Create: `src/components/LessonSidebar.astro`
- Create: `src/components/PrerequisitesCallout.astro`
- Create: `src/components/ReflectSection.astro`
- Create: `src/components/GoFurtherSection.astro`
- Create: `src/components/views/LessonView.astro`
- Create: `src/pages/tracks/[track]/[lesson].astro`
- Create: `src/scripts/markComplete.client.ts`
- Test: `src/components/views/LessonView.test.ts`

**Interfaces:**
- Consumes: `getProgress` (Task 2), the `lessons` collection (Task 3), `CodeTabs` (Task 7).
- Produces: `LessonSidebar.astro` prop `{ trackTitle: string; lessons: Array<{ slug: string; title: string; phase: string }>; currentSlug: string; progress: Record<string, boolean> }`, rendering the progress bar and phase-grouped lesson list with checkmarks for completed and a highlighted current row. `PrerequisitesCallout.astro` prop `{ text: string }`. `ReflectSection.astro` prop `{ questions: string[] }`. `GoFurtherSection.astro` prop `{ resources: Array<{ label: string; url: string }> }`. `LessonView.astro` prop `{ track; lessons; lesson; Content; reflectQuestions: string[]; resources: Array<{ label: string; url: string }> }` (`Content` is Astro's rendered-MDX component for the current lesson's body) assembling sidebar + breadcrumb + prerequisites (only when `lesson.data.prerequisites` is set) + `<Content />` + Reflect + Go further + mark-complete footer with next-lesson link. `markComplete.client.ts` exports `wireMarkComplete(root: HTMLElement, trackSlug: string, lessonSlug: string): void` toggling the button's label/state and calling `setLessonComplete`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/components/views/LessonView.test.ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import LessonView from './LessonView.astro';

const track = { slug: 'computing-basics', data: { title: 'How a Computer Actually Works' } } as any;
const lessons = [
  { slug: 'computing-basics/01-what-is-a-computer', data: { title: 'What Is a Computer', phase: 'Orientation', order: 1 } },
  { slug: 'computing-basics/02-storage', data: { title: 'Storage and Data', phase: 'Core Concepts', order: 2, prerequisites: 'Finish lesson 1 first.' } },
] as any[];
const Content = () => '<p>lesson body</p>';

test('shows the prerequisites callout only when the lesson has one', async () => {
  const container = await AstroContainer.create();
  const htmlNoPrereq = await container.renderToString(LessonView, {
    props: { track, lessons, lesson: lessons[0], Content },
  });
  expect(htmlNoPrereq).not.toMatch(/PREREQUISITES/i);

  const htmlWithPrereq = await container.renderToString(LessonView, {
    props: { track, lessons, lesson: lessons[1], Content },
  });
  expect(htmlWithPrereq).toMatch(/PREREQUISITES/i);
  expect(htmlWithPrereq).toContain('Finish lesson 1 first.');
});

test('renders Reflect and Go further sections with the given content', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(LessonView, {
    props: { track, lessons, lesson: lessons[0], Content, reflectQuestions: ['Why does this matter?'], resources: [{ label: 'A book', url: 'https://example.com/book' }] },
  });
  expect(html).toMatch(/Reflect on your own/i);
  expect(html).toContain('Why does this matter?');
  expect(html).toMatch(/Go further/i);
  expect(html).toContain('https://example.com/book');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- LessonView` — Expected: FAIL (module not found).

- [ ] **Step 3: Implement the sidebar/callout/reflect/go-further components, `LessonView.astro`, `[lesson].astro`, and `markComplete.client.ts`**

`[lesson].astro` implements `getStaticPaths()` over the `lessons` collection; for each entry, split its collection `slug` (`"<trackSlug>/<lessonSlug>"`) to produce route params `{ track: trackSlug, lesson: lessonSlug }`, matching the `/tracks/<trackSlug>/<lessonSlug>/` URL shape Task 10 already links to. Render the lesson body via `await lesson.render()` to get `Content`, and read `reflectQuestions`/`resources` from dedicated frontmatter fields added to `lessonSchema` in Task 3 (extend it there now, since this task is the first to need them: `reflectQuestions: z.array(z.string())`, `resources: z.array(z.object({ label: z.string(), url: z.string() }))`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- LessonView` — Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/LessonSidebar.astro src/components/PrerequisitesCallout.astro src/components/ReflectSection.astro src/components/GoFurtherSection.astro src/components/views/LessonView.astro src/pages/tracks/[track]/[lesson].astro src/scripts/markComplete.client.ts src/components/views/LessonView.test.ts src/content/config.ts
git commit -m "Add lesson page with sidebar, prerequisites, reflect and go-further sections"
```

---

### Task 12: FAQ and Contributing pages

**Files:**
- Create: `src/components/views/FaqView.astro`
- Create: `src/components/views/ContributingView.astro`
- Create: `src/pages/faq/index.astro`
- Create: `src/pages/contributing/index.astro`
- Test: `src/components/views/ContributingView.test.ts`

**Interfaces:**
- Produces: `FaqView.astro` (no props), rendering the placeholder copy "FAQ content coming soon, ask in Discord in the meantime." `ContributingView.astro` (no props) exporting `export const CONTRIBUTION_REPO_URL = 'https://github.com/REPLACE_ME/foundation-blueteam'` and `export const CONTRIBUTION_EMAIL = 'contribute@REPLACE_ME.blueteam.id'` (both clearly placeholder), rendering the three ways to contribute (GitHub, email, Discord) and the anti-goals reminder from the spec.

- [ ] **Step 1: Write the failing test**

```ts
// src/components/views/ContributingView.test.ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import ContributingView, { CONTRIBUTION_REPO_URL, CONTRIBUTION_EMAIL } from './ContributingView.astro';

test('placeholder contribution contacts are marked, not real-looking', () => {
  expect(CONTRIBUTION_REPO_URL).toContain('REPLACE_ME');
  expect(CONTRIBUTION_EMAIL).toContain('REPLACE_ME');
});

test('mentions GitHub, email, and Discord as contribution paths', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(ContributingView, {});
  expect(html.toLowerCase()).toContain('github');
  expect(html.toLowerCase()).toContain('discord');
  expect(html).toContain(CONTRIBUTION_EMAIL);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ContributingView` — Expected: FAIL (module not found).

- [ ] **Step 3: Implement both views and their thin pages**

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- ContributingView` — Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/views/FaqView.astro src/components/views/ContributingView.astro src/pages/faq/index.astro src/pages/contributing/index.astro src/components/views/ContributingView.test.ts
git commit -m "Add FAQ (placeholder) and Contributing pages"
```

---

### Task 13: Repo-wide em dash guard

**Files:**
- Create: `tests/no-em-dash.test.ts`

**Interfaces:**
- None (standalone repo audit test; depends on no other task's exports).

- [ ] **Step 1: Write the failing test**

```ts
// tests/no-em-dash.test.ts
import { expect, test } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const EM_DASH = '—';
const SCAN_ROOT = join(__dirname, '..', 'src');
const SKIP_DIRS = new Set(['node_modules', 'dist', '.astro']);

function listTextFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (SKIP_DIRS.has(name)) return [];
    const stats = statSync(full);
    if (stats.isDirectory()) return listTextFiles(full);
    if (/\.(astro|mdx|md|ts|tsx)$/.test(name)) return [full];
    return [];
  });
}

test('no committed source file contains an em dash', () => {
  const offenders = listTextFiles(SCAN_ROOT)
    .filter((file) => readFileSync(file, 'utf-8').includes(EM_DASH));
  expect(offenders).toEqual([]);
});
```

- [ ] **Step 2: Run test to verify it fails or passes honestly**

Run: `npm test -- no-em-dash` — Expected: PASS if no task above introduced an em dash (expected, since none intentionally did); if it unexpectedly FAILs, it has caught a real violation, listing the offending file(s) — fix the offending file's copy, then re-run.

- [ ] **Step 3: Run test to verify it passes**

Run: `npm test -- no-em-dash` — Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add tests/no-em-dash.test.ts
git commit -m "Add automated guard against em dashes in source content"
```

---

### Task 14: Author Track 1 content ("How a Computer Actually Works")

**Files:**
- Create: `src/content/tracks/computing-basics/index.md`
- Create: `src/content/lessons/computing-basics/01-what-is-a-computer.mdx`
- Create: `src/content/lessons/computing-basics/02-storage-and-data.mdx`
- Create: `src/content/lessons/computing-basics/03-operating-systems.mdx`
- Create: `src/content/lessons/computing-basics/04-virtualization-and-cloud.mdx`
- Create: `src/content/lessons/computing-basics/05-wrap-up.mdx`
- Test: `src/content/trackOne.test.ts`

**Interfaces:**
- Consumes: `trackSchema`, `lessonSchema` (Task 3).
- Produces: real content satisfying both schemas, with `author: 'Wahyu N'`, `reviewer: 'Wahyu N'`, today's date for `updatedAt`, `track: 'computing-basics'` on every lesson, sequential `order` 1 through 5, and for each lesson: a concrete local inspection task (CPU/RAM/disk/virtualization-support check, per the spec's resolution for this track) using `<CodeTabs>` for any command that differs by OS, at least 2 `reflectQuestions`, and at least 1 `resources` entry pointing to a real, freely-accessible external resource (book, video, or article).

- [ ] **Step 1: Write the failing test**

```ts
// src/content/trackOne.test.ts
import { expect, test } from 'vitest';
import { getCollection, getEntry } from 'astro:content';

test('the computing-basics track and its 5 lessons satisfy the schema and spec', async () => {
  const track = await getEntry('tracks', 'computing-basics');
  expect(track?.data.status).toBe('live');
  expect(track?.data.author).toBe('Wahyu N');
  expect(track?.data.reviewer).toBe('Wahyu N');

  const lessons = (await getCollection('lessons')).filter((l) => l.data.track === 'computing-basics');
  expect(lessons).toHaveLength(5);
  const orders = lessons.map((l) => l.data.order).sort((a, b) => a - b);
  expect(orders).toEqual([1, 2, 3, 4, 5]);
  for (const lesson of lessons) {
    expect(lesson.data.reflectQuestions.length).toBeGreaterThanOrEqual(2);
    expect(lesson.data.resources.length).toBeGreaterThanOrEqual(1);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- trackOne` — Expected: FAIL (no content yet).

- [ ] **Step 3: Write the five lesson files and the track landing file**

Content and exact wording are this task's own call (per spec: AI-drafted, human-reviewed by the owner afterward); keep every lesson hands-on per the concrete-inspection-task pattern, free of em dashes, and consistent with the tone established in the approved mockups (direct, no sales language, cites the Discord for anything deeper).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- trackOne` — Expected: PASS

- [ ] **Step 5: Run the full test suite and the em-dash guard once more**

Run: `npm test` — Expected: all PASS, including `no-em-dash`.

- [ ] **Step 6: Commit**

```bash
git add src/content/tracks/computing-basics src/content/lessons/computing-basics src/content/trackOne.test.ts
git commit -m "Author Track 1: How a Computer Actually Works"
```

---

### Task 15: Production build and static audit

**Files:**
- Create: `scripts/audit-dist.mjs`
- Modify: `package.json` (add `"audit": "node scripts/audit-dist.mjs"` script, run after `astro build` in a combined `"verify"` script)

**Interfaces:**
- None (final whole-site check; depends on every prior task's output existing in `dist/` after a build).

- [ ] **Step 1: Run the production build**

Run: `npm run build` — Expected: Astro build completes with no errors, producing `dist/`.

- [ ] **Step 2: Write `scripts/audit-dist.mjs`**

A Node script (no test framework needed, it's a one-shot CLI check run in CI/locally) that walks `dist/**/*.html` and fails (non-zero exit, printing offending files) if any file: is missing `name="viewport"`, or contains the em dash character `—`. It should also print a simple pass count.

- [ ] **Step 3: Run the audit and fix anything it finds**

Run: `node scripts/audit-dist.mjs` — Expected: exits 0, printing something like "Audited N HTML files, 0 problems." If it fails, fix the offending page/component and re-run `npm run build && node scripts/audit-dist.mjs` until clean.

- [ ] **Step 4: Add the combined `verify` script and commit**

```bash
git add scripts/audit-dist.mjs package.json
git commit -m "Add post-build static audit for viewport meta and em dashes"
```

---

## Self-Review Notes

- **Spec coverage:** Homepage (Task 9), Catalog with 9 tracks / 1 live (Tasks 4, 5, 8), Track landing page with attribution (Task 10), Lesson page with prerequisites/OS-tabs/reflect/go-further/mark-complete (Tasks 7, 11), FAQ + Contributing (Task 12), progress via localStorage (Task 2), no-em-dash and mobile/viewport rules (Tasks 1, 13, 15), Track 1 real content (Task 14) are each covered by a task. Color tokens and "no JS framework" are covered structurally in Task 1 and by every component being `.astro` + vanilla `.client.ts`, not a separate test.
- **Review Focus coverage:** all five items have an owning task and test (Task 3 for missing frontmatter fields, Task 5 for coming-soon non-clickability, Task 2 for percent-complete edge cases, Task 2 for storage failures, Task 13 for the em dash guard).
- **Proportion / type consistency:** component prop shapes introduced in earlier tasks (`CatalogTrack`, `getProgress`/`setLessonComplete`/`getPercentComplete`, the `tracks`/`lessons` collection schemas) are reused with the same names and shapes in every later task that consumes them.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-11-06-foundation-blueteam-track1.md`. Please review the plan. Which execution approach would you prefer?

- **Subagent-driven** - A fresh subagent implements each task and a fresh reviewer checks it before the next one starts, then a whole-branch review at the end. Most thorough; costs a fresh context per task and per review.
- **Native** - I implement every task myself in this session, the way this harness runs work, then one fresh reviewer on the most capable model checks the whole branch. Cheapest and fastest; no independent review until the end. Runs well with a mid-tier session model, since the plan carries the design.

For this plan I recommend **subagent-driven**, because the 15 tasks are mostly independent (each has its own file set and its own test), but several later tasks (10, 11, 14) depend on exact interfaces from earlier ones (the collection schemas, `progress.ts`'s exact function signatures, `CatalogTrack`'s shape), and a wrong guess there would ripple forward quietly until Task 14's real content exposed it. A fresh reviewer catching that per-task, before the next task builds on it, is worth the extra cost here. Does the plan capture what you want, and which approach should we use?
