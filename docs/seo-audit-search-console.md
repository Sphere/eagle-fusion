# SEO Audit — Search Console Findings & Fixes

**Scope:** Aastrika Sphere organic search health · **Data:** Google Search Console, last 3 months (Web), pulled 2026-07-07 · **Branch:** `feature/opt2`

## Summary

Aastrika Sphere earned **3,705 clicks from 27,360 impressions** in Google Search over the last three months, with an average position of ~6.2. The platform already has a strong technical SEO foundation (server-side rendering, a 498-URL sitemap, structured data, per-page meta tags). This audit combined that live Search Console data with a review of the codebase and found three concrete issues that were **splitting and suppressing organic traffic** — all are now fixed. It also identifies four data-backed opportunities to grow traffic further.

**Headline result:** ~38% of course URLs and the single highest-traffic page (the home page) were each being indexed by Google as two or more competing duplicates. Those signals are now consolidated.

> **New to these terms?** Every metric and technical word used in this report is defined in plain English under [Key terms](#key-terms--in-plain-english) below. Terms elsewhere in the document refer back there.

## Key terms — in plain English

| Term | What it means |
|---|---|
| **Impression** | One appearance of an Aastrika Sphere link in Google's search results — each time someone *sees* the site listed, whether or not they click. |
| **Click** | A person actually clicking one of those results to visit the site. |
| **CTR** (Click-Through Rate) | Clicks ÷ Impressions, shown as a percentage — how often people who see the result go on to click it. Higher usually means a more compelling title and description. Example: 100 impressions and 15 clicks = 15% CTR. |
| **Position** (average position) | The average ranking spot of the site's result in Google. **1** is the very top of page one; higher numbers are further down (1–10 ≈ page one, 11–20 ≈ page two). Lower is better. |
| **Indexing** | Google storing a page in its database so it can appear in search results at all. |
| **Canonical URL** | The single "official" web address a page declares for itself, so when the same content is reachable at several addresses, Google knows which one to rank — instead of treating them as competing duplicates. |
| **Duplicate URLs** | Two or more addresses that show the same page (e.g. with and without a trailing "/"). Indexed separately, they compete and each ranks lower than the combined page would. |
| **Slug** | The readable words at the end of a web address, e.g. the `care-of-sick-newborn` part of a course URL. Descriptive slugs help users and ranking. |
| **Sitemap** | A file listing all the site's pages, submitted to Google to help it find and crawl every URL. |
| **Structured data** | Hidden, machine-readable tags that let Google show "rich" results such as star ratings, course info, or breadcrumbs — which stand out and lift click rates. |
| **Core Web Vitals** | Google's measures of real-world page experience — loading speed, responsiveness, and visual stability — which influence ranking and how users feel about the site. |

## How the audit was run

Google's Search Console performance export (queries, pages, devices, countries) was analysed alongside the application source (`SeoService`, `generate-sitemap.js`, `robots.txt`, `.htaccess`, sitemap). Every finding below is grounded in a specific data point *and* a specific line of code, and each fix ships with unit tests.

## Performance snapshot

| Metric | Value |
|---|---|
| Clicks (3 months) | 3,705 |
| Impressions | 27,360 |
| Average CTR | ~13.5% |
| Average position | ~6.2 |
| India share of impressions | 26,052 / 27,360 (95%) |
| Mobile share of impressions | 18,285 (67%) — CTR 15.85% vs 8.67% desktop |

## Findings & fixes

### 1. Our home page was competing against itself on Google — FIXED

*In plain terms:* the same page could be opened at several slightly different web addresses (for example, with or without a "/" at the end). Google treated each address as a separate page — so instead of one strong page, we had several weaker copies splitting the visitors between them.

Technically: the server returns `index.html` (HTTP 200) for every path, so trailing-slash variants are all live and all indexable. Google indexed the home page as three competing URLs:

| URL | Clicks | Position |
|---|---|---|
| `/public/home` | 1,086 | 2.96 |
| `/` | 684 | 3.02 |
| `/public/home/` | 284 | 4.98 |

Dozens of course pages showed the same split (e.g. `care-of-sick-newborn/` at position 3.79 vs `care-of-sick-newborn` at 8.2). Each variant self-canonicalised, so ranking signals were divided instead of pooled.

**Fix:** `SeoService` now normalises every canonical and `og:url` to the no-trailing-slash form (matching the sitemap), so the variants consolidate into one. Shipped with tests — `src/app/services/seo.service.ts`.

### 2. Nearly 4 in 10 course links were unreadable web addresses — FIXED

*In plain terms:* for courses with Hindi titles, the web address came out as a meaningless string of numbers instead of readable words. That looks untrustworthy to a person deciding whether to click, and it tells Google nothing about what the page is about.

Technically: the sitemap slug generator stripped every non-Latin character, so Hindi/Devanagari course titles collapsed to an empty string and fell back to repeating the content ID (**189 of 498 course URLs — 38%**):

```
/public/toc/overview/do_114567217130979328167/do_114567217130979328167
```

**38% of all course URLs** looked like this — unreadable to users and keyword-free for search engines. Predictably, readable URLs earned the impressions (`hypertension-in-pregnancy` had 982 impressions; the `do_id/do_id` pages averaged ~1 each).

**Fix:** `slugify()` in `generate-sitemap.js` is now Unicode-aware (`\p{L}\p{N}\p{M}`), so Hindi titles produce readable, indexable slugs (`सक्रिय-प्रबंधन`). A shared `coursePath()` keeps the sitemap and prerender routes in sync and can never re-emit the `id/id` pattern. Shipped with 8 unit tests.

> **Why this is the key Hindi-SEO win:** Hindi courses are ordinary public pages under `/public/…` — each course is authored in one language and has its own address; the site does *not* serve a separate `/hi/` web address per course. (The `/hi/` prefix only switches the interface language for the whole app, based on the signed-in user's preference, and those pages aren't in the sitemap.) So the way to make Hindi courses discoverable is exactly this fix: give them readable Hindi web addresses instead of a string of numbers — for every Hindi course at once.

### 3. The sitemap was sending Google to blank course pages — FIXED

*In plain terms:* the sitemap (the list of pages we hand to Google) included courses that the course page can't actually display, so Google was crawling **empty pages**. Empty pages don't rank, and a large number of them drags down how Google judges the whole site — which matches the Search Console data, where hundreds of course URLs had roughly one impression each.

Technically: the sitemap was built from one search API (Sunbird content search), but the course page loads its data from a different one (`getCourses`). **97 of 504 Live courses (~19%)** are returned by the first but not the second, so their pages render with no content (e.g. `do_1140…`, *मातृ और बाल मृत्यु समीक्षा में सहयोग*).

**Fix:** `generate-sitemap.js` now validates every discovered course against the *exact* endpoint the page reads from (`getCourses`, batched by identifier), and includes only the **407** courses that actually return content. Blank courses are dropped automatically on every build. Shipped with tests.

> **Follow-up (separate from the sitemap):** investigate *why* those 97 Live courses aren't served by the public course API — they may be organisation-restricted or missing from the public index. Fixing that at the source would bring them back as real, indexable pages.

## Opportunities — recommended next

The three issues above were problems we *fixed*. The four items below are **opportunities** — things that already work, but where a small, targeted effort should bring in noticeably more visitors from Google. They are ordered by how much traffic is realistically within reach.

### A. Searches where we're *almost* winning

For these searches, our site already appears near the bottom of Google's first page (or the top of page two). Thousands of people see us — but almost none click, because we sit just below the results that get all the attention. It's like being on the bottom shelf of a shop: shoppers have to look down to notice you. Nudging these up just a few spots would capture visitors we're currently missing by a hair.

| Query | Impressions | Position | CTR |
|---|---|---|---|
| `tnnmc` | 4,869 | 10.0 | 0.18% |
| `indian nursing council` | 4,588 | 7.0 | 0.11% |
| `maharashtra nursing council` | 887 | 7.0 | 0.11% |

These are all searches for nursing councils and partner organisations we *already* have pages for — so the content exists; it just needs to rank a little higher. We would help Google promote these pages by making their on-page wording clearer and adding small extras (like the "breadcrumb" trail links you see under some Google results) that make a listing look more complete and trustworthy.

### B. Our most-seen page could earn far more clicks

The Indian Nursing Council page is shown in Google more than any other page on the site — **15,909 times** in three months — but only about **8 in every 100 people** who see it click through. Because *so many* people see it, even a small improvement here brings a big jump in visitors. The fix is simply to rewrite the headline and one-line summary Google displays for this page so they're more inviting, and add the visual extras that make a result stand out.

### C. One course page is being overlooked

The "Normal Labour & AMTSL" course page is shown often and sits in a good spot on Google, yet **fewer than 1 in 100 people click it**. That gap usually means the headline and description Google shows don't quite match what people are searching for. Rewriting them to speak to what learners actually want should win far more clicks from the same visibility.

### D. Make sure everything works great on phones first

**Two out of every three people** find us on a mobile phone, and phone users click our results almost twice as often as computer users. So any future improvement should be checked on mobile first — especially how *fast* pages load, because slow pages lose visitors and Google ranks them lower. This is worth a dedicated review of the site's loading speed on phones.

## Changes in this release

| File | Change | Tests |
|---|---|---|
| `src/app/services/seo.service.ts` | Trailing-slash + query-string canonical URL normalisation | 4 new |
| `generate-sitemap.js` | Unicode-aware slugify (byte-capped for filesystem safety) + shared `coursePath()` + render-validation against `getCourses` | 12 new |

All 27 tests pass. The regenerated sitemap drops from ~498 course URLs to **407 that actually render**. Low deploy risk: changes are limited to generated metadata and the build-time sitemap script; no runtime app behaviour changes for users.
