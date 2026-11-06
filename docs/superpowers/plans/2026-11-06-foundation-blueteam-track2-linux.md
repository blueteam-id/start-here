# foundation.blueteam.id — Track 2 (Linux Essentials) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the second live track, "Linux Essentials" (catalog slug `linux-essentials`), as 7 fully-authored lessons following the same pattern as Track 1 (Computing Basics): track landing page, attribution, hands-on steps, reflect-on-your-own questions, go-further resources, client-side progress tracking. Flip it from "coming soon" to live in the catalog and homepage teaser.

**Architecture:** No new infrastructure. This plan only adds content-collection entries (`src/content/tracks/linux-essentials/index.md` and 7 lessons under `src/content/lessons/linux-essentials/`) plus the small set of existing tests/data that assert which tracks are live. All rendering, schema, progress tracking, and layout components already exist and are reused unchanged.

**Tech Stack:** Same as the rest of the site: Astro content collections (MDX for lessons, Markdown for the track index), Vitest + Astro Container API for structural tests.

**Spec:** [docs/superpowers/specs/2026-11-06-foundation-blueteam-design.md](../specs/2026-11-06-foundation-blueteam-design.md)

## Global Constraints

- No em dash (`—`, U+2014) anywhere in lesson content. Use periods, colons, or commas instead.
- Every lesson frontmatter satisfies `lessonSchema` in `src/content/config.ts`: `title`, `track: 'linux-essentials'`, `phase`, `order`, `estimatedMinutes`, optional `prerequisites`, `needsVM` (omit; all lessons here run on the student's own machine, no VM needed), `reflectQuestions` (at least 2 per lesson), `resources` (at least 1 per lesson, real, freely-accessible URLs).
- The track index frontmatter satisfies `trackSchema`: `title: 'Linux Essentials'`, `category: 'OS & Linux/Windows'`, `order: 1`, `status: 'live'`, `summary`, `estimatedMinutes: 160`, `lessonCount: 7`, `author: 'Wahyu N'`, `reviewer: 'Wahyu N'`, `updatedAt: 2026-11-06`, `icon: '🐧'`, `version: '1.0'`.
- **Commands are plain bash, not per-OS `<CodeTabs>`, for this track.** Unlike Track 1 (where CPU/RAM introspection genuinely differs per OS), the commands taught here (`ls`, `cd`, `grep`, `chmod`, `ps`, etc.) are the same POSIX shell commands on macOS Terminal, native Linux, and Windows via WSL. Use plain ` ```bash ` fences, not `<CodeTabs>`. The one exception is Lesson 6 (package managers), where `apt`/`dnf` (Linux) genuinely differs from Homebrew (macOS); use `<CodeTabs>` there with `macos` and `linux` slots only (no `windows` slot; a WSL Ubuntu install uses `apt`, covered by the `linux` slot).
- **Windows note placement:** exactly one short callout, in Lesson 2 (the first hands-on lesson), explaining that Windows users need WSL (Windows Subsystem for Linux) installed to get a real Linux/bash shell, with a link to Microsoft's install docs (`https://learn.microsoft.com/windows/wsl/install`). Every later lesson's hands-on section assumes "terminal" already means "bash on macOS Terminal, native Linux, or WSL" without repeating the explanation.
- **Hands-on safety:** every command that creates, modifies, or deletes a file must operate only inside a dedicated practice directory the student creates in Lesson 2 (`mkdir -p ~/linux-essentials && cd ~/linux-essentials`) and every later lesson's hands-on section starts by `cd`-ing back into it. Never instruct a destructive command (`rm`, `mv`, overwrite) against a path outside that directory or against a real system file. Read-only inspection commands (`ps`, `grep` over the student's own real log files, `cat`, `less`) are fine anywhere.
- Every lesson includes an explicit "why this matters for a defender" framing tied to its topic (see each task's brief for the specific angle); this is not a separate section, it is woven into the lesson's prose and/or callouts.
- Every page is responsive down to 375px width (inherited automatically; no new layout code in this plan).
- Fully static output, no backend. No hardcoded domain name anywhere in new content.

## Review Focus

- A lesson's hands-on steps must be safe to run verbatim on a real machine with no prior setup beyond "has a terminal", must not require `sudo`/admin rights, and must never touch anything outside the lesson's own practice directory once one exists (Lessons 3 onward).
- Reflect questions must be genuine thinking prompts (not restatements of the lesson), and at least one per lesson should connect the topic to a cybersecurity/defender scenario, per the confirmed lesson breakdown.
- Frontmatter typos (wrong `track` slug, `order` collisions, missing required field) should fail the structural test loudly, not silently produce a broken page.
- The catalog and homepage teaser must reflect the new live status consistently: `CatalogView`'s disabled-card count drops from 8 to 7, and the homepage teaser must not claim a still-coming-soon track (e.g. `windows-foundations`) is live.
- An em dash slipping into any new lesson or track file must be caught automatically (the existing `npm run audit` static scan already covers this for any built page; no new tooling needed), not rely on manual re-reading.

---

### Task 1: Track scaffold, structural test, and catalog flip

**Files:**
- Create: `src/content/tracks/linux-essentials/index.md`
- Create: `src/content/trackTwo.test.ts`
- Modify: `src/data/catalog.ts` (the `linux-essentials` entry)
- Modify: `src/components/views/CatalogView.test.ts`
- Modify: `src/components/views/HomeView.test.ts`

**Interfaces:**
- Consumes: `trackSchema` and `lessonSchema` from `src/content/config.ts` (unchanged), `getTracks`/`getLessons` from `src/lib/collections.ts` (unchanged).
- Produces: a `live` track entry at collection id `linux-essentials` that Tasks 2-8's lessons attach to via `track: 'linux-essentials'` frontmatter.

- [ ] **Step 1: Write the track index content**

Create `src/content/tracks/linux-essentials/index.md` with frontmatter exactly:

```yaml
title: 'Linux Essentials'
category: 'OS & Linux/Windows'
order: 1
status: 'live'
summary: 'Shell navigation, permissions, core commands such as grep and chmod, hands-on.'
estimatedMinutes: 160
lessonCount: 7
author: 'Wahyu N'
reviewer: 'Wahyu N'
updatedAt: 2026-11-06
icon: '🐧'
version: '1.0'
```

Body: 2-3 short paragraphs (no numbered lesson list needed, that pattern was only used once in Track 1's Lesson 1, not required here) introducing the track in the same voice as `src/content/tracks/computing-basics/index.md`: what it covers (navigating, reading, and controlling a Linux system from the command line), that every lesson is hands-on on the student's own machine (macOS, native Linux, or Windows via WSL, no VM needed), and that this is foundational muscle memory defenders use constantly (reading logs, triaging a server, checking permissions), pointing deeper questions to Discord.

- [ ] **Step 2: Write the failing structural test**

```ts
// src/content/trackTwo.test.ts
import { expect, test } from 'vitest';
import { getCollection, getEntry } from 'astro:content';

test('the linux-essentials track and its 7 lessons satisfy the schema and spec', async () => {
  const track = await getEntry('tracks', 'linux-essentials');
  expect(track?.data.status).toBe('live');
  expect(track?.data.author).toBe('Wahyu N');
  expect(track?.data.reviewer).toBe('Wahyu N');
  expect(track?.data.version).toBe('1.0');

  const lessons = (await getCollection('lessons')).filter((l) => l.data.track === 'linux-essentials');
  expect(lessons).toHaveLength(7);
  const orders = lessons.map((l) => l.data.order).sort((a, b) => a - b);
  expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7]);
  for (const lesson of lessons) {
    expect(lesson.data.reflectQuestions.length).toBeGreaterThanOrEqual(2);
    expect(lesson.data.resources.length).toBeGreaterThanOrEqual(1);
  }
});
```

- [ ] **Step 3: Run the test, confirm it fails**

Run: `npm test -- trackTwo`
Expected: FAIL, 0 lessons found (Tasks 2-8 have not run yet).

- [ ] **Step 4: Flip the catalog entry to live**

In `src/data/catalog.ts`, change the `linux-essentials` entry's `status` from `'coming-soon'` to `'live'`, `lessonCount` from `6` to `7`, and `estimatedMinutes` from `150` to `160`. Leave every other field (`slug`, `title`, `category`, `summary`, `icon`, `handsOn`) unchanged.

- [ ] **Step 5: Update the catalog test's disabled-card count**

In `src/components/views/CatalogView.test.ts`, change the expected `aria-disabled="true"` count from `8` to `7` (one fewer coming-soon card now that `linux-essentials` is live).

- [ ] **Step 6: Fix the homepage teaser test's stale assumption**

In `src/components/views/HomeView.test.ts`, the test `'the tracks teaser only links to live tracks, never a coming-soon one'` currently asserts `linux-essentials` is absent. Replace that assertion with a still-coming-soon track instead (`windows-foundations`), and add a positive assertion that `linux-essentials` is now present:

```ts
expect(html).toContain('href="/tracks/computing-basics/"');
expect(html).toContain('href="/tracks/linux-essentials/"');
expect(html).not.toContain('href="/tracks/windows-foundations/"');
```

- [ ] **Step 7: Run the full test suite**

Run: `npm test`
Expected: every test passes except `trackTwo.test.ts` (still RED, waiting on Tasks 2-8).

- [ ] **Step 8: Commit**

```bash
git add src/content/tracks/linux-essentials/index.md src/content/trackTwo.test.ts src/data/catalog.ts src/components/views/CatalogView.test.ts src/components/views/HomeView.test.ts
git commit -m "feat: scaffold Linux Essentials track and flip it live"
```

---

### Task 2: Lesson 1, "What Is Linux, and Why It's Everywhere"

**Files:**
- Create: `src/content/lessons/linux-essentials/01-what-is-linux-and-why-it-matters.mdx`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: the first lesson `trackTwo.test.ts` (Task 1) counts toward 7.

- [ ] **Step 1: Write the frontmatter**

```yaml
title: 'What Is Linux, and Why It's Everywhere'
track: 'linux-essentials'
phase: 'Orientation'
order: 1
estimatedMinutes: 20
reflectQuestions:
  - (write 2-3 genuine thinking prompts, not restatements; at least one must connect to a cybersecurity scenario, e.g. asking the student to notice how many of the internet services or devices around them likely run Linux, and what that means for a defender's career)
resources:
  - (at least 1 real, freely-accessible link; good options: 'History of Linux (Wikipedia)' at https://en.wikipedia.org/wiki/History_of_Linux, 'Linux distribution (Wikipedia)' at https://en.wikipedia.org/wiki/Linux_distribution, 'DistroWatch' at https://distrowatch.com/)
---
```

(Use real single-quoted YAML strings; escape the apostrophe in the title as `''` per YAML single-quote rules, matching how `04-virtualization-and-cloud.mdx` escaped `computer's` in Track 1.)

- [ ] **Step 2: Write the lesson body**

No `<CodeTabs>` needed (this lesson is conceptual), though one short, safe, read-only hands-on moment is encouraged to keep the hands-on thread going from Lesson 1 (e.g. a single plain bash fence showing `uname -a` or checking `/etc/os-release` on Linux/WSL, explicitly noting macOS does not have a direct equivalent since it is not a Linux distribution). Cover, in the implementer's own prose:

- A brief history: Unix's origins, Richard Stallman and the GNU project, Linus Torvalds starting the Linux kernel in 1991, and that "Linux" strictly refers to the kernel while a usable system is a GNU/Linux distribution.
- What a "distro" is (kernel + package manager + default tools bundled by a maintaining organization or community) and 3-4 major families with one example each: Debian family (Debian, Ubuntu), Red Hat family (RHEL, Fedora, CentOS/Rocky/Alma), Arch, and at least one security/pentest-focused distro (Kali Linux or Parrot OS) since that is directly relevant to this audience.
- A short "where Linux actually runs" section with concrete, surprising facts: the majority of public web servers and cloud infrastructure, nearly all public cloud VMs, Android's kernel, most of the world's supercomputers (top500 list), and embedded devices (routers, smart TVs).
- The defender framing (woven in, not a separate labeled section): because most of what a blue teamer monitors, hardens, or investigates (servers, containers, cloud workloads) runs Linux, fluency here is not optional background knowledge, it is a core job skill, same spirit as the "why this matters" framing used throughout the lesson breakdown the user approved.

- [ ] **Step 3: Run the test suite**

Run: `npm test`
Expected: `trackTwo.test.ts` still fails (expects 7 lessons, has 1), but no other test regresses.

- [ ] **Step 4: Commit**

```bash
git add src/content/lessons/linux-essentials/01-what-is-linux-and-why-it-matters.mdx
git commit -m "content: add Linux Essentials lesson 1 (what is Linux)"
```

---

### Task 3: Lesson 2, "Getting Oriented in the Shell"

**Files:**
- Create: `src/content/lessons/linux-essentials/02-getting-oriented-in-the-shell.mdx`

**Interfaces:**
- Consumes: nothing from other tasks (first hands-on lesson; owns the one WSL callout per Global Constraints).
- Produces: the practice directory convention (`~/linux-essentials`) that Tasks 4-8 assume already exists.

- [ ] **Step 1: Write the frontmatter**

```yaml
title: 'Getting Oriented in the Shell'
track: 'linux-essentials'
phase: 'Orientation'
order: 2
estimatedMinutes: 20
prerequisites: 'Lesson 1 (What Is Linux, and Why It's Everywhere), so you know what a distro is.'
reflectQuestions:
  - (2-3 prompts; at least one should ask the student to imagine SSHing into an unfamiliar server during an incident and connect that to what they just practiced)
resources:
  - (at least 1; good options: 'The Linux Command Line' free book by William Shotts at https://linuxcommand.org/tlcl.php, 'explainshell.com' at https://explainshell.com/)
```

- [ ] **Step 2: Write the lesson body**

Include, as plain `bash` fences (no `<CodeTabs>`, per Global Constraints):

- The one WSL callout: how to install it (`wsl --install` from an elevated PowerShell on Windows 10/11, link to `https://learn.microsoft.com/windows/wsl/install`), and that from here on "terminal" means bash on macOS Terminal, native Linux, or WSL.
- What a shell/prompt is, and reading prompt anatomy (user, host, current directory, the `$`/`#` convention for normal user vs root).
- Create the practice directory: `mkdir -p ~/linux-essentials && cd ~/linux-essentials`, explained as "everything hands-on in this track from here on happens inside this folder, so you can experiment freely."
- `pwd`, `ls` (and `ls -la` for hidden files/permissions preview, foreshadowing Lesson 5), `cd` (absolute vs relative, `cd ..`, `cd ~`, `cd -`).
- Defender framing: this exact sequence, pwd/ls/cd, is the first thing an analyst does after getting a shell on a server during an incident; being fluent here means spending your attention on the investigation, not on the shell itself.

- [ ] **Step 3: Run the test suite**

Run: `npm test`
Expected: `trackTwo.test.ts` still fails (expects 7, has 2); no regressions elsewhere.

- [ ] **Step 4: Commit**

```bash
git add src/content/lessons/linux-essentials/02-getting-oriented-in-the-shell.mdx
git commit -m "content: add Linux Essentials lesson 2 (shell orientation)"
```

---

### Task 4: Lesson 3, "Navigating the Filesystem"

**Files:**
- Create: `src/content/lessons/linux-essentials/03-navigating-the-filesystem.mdx`

**Interfaces:**
- Consumes: the `~/linux-essentials` practice directory convention from Task 3.

- [ ] **Step 1: Write the frontmatter**

```yaml
title: 'Navigating the Filesystem'
track: 'linux-essentials'
phase: 'Core Concepts'
order: 3
estimatedMinutes: 20
prerequisites: 'Lesson 2 (Getting Oriented in the Shell), so you have your practice folder and know pwd/ls/cd.'
reflectQuestions:
  - (2-3 prompts; at least one connects hidden files/odd paths to where attackers stash payloads)
resources:
  - (at least 1; e.g. 'Filesystem Hierarchy Standard (Wikipedia)' at https://en.wikipedia.org/wiki/Filesystem_Hierarchy_Standard)
```

- [ ] **Step 2: Write the lesson body**

Start every hands-on block with `cd ~/linux-essentials`. Cover, as plain `bash` fences:

- Absolute vs relative paths, `.` and `..`.
- Hidden files (dotfiles): `ls -a`, why config files are conventionally hidden, and that attackers sometimes name payloads to blend in with dotfiles or innocuous-looking names (the defender framing for this lesson).
- Creating structure: `mkdir`, `touch`.
- Copying, moving, removing: `cp`, `mv`, `rm` (note `rm` has no undo and is why this all happens inside the practice folder), `rm -r` for directories.
- Wildcards: `*`, `?`, with one or two realistic examples inside the practice folder (e.g. creating a few `.log`/`.txt` files with `touch` and selecting them with `*.log`).

- [ ] **Step 3: Run the test suite**

Run: `npm test`
Expected: `trackTwo.test.ts` still fails (expects 7, has 3); no regressions elsewhere.

- [ ] **Step 4: Commit**

```bash
git add src/content/lessons/linux-essentials/03-navigating-the-filesystem.mdx
git commit -m "content: add Linux Essentials lesson 3 (filesystem navigation)"
```

---

### Task 5: Lesson 4, "Reading and Searching Files"

**Files:**
- Create: `src/content/lessons/linux-essentials/04-reading-and-searching-files.mdx`

**Interfaces:**
- Consumes: the `~/linux-essentials` practice directory convention from Task 3.

- [ ] **Step 1: Write the frontmatter**

```yaml
title: 'Reading and Searching Files'
track: 'linux-essentials'
phase: 'Core Concepts'
order: 4
estimatedMinutes: 25
prerequisites: 'Lesson 3 (Navigating the Filesystem).'
reflectQuestions:
  - (2-3 prompts; at least one should have the student imagine grepping a real auth.log for brute-force attempts, echoing the pattern from the homepage's own hero visual)
resources:
  - (at least 1; e.g. 'grep (Wikipedia)' at https://en.wikipedia.org/wiki/Grep, OverTheWire's Bandit wargame at https://overthewire.org/wargames/bandit/ as free hands-on practice)
```

- [ ] **Step 2: Write the lesson body**

Start the hands-on block with `cd ~/linux-essentials` and creating a small sample text file (e.g. a few lines, one of them containing a word like "ERROR" or "Failed password") to search over, so every command is runnable verbatim. Cover, as plain `bash` fences:

- `cat` for short files, `less`/`more` for paging through long ones (and that `q` quits `less`).
- `head`/`tail`, and `tail -f` as the live-tailing pattern (described, not required to actually background it in a static tutorial).
- `grep` basics: plain substring search, `-i` for case-insensitive, `-r` for recursive, `-n` for line numbers, `-v` to invert. Make the defender framing explicit here: this is literally how you would search `auth.log` or `syslog` for "Failed password" or a known indicator of compromise across directories of logs.
- Pipes (`|`) and redirection (`>`, `>>`), with one combined example (e.g. `cat sample.log | grep ERROR` or piping into `wc -l` to count matches).

- [ ] **Step 3: Run the test suite**

Run: `npm test`
Expected: `trackTwo.test.ts` still fails (expects 7, has 4); no regressions elsewhere.

- [ ] **Step 4: Commit**

```bash
git add src/content/lessons/linux-essentials/04-reading-and-searching-files.mdx
git commit -m "content: add Linux Essentials lesson 4 (reading and searching files)"
```

---

### Task 6: Lesson 5, "Permissions and Ownership"

**Files:**
- Create: `src/content/lessons/linux-essentials/05-permissions-and-ownership.mdx`

**Interfaces:**
- Consumes: the `~/linux-essentials` practice directory convention from Task 3.

- [ ] **Step 1: Write the frontmatter**

```yaml
title: 'Permissions and Ownership'
track: 'linux-essentials'
phase: 'Core Concepts'
order: 5
estimatedMinutes: 25
prerequisites: 'Lesson 3 (Navigating the Filesystem), to have files you own to practice on.'
reflectQuestions:
  - (2-3 prompts; at least one should ask the student to reason about why a world-writable file owned by root is dangerous, connecting to real privilege-escalation findings)
resources:
  - (at least 1; e.g. 'File-system permissions (Wikipedia)' at https://en.wikipedia.org/wiki/File-system_permissions, GTFOBins at https://gtfobins.github.io/ as a further-reading pointer on permission-based privilege escalation, framed as "for later, once you are comfortable with the basics")
```

- [ ] **Step 2: Write the lesson body**

Start the hands-on block with `cd ~/linux-essentials`. Cover, as plain `bash` fences:

- Reading `ls -l` output: the `-rwxr-xr-x` style string, the three groups (owner/group/other), read/write/execute bits, and the numeric (octal) equivalent (4/2/1).
- `chmod` with both symbolic (`chmod u+x file`) and numeric (`chmod 644 file`) forms, practiced on a file the student creates with `touch`.
- `chown`/ownership at a conceptual level (what user/group ownership means), noting that changing ownership of files the student does not own requires `sudo` and is out of scope for this safe, no-sudo hands-on track; a one-sentence pointer that this becomes relevant later when managing real servers.
- The defender framing, made explicit: misconfigured permissions (a world-writable script run by a privileged user, an overly permissive config file) are one of the most common real-world findings in penetration tests and a classic privilege-escalation path; this is why "least privilege" is a security principle, not just a Linux trivia fact.

- [ ] **Step 3: Run the test suite**

Run: `npm test`
Expected: `trackTwo.test.ts` still fails (expects 7, has 5); no regressions elsewhere.

- [ ] **Step 4: Commit**

```bash
git add src/content/lessons/linux-essentials/05-permissions-and-ownership.mdx
git commit -m "content: add Linux Essentials lesson 5 (permissions and ownership)"
```

---

### Task 7: Lesson 6, "Processes and Installing Software"

**Files:**
- Create: `src/content/lessons/linux-essentials/06-processes-and-installing-software.mdx`

**Interfaces:**
- Consumes: the `~/linux-essentials` practice directory convention from Task 3; this is the one lesson in the track that uses `<CodeTabs>` (per Global Constraints), importing it the same way Track 1 lessons do: `import CodeTabs from '../../../components/CodeTabs.astro';`.

- [ ] **Step 1: Write the frontmatter**

```yaml
title: 'Processes and Installing Software'
track: 'linux-essentials'
phase: 'Core Concepts'
order: 6
estimatedMinutes: 25
reflectQuestions:
  - (2-3 prompts; at least one should ask the student to imagine spotting an unfamiliar process in `ps aux` output and what questions they would ask about it before deciding it is suspicious)
resources:
  - (at least 1; e.g. 'ps (Unix) (Wikipedia)' at https://en.wikipedia.org/wiki/Ps_(Unix), 'APT (software) (Wikipedia)' at https://en.wikipedia.org/wiki/APT_(software))
```

- [ ] **Step 2: Write the lesson body**

Cover, as plain `bash` fences unless noted:

- `ps aux` (or `ps -ef`) to list processes, reading the key columns (user, PID, %CPU, %MEM, command).
- `top` (or mention `htop` as a nicer alternative if installed) for a live view, and how to quit it (`q`).
- Killing a process: `kill <pid>`, and that `kill -9` is the forceful last resort, not the default.
- Package managers, here using `<CodeTabs>` with `macos` and `linux` slots only (no `windows` slot, per Global Constraints): `brew install <package>` on macOS (assuming Homebrew, link it as a one-time prerequisite if not installed), `apt install <package>` on Debian/Ubuntu-family Linux (and WSL Ubuntu), mentioning `dnf`/`yum` exist for Red Hat-family distros without a full worked example.
- The defender framing, explicit: an unfamiliar process consuming CPU or making odd network connections is one of the first signs of a compromised host (cryptominers, reverse shells), and checking what packages are installed (and when) is a routine part of investigating a suspicious server.

- [ ] **Step 3: Run the test suite**

Run: `npm test`
Expected: `trackTwo.test.ts` still fails (expects 7, has 6); no regressions elsewhere.

- [ ] **Step 4: Commit**

```bash
git add src/content/lessons/linux-essentials/06-processes-and-installing-software.mdx
git commit -m "content: add Linux Essentials lesson 6 (processes and packages)"
```

---

### Task 8: Lesson 7, "Wrap-up: Putting It Together"

**Files:**
- Create: `src/content/lessons/linux-essentials/07-wrap-up.mdx`

**Interfaces:**
- Consumes: commands and the `~/linux-essentials` practice directory from Tasks 3-7; this lesson's hands-on exercise combines them.
- Produces: the 7th lesson that makes `trackTwo.test.ts` (Task 1) pass.

- [ ] **Step 1: Write the frontmatter**

```yaml
title: 'Wrap-up: Putting It Together'
track: 'linux-essentials'
phase: 'Wrap-up'
order: 7
estimatedMinutes: 25
reflectQuestions:
  - (2-3 prompts, same spirit as Track 1's wrap-up lesson: which lesson changed how the student thinks the most, a question to bring to Discord, and one asking them to explain the combined exercise to a friend in plain language)
resources:
  - (at least 1; e.g. 'The Missing Semester of Your CS Education' at https://missing.csail.mit.edu/, reused from Track 1 since it is directly relevant here too)
```

- [ ] **Step 2: Write the lesson body**

A short recap of the 6 preceding lessons in 1-2 sentences each, then one combined hands-on exercise inside `~/linux-essentials` that chains several commands from the track into a tiny "triage a suspicious file" scenario: e.g. the student creates a fake "suspicious" file with `touch`, sets it world-writable with `chmod 777` (deliberately, to then "catch" it), lists permissions with `ls -l` to spot the problem, and fixes it with `chmod 644`; then creates a small fake log file and greps it for a marker string, tying `grep` back in. Close with the same spirit as Track 1's wrap-up: encourage bringing open questions to Discord, and that this track stops at foundation depth on purpose.

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: all tests pass, including `trackTwo.test.ts` (7 lessons, orders 1-7).

- [ ] **Step 4: Build and audit**

Run: `npm run verify`
Expected: build succeeds (17 pages now: 10 existing + 7 new lesson/track pages), audit reports 0 problems.

- [ ] **Step 5: Commit**

```bash
git add src/content/lessons/linux-essentials/07-wrap-up.mdx
git commit -m "content: add Linux Essentials lesson 7 (wrap-up)"
```
