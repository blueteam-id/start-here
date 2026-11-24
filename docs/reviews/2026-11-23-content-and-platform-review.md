# Content and Platform Review (2026-11-23)

Scope: the five live tracks (Computing Basics, Linux Essentials, Windows
Foundations, Git Fundamentals, GitHub/GitLab Fundamentals; 29 lessons, about
30,000 words) and the site itself. The content was read as a complete
beginner would read it: someone new to cybersecurity, maybe reading in a
second language, following every command on their own machine.

Severity labels used below:

- **Blocker**: a beginner following the lesson exactly will get stuck or get
  a different result than the lesson promises.
- **Should fix**: works, but confusing, inconsistent, or slightly wrong.
- **Polish**: makes it better, not urgent.

---

## Part 1: Lesson content

### 1.1 What already works well

- The program has a real shape. Every track has an orientation, core lessons
  and one wrap-up, and the wrap-up always chains skills into one scenario.
  That is rare for free material.
- The practice-folder rule (`~/linux-essentials`, `windows-foundations`) is a
  great beginner safety net and the lessons hold to it.
- The security tie-ins are concrete, not decoration: `%TEMP%` as a drop
  point, Run keys as persistence, Event ID 1102, "pwn requests", leaked
  secrets in Git history. A beginner leaves each track knowing *why* the
  skill matters.
- Windows Lesson 4 (Active Directory) is the best-written lesson in the
  program: the badge-office analogy, short sentences, plain words. It should
  be the style reference for everything else.
- Computing Basics' "spec sheet" carried across lessons is a nice thread that
  pays off in the wrap-up.

### 1.2 Blockers (fix these first)

> **Status 2026-11-23:** B1 to B10 fixed in the lesson files (not yet
> committed). Two small related fixes went in with them: GitHub L2 now runs
> `cd ~` before cloning (avoids a repo inside a repo), and the GitHub wrap-up
> runs `git switch main && git pull` before branching. Track `version` and
> `updatedAt` were not bumped.

| # | Where | Problem a beginner hits | Suggested fix |
|---|---|---|---|
| B1 | Git L3, L4, L5, GitHub L2 | `git init` still creates `master` on most fresh installs (Git only uses `main` if `init.defaultBranch` is set). Every later `git switch main` / `git push origin main` then fails. | In Git L1, add `git config --global init.defaultBranch main` next to the name/email config, and say why. |
| B2 | Git L2 onward, on Windows | In Windows PowerShell 5.1 (the default on Windows 10/11), `echo "x" > notes.txt` writes UTF-16. Git treats the file as binary, so `git diff` prints "Binary files differ" instead of the `+`/`-` lines the lesson describes. | Tell Windows users to run this track in **Git Bash** (installed with Git for Windows), or use `Set-Content`/`Add-Content` in a `<CodeTabs>` Windows tab. The track index currently promises Git "runs identically", which is true for Git but not for the shell around it. |
| B3 | Git L4 (`git revert HEAD`) | `git revert` opens a text editor for the commit message. A beginner lands in Vim with no idea how to leave. | Use `git revert --no-edit HEAD`, and add one line on how to quit Vim (`Esc`, then `:q`) for the next time it happens. Same risk for any `git merge` that creates a merge commit. |
| B4 | Git L2 (`git log`) | `git log` opens a pager when output is long. Nothing says "press `q` to quit". | One sentence: "If the output fills the screen, press `q` to get your prompt back." |
| B5 | Git L3 (merge conflict) | "Open `conflict.txt`" but no lesson in any track teaches a text editor. | Add a short "editing a file" note: `nano conflict.txt` (macOS/Linux/WSL) or `notepad conflict.txt` (Windows), with save/exit keys. Better: teach `nano` once in Linux L3 or L4 and link back. |
| B6 | GitHub L2 (first `git push`) | GitHub no longer accepts account passwords over HTTPS. The first push asks for a password and fails with "Authentication failed". Personal access tokens are only explained two lessons later. | Add an "authenticate once" step before the first push: on Windows/macOS the Git Credential Manager browser login usually just works; on Linux/WSL create a fine-grained PAT (scoped to the one practice repo, short expiry) or use `gh auth login`. This is also a good place for the "token is a password, never paste it in chat" habit. |
| B7 | GitHub L1 + L3 + L5 | L1 says make the repo **private**. L3 and the wrap-up say add a branch protection rule. On GitHub Free, protection rules and rulesets are **not enforced on private repositories** (needs Pro/Team). The track index promises "only the free tier". | Either make the practice repo **public** (it only contains practice notes; say so explicitly and say why that is fine), or keep it private and present protection as "look at the screen, here is what it would enforce". Public is simpler. |
| B8 | GitHub L5 wrap-up | Step 2 adds "require one approval before merge"; step 4 then asks the learner to merge their own PR. You cannot approve your own PR, so the learner is stuck (or has to discover the admin bypass checkbox). | Either do not require approvals in the exercise (require "pull request before merging" with 0 approvals), or explain the bypass explicitly and why a real team would not allow it. |
| B9 | Windows L6 (Event Viewer) | Reading the **Security** log needs an elevated (Administrator) prompt. `Get-WinEvent -LogName Security` from a normal prompt fails with "unauthorized operation", and the Event Viewer Security log is also blocked. The lesson never mentions this. | Add "open Terminal as Administrator for this lesson" with a short reason, which is also a natural link back to UAC in L3. |
| B10 | Git L1 (`user.email`) | "Use your real identity" plus a push to GitHub one track later means the learner's personal email becomes public in commit history, forever. | Recommend the GitHub-provided `noreply` address (Settings, Emails) and explain it in one line. This is itself a privacy lesson worth teaching. |

### 1.3 Should fix

> **Status 2026-11-23:** all "Accuracy and consistency" items below are
> fixed, including the Linux gaps (Linux lesson times went up, track total
> now 180 min). Reflect questions: Linux L6 Q1 and Windows L5 Q3 rewritten;
> Linux L1 questions rewritten as part of the readability sample.
> Readability: all Linux, Windows, Git and GitHub/GitLab lessons rewritten
> in plain style; every code block is byte-for-byte unchanged. Average
> sentence length now 14.3 (Linux), 15.9 (Windows), 15.5 (Git), 17.2
> (GitHub/GitLab). Computing Basics (19.0) was left as is.

**Accuracy and consistency**

- **Stale cross-references.** Windows L2 line 21 says the object pipeline
  "will matter a lot in Lesson 4", and Windows L6 line 56 says "the filtering
  pipeline in Lesson 4". PowerShell is Lesson 5 (Lesson 4 is Active
  Directory). Both should say Lesson 5.
- **Stale track status.** Computing Basics wrap-up (line 79) says Windows
  Foundations "is still being written". It is live. (See platform item P1.6
  for a way to stop this class of bug.)
- **Catalog and content disagree.** `catalog.ts` says Linux Essentials covers
  "grep and cp"; the track's own `index.md` says "grep and chmod".
- **Windows evaluation VM.** Windows L1 points to Microsoft's free Windows 11
  developer VM images. Those downloads have been unreliable or paused at
  times; the dependable free fallback is the 90-day Windows 11 Enterprise
  evaluation ISO from the Microsoft Evaluation Center. Also worth one line:
  on an Apple Silicon Mac you need the ARM build of Windows (a nice callback
  to the architecture lesson in Computing Basics).
- **Practice folder location drifts.** Linux uses `~/linux-essentials`,
  Windows uses `$HOME\windows-foundations`, but Git uses a bare
  `mkdir git-fundamentals` wherever the terminal happens to be, and GitHub L2
  clones `git-practice` wherever the learner is. A learner still inside
  `git-fundamentals` will clone a repo inside a repo. Use `~/git-fundamentals`
  and `cd ~` before cloning.
- **Re-running a lesson breaks.** `mkdir git-fundamentals` and
  `New-Item -ItemType Directory` both error if the folder exists (a learner
  coming back the next day). Use `mkdir -p` and `New-Item ... -Force`.
- **Linux L1 hands-on vs WSL.** Linux L1 says "if you are inside WSL, run…",
  but WSL is only installed in L2. Windows learners cannot do L1's hands-on.
  Either move the WSL install into L1's "Before you start" (which also
  matches the content standard's own rule) or say "Windows users: do this
  after Lesson 2."
- **Windows wrap-up writes to a real registry key.** The exercise writes to
  the real `HKCU\...\Run` key. It cleans up, but if the learner stops halfway
  Windows will try to launch an empty `update-helper.exe` at every login. The
  content standard says hands-on must not touch real registry keys it does
  not own. Use a practice key (`HKCU:\Software\windows-foundations-practice\Run`)
  for the write, and only *read* the real Run key.
- **Windows wrap-up does not use Lesson 6.** The combined exercise uses
  `icacls` and the registry, but skips Event Viewer, the lesson most tied to
  triage. Even a read of the last few 4624 events would close that loop.
- **Reflect question style.** CONTRIBUTING asks for "one idea per question,
  no stacked clauses". Several break that: Linux L1 Q1 asks two questions in
  57 words; Linux L6 Q1 stacks five sub-questions; Windows L5 Q3 is an
  instruction, not a question. Windows and Git questions are already close to
  the target and can be the model.
- **Gaps a beginner will feel in Linux Essentials:**
  - How to get help: `man`, `--help`, `type`. Windows teaches `Get-Help`; Linux
    never teaches its equivalent.
  - A text editor (`nano`), needed later by Git and by Servers & Services.
  - A guided read-only tour of `/etc`, `/var/log`, `/home`, `/tmp`. The
    lessons talk about `/var/log/auth.log` often but never look at a real one
    (on modern Ubuntu/WSL: `journalctl` or `ls /var/log`).
  - `sudo` and users (`whoami`, `id`, `/etc/passwd` read-only). Users and
    groups are central to the permissions lesson but never shown.
  - `tail -f` is described but not run. It is easy to run safely with two
    terminals and `echo ... >> sample.log`.

**Readability (the biggest single improvement available)**

The content standard says many readers use English as a second language and
"simple phrasing beats clever phrasing". Measured over lesson prose
(code blocks, headings and lists excluded):

| Track | Avg words per sentence | Sentences over 35 words |
|---|---|---|
| Computing Basics | 19.7 | 8 |
| Git Fundamentals | 26.3 | 18 |
| GitHub/GitLab | 27.8 | 13 |
| Linux Essentials | 27.0 | 58 |
| Windows Foundations | 30.4 | 46 |

Plain-language guidance usually targets 15 to 20. Computing Basics is
already there; the later tracks drifted. Common patterns to cut:

- Comma chains that join three or four clauses into one sentence ("..., the
  kind of thing ..., which ..., exactly ...").
- Filler intensifiers: "exactly" appears 78 times across 29 lessons, plus
  "genuinely", "literally", "sit with that", "not optional", "without
  exaggeration".
- The same point made twice. Linux L1 and L2 each spend a full paragraph on
  "fluency is not optional"; the `rm` warning is repeated four times in L3.

A practical rule for the content standard: one idea per sentence, about 20
words, and if a paragraph has no command or new fact, cut it. Doing this
would likely shorten Linux and Windows by 20 to 30% without losing anything.

### 1.4 Polish: what would help a beginner most

These are additions that fit the "foundation, no gimmicks" principle.

1. **"By the end of this lesson you can…"** two or three bullets at the top of
   each lesson. It tells a beginner what to focus on and helps reviewers
   check that the lesson delivers it.
2. **Show expected output.** Most commands say "you will see something like"
   in prose. A short sample output block (marked as output, not a command)
   lets a beginner check themselves without asking in Discord. The
   permission-string example in Linux L5 shows how well this works.
3. **"If it didn't work" boxes** for the two or three most likely errors per
   lesson (`command not found`, `permission denied`, `Access is denied`,
   `fatal: not a git repository`). Computing Basics L1 already hints at this
   ("tell command not found from permission denied"); make it a pattern.
4. **"What a good answer touches on"** for reflect questions, hidden in a
   collapsible block. Beginners often do not know if their reasoning is on
   track. Not a quiz, no score, just a nudge.
5. **A tiny glossary** per track or site-wide (kernel, process, PID, ACL,
   hive, commit, remote, PAT…). Many terms are bolded once and then assumed.
6. **One diagram per track** where a picture beats text: CPU/RAM/storage,
   the filesystem tree, the Git three-areas model, the fork-and-pull flow.
   The design spec already calls for an overview visual on track landings.
7. **A "where to start" note** for career changers: which track to take
   first if you only have a Windows laptop, a Mac, or a phone.
8. **Make the sample data more realistic** where it is cheap: the Linux
   `sample.log` could use real `sshd` line format
   (`sshd[1234]: Failed password for invalid user admin from ...`). The
   learner will recognise it the first time they see a real `auth.log`.

---

## Part 2: The platform

### 2.1 What already works well

- Static Astro, real URLs per lesson, no framework runtime, small vanilla JS
  islands. The right fit for "no login, as simple as possible".
- Progress in `localStorage` is defensive (never throws, validates data) and
  well tested.
- CI runs tests plus a build audit; the no-em-dash rule is enforced
  automatically.
- SEO basics, sitemap, canonical URLs and OG tags are in.

### 2.2 Suggested additions, all static, all without accounts

Priority 1: small changes, big effect for learners

> **Status 2026-11-23:** P1.1 to P1.7 implemented. Notes: the copy button
> only appears on shell/PowerShell blocks (not sample output); OS tabs also
> support Left/Right arrow keys; progress shows on track cards (home and
> catalog) and the track page ("Continue: <next lesson>"), not as a separate
> homepage section; drift is guarded by `src/content/catalogSync.test.ts`;
> a site-wide `:focus-visible` outline was added with the skip links.

| # | Feature | Why | Notes |
|---|---|---|---|
| P1.1 | **Copy button on code blocks** | Beginners mistype long commands (PowerShell pipelines especially). The design spec already lists "copyable code blocks". | Tiny vanilla script; copy only the command lines, not `#` comments if possible. |
| P1.2 | **OS tabs remember the choice and switch together** | Computing Basics L1 has three separate tab groups; a Windows user clicks "Windows" three times per page, on every page. | On click, switch every `CodeTabs` on the page and save the choice in `localStorage`. First visit: pick a default from `navigator.userAgent`. |
| P1.3 | **Previous lesson link** | The footer only has "Next lesson". Going back means the sidebar. | One link. |
| P1.4 | **"Report a problem with this lesson" link** | The fastest way to get the community fixing content. | Prefilled GitHub issue URL (track, lesson slug, page URL in the body) plus a `mailto:` fallback for people without GitHub. No backend. |
| P1.5 | **Show progress outside the lesson page** | Progress is only visible inside a track's lessons. The catalog, track landing and homepage could show "2 of 5 done" and a "Continue: Lesson 3" button. | Reads the same `localStorage` key; pure progressive enhancement. |
| P1.6 | **Stop catalog and content drifting** | `catalog.ts` and each `index.md` both carry summary, minutes and lesson count, and they already disagree. Lessons hard-code other tracks' status in prose. | Derive live tracks' catalog fields from the content collection (or add a test that they match). For cross-track mentions, a small `<TrackLink slug="...">` component that renders "live" or "coming soon" from the catalog, so prose never goes stale. |
| P1.7 | **Skip-to-content link and a quick accessibility pass** | Lesson pages put the whole sidebar before the content; keyboard and screen reader users tab through it every time. | Standard skip link in `BaseLayout`; check focus styles on chips and tabs. |

Priority 2: medium effort, still static

> **Status 2026-11-23:** P2.1 (Pagefind search at `/search/`), P2.2
> (`/start/`), P2.3 (`/glossary/`, 41 terms), P2.5 (`<Callout>`), P2.6
> (` ```text ` output blocks), P2.7 and P2.8 (`/privacy/` with progress
> copy, paste, and reset) implemented. P2.4 (lab file downloads) was built
> on 2026-11-24 with the SQL and Python tracks (`<LabFile>`).

| # | Feature | Why | Notes |
|---|---|---|---|
| P2.1 | **Site-wide search across lessons** | "Where was that `icacls` command?" The catalog search only matches track titles. | [Pagefind](https://pagefind.app) indexes the built HTML at build time and searches in the browser. No server, no account. |
| P2.2 | **"Start here" / learning path page** | The most common newcomer question ("where do I start?") is the reason the site exists. A one-page suggested order, with "if you only have X hours" variants. | Static page; can reuse catalog data. |
| P2.3 | **Glossary page** | See content item 1.4.5. | A content collection of terms; lessons can link to `/glossary#kernel`. |
| P2.4 | **Lab file downloads** | SQL, Python, Networking and Servers & Services will need sample files (a `.sql` seed, a log file, maybe a `.pcap`). Heredocs work for 7 lines, not for 500. | Serve from `public/labs/<track>/` with a SHA-256 shown next to each file, which also teaches the hashing habit from Security Concepts. |
| P2.5 | **Callout component set** | Lessons improvise notes as prose. A shared `<Callout type="tip|warning|windows|stuck">` makes "If it didn't work" and safety warnings consistent and scannable. | Pure Astro component, no JS. |
| P2.6 | **Output blocks** | Visually separate "type this" from "you should see this". | A ` ```text title="Expected output" ` convention or a tiny component. |
| P2.7 | **Progress export, import and reset** | Progress is lost when someone clears their browser or switches laptops. | "Copy my progress" (a short code or JSON) and "Paste progress". Plus a one-line note on the site: progress lives only in your browser. |
| P2.8 | **Privacy note** | "No login" is a selling point; say it plainly: no analytics, no cookies, progress stays in your browser. | One FAQ entry, or a footer line. |

Priority 3: nice to have

- Per-track OG image generated at build time (shared lesson links in Discord
  look much better with one).
- A print stylesheet (people print cheat-sheets; hide sidebar and nav).
- A "What's new" page built from track `version` and `updatedAt`.
- An `updatedAt` per lesson, shown small, for when single lessons get fixed.

### 2.3 Deliberately not recommended

These would break the "no login, as simple as possible" principle or the
anti-goals in the design spec:

- Accounts, comments, or a forum on the site (that is what Discord is for).
- Scored quizzes, badges, streaks, certificates.
- Third-party analytics or tracking pixels. If usage numbers are ever
  needed, server access logs from the static host are enough.
- An in-browser terminal or VM. High maintenance, and the program's strength
  is that learners use their own real machine.

### 2.4 Small code notes

- `LessonView.astro` imports `DISCORD_INVITE_URL` from `Header.astro`, while
  `src/lib/site.ts` is the documented single source. Import from `site.ts`.
- The FAQ answer "Gak ada" is friendly for Indonesian readers but reads as a
  joke to anyone else. Worth a short English line next to it, since the site
  is English-only on purpose.
