# Remaining Tracks: Skeleton Plan (DRAFT for owner review)

> Status: **skeleton only.** This lists tracks, lessons, hands-on ideas and
> open questions so the owner can reshape the outline before any lesson is
> written. Once approved, each track gets its own detailed plan in the same
> format as `2026-11-06-foundation-blueteam-track2-linux.md` (task per
> lesson, exact frontmatter, review focus).

**Spec:** [2026-11-06-foundation-blueteam-design.md](../specs/2026-11-06-foundation-blueteam-design.md)
**Review this plan builds on:** [2026-11-23-content-and-platform-review.md](../../reviews/2026-11-23-content-and-platform-review.md)

## Remaining tracks at a glance

> **Status 2026-11-24: all eight tracks are written and live (v1.0).**
> Owner decisions: Security Concepts names UU ITE and UU PDP with links to
> the official texts (JDIH BPK), marked not legal advice; SQL uses DB
> Browser for SQLite with a downloadable practice database; Servers &
> Services installs Ubuntu Server 24.04 in VirtualBox or UTM, keeps DNS and
> mail at concept-plus-inspection level, and uses MariaDB; Python uses the
> standard library only; How the Web Really Works has 5 lessons (110 min);
> AI exercises are on paper. External practice sites are optional only and
> limited to ones verified to need no account (the OpenAI tokenizer page).
> Lakera's Gandalf was left out: its address now redirects to a different
> challenge, and no-login play could not be confirmed.

Eight tracks are still `coming-soon` in `src/data/catalog.ts`, 41 lessons in
total if the catalog's lesson counts are kept.

| Proposed order | Track (slug) | Lessons | Minutes | Hands-on | VM | Builds on |
|---|---|---|---|---|---|---|
| 1 | Networking Fundamentals (`networking-fundamentals`) | 5 | 120 | yes | no | Computing Basics, Linux or Windows |
| 2 | Security Concepts (`security-concepts`) | 5 | 120 | yes | no | Computing Basics, Networking |
| 3 | How the Web Really Works (`how-the-web-really-works`) | 4 | 90 | yes (light) | no | Networking |
| 4 | Programming Basics, Python (`programming-basics-python`) | 6 | 180 | yes | no | Linux shell basics, Networking (for L5) |
| 5 | SQL Basics (`sql-basics`) | 5 | 120 | yes | no | none required; Python helps |
| 6 | Servers & Services (`servers-and-services`) | 6 | 180 | yes | **yes** | Linux, Networking, Web, SQL |
| 7 | AI Fundamentals (`ai-fundamentals`) | 5 | 120 | light | no | none |
| 8 | How LLMs Actually Work (`how-llms-actually-work`) | 5 | 120 | light | no | AI Fundamentals, Security Concepts |

**Why this order.** Networking is the most-referenced missing track (four
live lessons already point to it). Security Concepts comes second because
the site is a cybersecurity on-ramp and currently has no track that is
*about* security; it is the bridge the spec describes. Servers & Services
comes late because it is the capstone that uses Linux, networking, web and
SQL together. The two AI tracks are independent and can be written in
parallel by a different contributor at any time.

## Phase 0: before writing new tracks

Do these first, because every new track would otherwise copy the same
problems (details in the review doc):

- [ ] Fix the ten blockers (B1 to B10) in the live tracks.
- [ ] Update `CONTRIBUTING.md` content standard with: sentence length
      target (~20 words, one idea per sentence), "By the end of this lesson"
      bullets, expected-output blocks, "If it didn't work" callouts, the
      practice folder always under `~` and created with `mkdir -p` /
      `-Force`, and the rule "if a step needs admin or sudo, say so up front
      and say why".
- [ ] Platform pieces new tracks depend on: copy button (P1.1), synced OS
      tabs (P1.2), `<Callout>` (P2.5), output blocks (P2.6), lab file
      downloads with SHA-256 (P2.4), `<TrackLink>` (P1.6).

## Cross-track decisions needed from the owner

These change the outline, so they are worth settling before detailed plans:

1. **Installing tools.** Live tracks avoid installs and admin rights. Some
   new tracks are much better with one install: Wireshark (Networking),
   Python (Python track), SQLite (SQL). Allow "one install, at the start of
   the track, from the official site"?
2. **`sudo` rule.** Proposed: no `sudo` on the learner's own machine, ever;
   `sudo` allowed freely inside the disposable Servers & Services VM.
3. **External websites as labs.** Some good free, no-login practice sites
   exist (`scanme.nmap.org` is explicitly allowed to be scanned; Lakera's
   Gandalf for prompt injection; tokenizer playgrounds). Allowed as optional
   steps, never required?
4. **Local legal context.** Security Concepts L4 (ethics and law) would be
   far more useful with an Indonesian angle (UU ITE, UU PDP). Needs a
   reviewer who can check the legal wording.
5. **Lesson counts.** Keep the catalog's counts, or let outlines change
   them? This draft keeps all counts as-is.

## Common skeleton for every track

Each track follows the existing content standard:

- `phase: 'Orientation'` (1 lesson, includes "Before you start" setup and the
  practice folder), `phase: 'Core Concepts'`, and exactly one
  `phase: 'Wrap-up'` lesson (recap, one combined exercise, where to go
  next).
- Practice folder: `~/<track-slug>` (or `$HOME\<track-slug>` on Windows).
- Each lesson: learning goals, 3 to 5 `##` sections, hands-on, inline
  defender tie-in, `### What to notice`, 2 to 3 `reflectQuestions`, at least
  one free `resources` link.
- Task breakdown per track (same as Track 2's plan): Task 1 scaffold
  (`index.md`, structural test `trackN.test.ts`, catalog flip), one task per
  lesson, last task updates cross-track links and `updatedAt`.

---

## Track 1: Networking Fundamentals

> **Status 2026-11-23: written and live (v1.0).** Owner decisions: Wireshark
> as an optional step only, no scanning beyond your own machine, a short
> IPv6 intro. Windows learners use PowerShell (not WSL) for this track.

- **Category:** Networking & Web. **5 lessons, 120 min.** Hands-on on the
  learner's own machine with built-in tools (`<CodeTabs>` for
  macOS/Linux/Windows, since the commands really differ here).
- **Safety:** read-only inspection of your own machine and network only.
  No scanning of anything except `localhost` (and optionally
  `scanme.nmap.org`, see decision 3).

| # | Phase | Lesson | Core ideas | Hands-on | Defender tie-in |
|---|---|---|---|---|---|
| 1 | Orientation | What a Network Is, and Yours in Particular | hosts, NIC, MAC vs IP, LAN vs internet, router/gateway, private vs public IP | `ip addr` / `ifconfig` / `ipconfig /all`; find your gateway; compare local IP with your public IP | "Which machine is 10.0.0.23?" is the first question in most alerts |
| 2 | Core Concepts | IP Addresses and Subnets | IPv4 structure, CIDR, private ranges (RFC 1918), subnet masks, a first look at IPv6 | work out network, broadcast and host count for 3 subnets by hand; check against your own mask | reading firewall rules and scoping an incident ("is this IP inside our network?") |
| 3 | Core Concepts | Ports, TCP, and UDP | ports and services, TCP handshake, UDP, well-known ports | list your listening ports (`ss -tuln` / `lsof -i -P` / `Get-NetTCPConnection -State Listen`); match each to a process | an unexpected listening port is a classic backdoor sign |
| 4 | Core Concepts | How a Packet Gets There: Routing, DNS, ARP, NAT | routing hops, DNS resolution, ARP, NAT at home | `traceroute` / `tracert`, `nslookup`, `arp -a`; optional Wireshark capture of one DNS lookup | DNS logs and ARP tables as evidence; why NAT hides internal IPs in logs |
| 5 | Wrap-up | Wrap-up: Map Your Own Connection | recap | combined exercise: draw the path from your laptop to a website, with your IP, subnet, gateway, DNS server, hop count and the port used | where to go next: Security Concepts, How the Web Really Works |

**Open questions:** Wireshark in L4 (needs install, needs admin on Windows
for Npcap)? Include IPv6 beyond a mention?

---

## Track 2: Security Concepts

- **Category:** Security Foundations. **5 lessons, 120 min.** Mostly
  thinking tools, with small concrete hands-on (hashing, certificates,
  looking up real CVEs).
- **Safety:** recon only against your own machine or domains you control;
  passive lookups only. A clear "authorization first" rule stated in L4 and
  repeated in the wrap-up.

| # | Phase | Lesson | Core ideas | Hands-on | Defender tie-in |
|---|---|---|---|---|---|
| 1 | Orientation | What Security Is Protecting: CIA and AAA | confidentiality, integrity, availability; authentication, authorization, accounting; assets | classify 6 short real-world incidents by which CIA property broke | the common language every later course and job interview uses |
| 2 | Core Concepts | Threat, Vulnerability, Risk | threat actors, vulnerabilities, risk = likelihood x impact, CVE and CVSS, defense in depth | look up a real CVE on NVD; read its CVSS vector; risk-rate the spec sheet from Computing Basics | prioritising patching and alerts |
| 3 | Core Concepts | Crypto Basics: Hashing, Encryption, Certificates | hash vs encryption vs encoding, symmetric vs asymmetric, TLS certificates, why passwords are hashed | hash a file (`shasum -a 256` / `sha256sum` / `Get-FileHash`), change one byte, compare; view a site's certificate in the browser; verify a download against its published hash | evidence integrity, spotting tampered downloads, base64 is not encryption |
| 4 | Core Concepts | Ethics, Law, and a First Taste of Recon | authorization and scope, responsible disclosure, local law (decision 4), passive vs active recon | passive recon on yourself: what your machine exposes (callback to Networking L3), `whois`/`dig` on a domain you own or `example.com` | knowing where the line is before you ever touch a tool |
| 5 | Wrap-up | A First Taste of Forensics, and Wrap-up | timelines, evidence handling, chain of custody, order of volatility (callback to RAM vs disk) | combined exercise: build a short timeline of your own last logins and recently changed files, hash the evidence files you collected | where to go next: Discord, deeper blueteam.id content |

**Open questions:** Which local laws to name, and who reviews that wording?
Keep "recon" passive only, or include one `nmap localhost`?

---

## Track 3: How the Web Really Works

- **Category:** Networking & Web. **4 lessons, 90 min.** Hands-on in the
  browser's DevTools and with `curl` (built into macOS, Linux and Windows
  10+).
- **Safety:** only inspect your own browser and public pages; never paste
  real session cookies anywhere.

| # | Phase | Lesson | Core ideas | Hands-on | Defender tie-in |
|---|---|---|---|---|---|
| 1 | Orientation | From URL to Page | URL parts, DNS, TCP, TLS, HTTP request/response, browser rendering | DevTools Network tab on a simple page; count requests and domains | every web attack and web log starts here |
| 2 | Core Concepts | HTTP Up Close | methods, status codes, headers, HTTPS | `curl -v`, `curl -I`; read status codes and headers; read a sample web server access log line | 401/403/404/500 patterns in access logs |
| 3 | Core Concepts | HTML, Browsers, and Search Engines | HTML/CSS/JS roles, view source, crawlers, `robots.txt`, indexing | write a 10-line HTML file and open it locally; read a real site's `robots.txt` | why `robots.txt` is not security, how search engines expose things that should not be public |
| 4 | Wrap-up | Cookies, Sessions, and Wrap-up | cookies, sessions, cookie flags (`Secure`, `HttpOnly`, `SameSite`), why a stolen cookie is a stolen login | find cookies in DevTools Application tab; combined exercise: trace one login from URL to cookie | session hijacking, phishing kits that steal cookies |

**Open question:** 4 lessons is tight with search engines and a wrap-up.
Keep 4, or go to 5 and give cookies and sessions their own lesson?

---

## Track 4: Programming Basics (Python)

- **Category:** Programming & Data. **6 lessons, 180 min.** One install
  (Python 3 from python.org or the OS package manager, decision 1).
  Everything else is the standard library.
- **Safety:** scripts only read and write inside `~/programming-basics-python`;
  the socket lesson uses `localhost` only.
- **Theme:** every lesson builds a piece of one small log-triage script, so
  the wrap-up assembles something real.

| # | Phase | Lesson | Core ideas | Hands-on | Defender tie-in |
|---|---|---|---|---|---|
| 1 | Orientation | Why Python, and Your First Script | interpreter, REPL, running a `.py` file, an editor | install check, REPL arithmetic, `hello.py` | the language most security tooling and automation is written in |
| 2 | Core Concepts | Variables, Types, and Input | strings, numbers, booleans, `input()`, f-strings, type errors | a script that asks for a username and prints a formatted log line | reading other people's scripts during an investigation |
| 3 | Core Concepts | Decisions and Loops | `if`, `for`, `while`, lists | loop over a hard-coded list of log lines, flag "Failed password" | the logic behind every detection rule |
| 4 | Core Concepts | Functions, Files, and Dictionaries | functions, reading a file, dictionaries for counting | read a downloadable `auth.log` sample (P2.4), count failed logins per IP | turning a pile of logs into one answer |
| 5 | Core Concepts | Talking to the Network: a First TCP Socket | client vs server, `socket`, ports (callback to Networking L3) | a tiny echo server and client on `localhost` in two terminals | what a reverse shell actually is at the socket level |
| 6 | Wrap-up | Wrap-up: A Mini Log-Triage Tool | recap | combined exercise: script that reads the log, counts failures per IP, writes a report file | where to go next: SQL Basics, Discord |

**Open question:** Teach `venv` and `pip`, or stay strictly standard
library? (Suggest: mention only, standard library only.)

---

## Track 5: SQL Basics

- **Category:** Programming & Data. **5 lessons, 120 min.** SQLite: one file,
  no server. The learner downloads a prepared practice database from
  `public/labs/sql-basics/` (P2.4).
- **Safety:** works on a downloaded copy; the learner can re-download it any
  time they break it.
- **Theme:** a small fictional company dataset: `users`, `logins`,
  `devices`, `alerts`.

| # | Phase | Lesson | Core ideas | Hands-on | Defender tie-in |
|---|---|---|---|---|---|
| 1 | Orientation | What a Database Is | tables, rows, columns, keys, SQL vs spreadsheets; setup | open the practice DB, `.tables`, `.schema`, first `SELECT *` | SIEMs and log platforms use SQL-like query languages |
| 2 | Core Concepts | Asking Questions: SELECT and WHERE | `SELECT`, `WHERE`, `AND`/`OR`, `ORDER BY`, `LIMIT`, `LIKE` | find all failed logins for one user, newest first | the shape of nearly every log search |
| 3 | Core Concepts | Counting and Combining: GROUP BY and JOIN | `COUNT`, `GROUP BY`, `HAVING`, `INNER`/`LEFT JOIN` | which IPs have more than 5 failures; join logins to users to see who was targeted | brute-force and password-spray detection |
| 4 | Core Concepts | Changing Data, and Basic Administration | `INSERT`, `UPDATE`, `DELETE`, transactions, backups, users and `GRANT` (concept), SQL injection (concept, why parameterised queries) | update a record inside a transaction and roll it back; take a backup copy | least privilege for database accounts; the most famous web vulnerability, explained |
| 5 | Wrap-up | Wrap-up: Investigate a Suspicious Night | recap | combined exercise: from one alert, find the account, its logins, the device, and the timeline, all in SQL | where to go next: Servers & Services |

**Open questions:** SQLite CLI (ships on macOS and most Linux; Windows needs
a download) or DB Browser for SQLite (GUI, one installer for all three)?

---

## Track 6: Servers & Services

- **Category:** Networking & Web. **6 lessons, 180 min. `needsVM: true`.**
  Everything runs inside one Ubuntu Server VM (VirtualBox on x86_64, UTM on
  Apple Silicon), with a snapshot taken in L1 so the learner can always roll
  back. `sudo` is allowed inside the VM (decision 2).
- **Safety:** the VM uses NAT / host-only networking; nothing is exposed to
  the internet.

| # | Phase | Lesson | Core ideas | Hands-on | Defender tie-in |
|---|---|---|---|---|---|
| 1 | Orientation | What a Server Is, and Building Your Lab | client/server, services, daemons, why a VM | create the VM, install Ubuntu Server, take a snapshot, `systemctl status` | a lab you can break without consequences |
| 2 | Core Concepts | Remote Access with SSH | SSH, keys vs passwords, `sshd_config` | SSH from host into the VM, set up a key, disable password and root login | the most attacked service on the internet; reading `auth.log` for real this time |
| 3 | Core Concepts | A Web Server | nginx, ports 80/443, document root, access and error logs | install nginx, serve the HTML page from the Web track, read the access log while you browse | reading web logs during an incident |
| 4 | Core Concepts | A Database Server | MariaDB or PostgreSQL, listening on localhost only, database users | install, bind to localhost, create a least-privilege user, run a query from the SQL track | an exposed database is one of the most common breach causes |
| 5 | Core Concepts | DNS, Mail, and Where Logs Go | DNS server roles, mail (SMTP/IMAP) at concept level, `journald`, `rsyslog`, central logging | `journalctl -u nginx`, `journalctl -u ssh`, a `dig` against the VM's resolver | why defenders want logs shipped off the box |
| 6 | Wrap-up | First Hardening Steps, and Wrap-up | updates, firewall (`ufw`), least privilege, disable what you do not use | combined exercise: a hardening checklist on your own VM, then verify with `ss -tuln` that only expected ports listen | where to go next: Discord, deeper blueteam.id content |

**Open questions:** Run a real DNS or mail server (more moving parts), or
keep both at concept level plus inspection? Provide a ready-made VM image to
skip the install, or keep the install as a learning step?

---

## Track 7: AI Fundamentals

- **Category:** AI Fundamentals. **5 lessons, 120 min.** Mostly conceptual;
  hands-on is small exercises (a downloadable CSV, paper exercises, optional
  free no-login web demos).
- **Safety and privacy:** never paste real company data, credentials or
  personal data into an AI tool.

| # | Phase | Lesson | Core ideas | Hands-on | Defender tie-in |
|---|---|---|---|---|---|
| 1 | Orientation | What AI and Machine Learning Actually Are | AI vs ML vs deep learning, rules vs learned patterns, the hype gap | sort 10 "AI" product claims into rule-based, ML, or marketing | evaluating vendor claims in security tools |
| 2 | Core Concepts | How a Model Learns | data, features, labels, training vs testing, overfitting | build a tiny spam rule set by hand, then see where it fails | why detection models drift |
| 3 | Core Concepts | Kinds of Learning, and Where Security Uses Them | supervised, unsupervised, reinforcement; classification, anomaly detection | match 6 security use cases (spam filter, UEBA, malware classifier…) to a type | knowing what your tools are doing underneath |
| 4 | Core Concepts | Limits and Failure Modes | false positives and negatives, base rates, bias, data poisoning, adversarial examples | confusion matrix from a small alert dataset (CSV); compute precision and recall | alert fatigue explained with numbers |
| 5 | Wrap-up | Using AI Responsibly at Work, and Wrap-up | data privacy, verifying output, company AI policies | combined exercise: assess a fictional "AI-powered" detection tool using everything above | where to go next: How LLMs Actually Work |

---

## Track 8: How LLMs Actually Work

- **Category:** AI Fundamentals. **5 lessons, 120 min.** Conceptual first,
  with optional hands-on in free tokenizer and prompt-injection practice
  sites (decision 3).
- **Safety:** prompt-injection practice only on sites built for it; never
  against real products without permission (callback to Security Concepts
  L4).

| # | Phase | Lesson | Core ideas | Hands-on | Defender tie-in |
|---|---|---|---|---|---|
| 1 | Orientation | From Text to Tokens | tokens, vocabulary, why models count tokens, context window | tokenise a few sentences (including Indonesian and code) in a tokenizer playground | why long logs get truncated when pasted into a model |
| 2 | Core Concepts | Embeddings: Meaning as Numbers | vectors, similarity, semantic search, RAG at concept level | paper exercise: place words on a 2D "meaning map" | how AI search over internal documents can leak them |
| 3 | Core Concepts | Transformers and Next-Token Prediction | attention (intuition only), training vs inference, temperature, why hallucinations happen | same prompt at different temperatures (optional, any free chat tool) | never trust model output as evidence without checking |
| 4 | Core Concepts | Prompt Injection and Jailbreaks | system vs user prompts, direct and indirect injection, jailbreaks, OWASP Top 10 for LLM Applications | optional: first levels of a prompt-injection practice game | the most common new vulnerability class in AI features |
| 5 | Wrap-up | Data Leakage, Agents, and Wrap-up | training data leakage, sensitive data in prompts, tools and agents with real permissions (callback to CI/CD as attack surface) | combined exercise: threat-model a fictional company chatbot that can read tickets and send email | where to go next: Discord |

---

## Suggested delivery rhythm

One track at a time, each as its own branch and PR, following the Track 2
pattern:

1. Owner approves or edits the outline for that track in this file.
2. Detailed plan for that track (task per lesson, exact frontmatter).
3. Draft lessons, run `npm test` and `npm run verify`.
4. Owner review pass (content, safety of every hands-on step, readability
   against the new sentence-length rule).
5. Flip to `live`, bump nothing else, update cross-track links via
   `<TrackLink>`.
