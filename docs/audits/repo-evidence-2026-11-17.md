# Repository evidence audit — FerzDevZ

Date: 2026-11-17 · Source: GitHub REST API, authenticated as the repository owner · 86 owned
repositories scanned, 18 probed in detail (releases, tags, commit count, root contents,
README, manifest).

The question this audit answers: **which projects other people actually reacted to, and
which are finished enough to show a paying client.** Every number below is read from the
API, not from memory or from the repository README.

## 1. Recognition — the uncomfortable part

| Repository | Stars | Forks | Watchers | Verdict |
|---|---|---|---|---|
| `UsernameHunter` | 10 | 3 | — | Only repository other people forked |
| `dhybrid-agent`, `dhybrid-agent-skill`, `dhybrid-agent-dataset`, `ferzlmp`, `fpawn`, `qrcode-api`, `webchat`, `ferz-md-wa` | 2 | 0 | — | Starred, never forked |
| 44 other repositories | 1 | 0 | — | Starred by one account (possibly the author's own network) |
| Public portfolio, `jasakite`, `9router-aegisx`, `ferzdb`, `webpos-apotek` | 0 | 0 | — | No external signal at all |

**Conclusion: there is no project on this account that a community has adopted.** Highest
star count is 10, highest fork count is 3, and no repository has an issue opened by
someone other than the owner. Any sentence on the portfolio that implies traction —
"used by", "popular", "trusted by developers" — would be fabricated and a technical client
will check it in thirty seconds. Recognition is not available as a pitch. Evidence is.

## 2. Finality — what is actually finished

Commit counts come from the `Link: rel="last"` header, so they include every commit on the
default branch.

| Repository | Commits | Releases | Latest tag | Tests | CI | Docs | License | Live |
|---|---|---|---|---|---|---|---|---|
| `dhybrid-agent` | 158 | 4 | `v0.4.0` (manifest 0.9.6) | yes | yes | yes | MIT | — |
| `jasakite` | 62 | 1 | `app-v1.0.1` | yes | yes | yes | — | **200** |
| `freebuff-power` | 101 | 0 | — | no | no | yes | MIT | — |
| `freebuff-proxy` | 85 | 0 | — | no | no | no | — | — |
| `AegisX` | 41 | 0 | — | yes | no | no | — | — |
| `ferzui` | 31 | 0 | 5 tags, `1.0.0` | no | yes | yes | MIT | — |
| `9router-aegisx` | 24 | 1 | `v0.5.110-aegisx.1` | yes | yes | yes | MIT | — |
| `GoVult` | 11 | 0 | — | no | yes | no | — | — |
| `fcopier` | 4 | 0 | — | no | no | yes | — | **200** |
| `ftrack` | 3 | 0 | — | no | no | no | — | — |
| `oauth-system` | 3 | 0 | — | yes | no | no | — | — |
| `webpos-apotek` | 2 | 0 | — | no | no | yes | — | — |
| `nanotok` | 2 | 0 | manifest `3.0.0` | yes | yes | no | MIT | — |
| `ferzdb` | 1 | 0 | — | yes | no | no | — | — |
| `UsernameHunter` | 2 | 0 | — | no | no | no | — | — |

### Tiers

- **A — show these first.** `jasakite` (live, 62 commits, release, tests, CI), `fcopier`
  (live docs, tool that runs), `9router-aegisx` (release, tests, CI, MIT), `dhybrid-agent`
  (158 commits, 4 releases, MIT, CI, tests — but it was removed from the site earlier for
  unverifiable parameter claims, and its manifest version disagrees with its newest tag).
- **B — solid but not client-ready.** `nanotok` (`3.0.0`, tests, CI, stdlib-only — a real
  selling point for offline work), `oauth-system` (tests, no docs), `freebuff-power` and
  `freebuff-proxy` (long histories, no tests, no license — tooling, not product).
- **C — prototypes.** `webpos-apotek` (2 commits; the feature list is real, the automated
  suite is not), `ferzdb` (1 commit), `ftrack` (3 commits), `AegisX` (superseded by the
  9router fork).
- **D — demos and exercises.** The Flutter app batch (`hotel-app`, `laundry-app`,
  `ecommerce-app`, `diabetes-app`, …), school projects (`si-mikro*`, `osis-smkn2`,
  `pemilihan-ketos-smkn2`), and the SAMP scripts.

## 3. What the site now says instead

Eight projects stay, because eight repositories exist with linked sources. What changed:

- Each project carries a `proof` line with only the fact that can be verified:
  `Live · release app-v1.0.1`, `Release v0.5.110-aegisx.1 · CI`, `v3.0.0 · CI`,
  `Test suite included`, `Live docs`, `Early preview`, `In development`.
- `webpos-apotek` no longer claims to *ship* nine modules; it states that the flows are
  verified by hand because there is no automated suite yet.
- `ferzdb` states that it is a working core, not a drop-in SQLite replacement.
- The experience line no longer says "eight shipped projects". It says two are live, two
  carry tagged releases, and every claim is checkable through the linked repository.

## 4. The client-facing argument this evidence supports

Not popularity — verifiability. In order of persuasive strength:

1. **A live deployment the client can open in one click.** Only `jasakite` and `fcopier`
   can do this. Two is enough, and they are the first two things a buyer should meet.
2. **Tagged releases.** `app-v1.0.1` and `v0.5.110-aegisx.1` prove the work reached a
   versioned, closed state rather than drifting.
3. **A test suite and CI.** `jasakite`, `9router-aegisx`, `nanotok`, `oauth-system`,
   `ferzdb` carry tests; the first two also run CI.
4. **Repo depth.** 62 and 24 commits are readable histories; a client can see the work was
   sustained.
5. **Breadth across runtimes.** Next.js, Rust, Python, Playwright, OAuth — with source.

Anything beyond this list would be invented. If a client asks "who uses it", the honest
answer is "nobody yet, here is the code and the deployment", which is a stronger position
than an unverifiable claim that collapses under one GitHub search.

## 5. Open items this audit cannot fix

- `jasakite`, `webpos-apotek`, `ferzdb`, `ftrack`, `oauth-system`, `fcopier` have **no
  license file**. A client who wants to evaluate or reuse code reads a missing license as
  "all rights reserved" — add MIT where reuse is welcome.
- `webpos-apotek`, `ferzdb`, `ftrack` have **no automated tests**. The portfolio now says so
  instead of implying otherwise; closing the gap is the highest-value follow-up.
- Six of eight case studies still have `preview: null`, so the work index has no screenshot
  for them. `jasakite` and `fcopier` can be captured from their live URLs.
