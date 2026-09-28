# Coding Preferences

- **Style**: Short, clean, efficient, modular
- **Components**: Reusable, prefer existing components over new ones
- **Readability**: Code should be human-friendly — easy to understand and debug
- **Packages**: Use stable, compatible versions (not necessarily the latest)
- **Workflow**: Always report findings and plan first → get permission → then write code

# IdeaCloud — Full Project Brief

## What Is IdeaCloud?
A web app bridging **Idea Generators** (ideas, no funding) and **Sponsors** (money, no ideas). Generators post colorful idea cards; sponsors scroll an endless feed and contact via email.

## Project Phases
- **Phase 1 (current):** Sponsors browse freely (no signup), generators sign up free via Google, contact via email.
- **Phase 2 (future):** Sponsor accounts, in-app chat, monetization, rich text editor.

## User Types (Phase 1)
- **Generator:** Signs up free via Google, posts ideas, has public profile.
- **Sponsor:** Browses freely, no account, contacts generator via email.

## The Idea Card
Title, brief, category tag, creator name, date posted, random background color.

## Pages
| Page | Who Sees It | What It Does |
|------|-------------|--------------|
| `/` (Home) | Everyone | Infinite scroll feed of all idea cards |
| `/your-ideas` | Logged-in generators | See/manage own posted ideas |
| `/profile/:uid` | Everyone | Public profile — ideas + email contact |
| `/settings` | Logged-in generators | Edit display name & bio |

## Tech Stack
React + Vite, Tailwind CSS v4, shadcn/ui, Firebase Auth (Google), Firestore, Vercel hosting. No images (Storage is paid — initials-only avatars removed in favor of decorative pills).

## Firestore Data Model
- `users/{uid}`: name, email, bio, createdAt
- `ideas/{ideaId}`: title, brief, category, cardColor (random HSL), creatorId, creatorName, createdAt

## Session Rules
- **Ask permission** before any edit or file creation, explaining what it's for
- **Research first** — before building a component, check if a well-maintained package already exists instead of building from scratch
- **ALWAYS read `AGENTS.md` Session Memory section first** before starting any work

---

# Session Memory — Read Before Every Edit

This section is updated each session so the next picks up seamlessly.

## Theme System (5 Themes)

- **Indigo** (default), **Amber**, **Emerald**, **Rose**, **Sky**
- All theme colors use CSS custom properties via `[data-theme="..."]` selectors in `src/index.css`
- `:root` has the default Indigo values as fallback
- Theme variables available:
  - `--theme-from`, `--theme-via`, `--theme-to` — gradient text colors
  - `--theme-overlay` — hero section background gradient
  - `--theme-glow-1/2/3` — ambient glow blobs
  - `--theme-ring` — focus rings, spinners, borders
  - `--theme-text` — icon/accent text
  - `--theme-accent-from/to` + `-hover` — gradient button backgrounds
  - `--theme-spinner` — loading spinner color
- **Use `var(--theme-*)` in Tailwind arbitrary values**: `from-[var(--theme-from)]`, `text-[var(--theme-text)]`, `border-[var(--theme-spinner)]`
- For complex backgrounds (gradient overlays, glow blobs), use inline `style={{ background: "var(--theme-*)" }}`
- Add new themes by extending `src/lib/themes.js` + `src/index.css` `[data-theme="..."]` blocks
- **Never hardcode `indigo`, `purple`, `pink`, `amber`, `yellow`, `orange`** etc. in color-related className strings — always use CSS variable references

## Theme UI

- `src/lib/ThemeContext.jsx` — React context, reads/writes `localStorage("ideacloud-theme")`, sets `data-theme` on `<html>`
- `src/components/ThemeDrawer.jsx` — right slide-out panel with 5 swatch buttons
- Theme toggle button (paint palette icon) in Navbar, visible to all users regardless of auth
- `src/lib/themes.js` — theme metadata array (id, label, swatch colors)

## Avatars Replaced with Decorative Pills

- **No avatar images or initials circles anywhere**
- Creator names display as `rounded-full border` pills:
  - IdeaCard: `border border-white/15 px-2.5 py-0.5`
  - Navbar: `border border-gray-700 px-3 py-1`
  - Profile page: large gradient heading (no pill border)
- When user updates display name in `/settings`, all their existing ideas get `creatorName` updated via Firestore batch write (`src/firebase/users.js`)

## Loading Screen

- Shows animated gradient "IdeaCloud" logo with `pulse-logo` keyframe + theme-colored spinner
- Defined in `src/App.jsx`, inside `<ThemeProvider>` so theme variables are available

## Layout

- All page containers use `px-5 sm:px-6` (not `px-4`)
- Grid gaps use `gap-5` (not `gap-4`)
- Hero sections have `overflow-hidden` **removed** so glow blobs bleed into content area for smooth color transition
- Gradient separator lines (`h-px via-indigo-500/20`) removed — glow overflow handles transitions
- All pages (Home, Dashboard, Settings, Profile) use the same hero pattern with theme overlay + 3 glow blobs

## Masonry Tile Layout

- IdeaFeed uses CSS columns (`columns-1 sm:columns-2 lg:columns-3 gap-5`) instead of grid for a Pinterest-style masonry layout
- IdeaCard gets a `cardSize` prop — strictly based on description length (no index-based overrides):
  - `xs`: < 40 chars, `line-clamp-1`, small text
  - `compact`: 40–80, `line-clamp-2`
  - `default`: 80–160, `line-clamp-3`
  - `expanded`: 160–250, `max-h-28 overflow-y-auto`
  - `xl`: > 250, `max-h-32 overflow-y-auto`, larger text
- Each tile wrapped in `break-inside-avoid-column` to prevent column splitting
- Skeleton loading also has varied heights matching tile layout

## Routes

| Page | File | Route |
|------|------|-------|
| Home | `src/pages/Home.jsx` | `/` |
| Your Ideas | `src/pages/YourIdeas.jsx` | `/your-ideas` |
| Profile | `src/pages/Profile.jsx` | `/profile/:uid` |
| Settings | `src/pages/Settings.jsx` | `/settings` |
| Catch-all | — | `path="*"` → `Navigate to="/"` |

- Sign Out in Navbar calls `await logOut()` then `navigate("/")`

## Shadcn Components Used

| Manual Component | Replaced With | File |
|---|---|---|
| ThemeDrawer (slide-out) | `<Sheet>` `SheetContent` | `src/components/ThemeDrawer.jsx` |
| IdeaCard (div layout) | `<Card>` `CardHeader` `CardContent` `CardFooter` `CardTitle` | `src/components/IdeaCard.jsx` |
| IdeaForm raw inputs | `<Input>` `<Textarea>` `<NativeSelect>` `<Label>` | `src/components/IdeaForm.jsx` |
| Feed loading shimmer | `<Skeleton>` | `src/components/IdeaFeed.jsx` |
| Feed spinner | `<Spinner>` | `src/components/IdeaFeed.jsx` |
| Feed empty state | `<Empty>` `EmptyHeader` `EmptyTitle` `EmptyDescription` | `src/components/IdeaFeed.jsx` |

Installed via `npx shadcn add` — all in `src/components/ui/`. Uses shadcn v4 + radix-ui primitives. Navbar passes `onClose={}` to ThemeDrawer which maps to Sheet's `onOpenChange`.

## Home Page Features

- **Tagline shuffle** — 5 taglines rotate every 4s with fade animation
- **Live counter** — shows `{n} ideas` (or `{n} ideas in {category}`) above the feed
- **Search bar** — client-side search on title + brief, shows `(filtered)` count
- **Category filter** — pill-shaped buttons, client-side filter, resets infinite scroll
- **"Surprise Me" button** — fixed bottom-right, scrolls to a random card using `data-card-index` attributes
- Search + category combine: category is filtered, search is client-filtered on results

## Surprise Me Button

- Lives in `src/App.jsx` as a direct child of `<BrowserRouter>` (sibling to Routes/Navbar) to avoid any `overflow`/`transform`/`filter` ancestors interfering with `position: fixed`
- `surpriseTrigger` state in App, passed to Home → IdeaFeed
- On mobile, the button still causes horizontal scroll issue (UNRESOLVED). Possible causes:
  - Navbar's `backdrop-blur-md` (backdrop-filter) on Safari/iOS can break `position: fixed` in some WebKit versions
  - Glow blob `size-[40rem]` overflow may interact with scroll container on narrow viewports
  - `overflow-x-auto` on category pills container may interact with page-level overflow
- Tried `overflow-x-hidden` on page container but it clips the intentional glow blob bleed-through
- Tried moving button outside page container to Fragment root — didn't resolve
- Current: button at App level, glow blobs unclipped, issue persists

## Build & Verify

```powershell
cmd /c "npm run build"
```

## Completed — Cross-Platform Compatibility Fixes (Jun 3)

### Horizontal Scroll Bug
- Added `overflow-x: clip` to `<html>` in `index.css` — prevents horizontal scroll without breaking `position: fixed`
- Added `max-w-[100vw]` to all glow blobs across Home, YourIdeas, Profile, Settings — caps blob width at viewport

### Hooks Violations (Critical)
- **YourIdeas.jsx**, **Settings.jsx**: Replaced early return `if (!user) return <Navigate>` pattern with `useEffect` navigation. All hooks now run consistently on every render, eliminating React rules-of-hooks violations.

### State Updates After Unmount
- Added `cancelledRef` pattern to **IdeaFeed.jsx**, **YourIdeas.jsx**, **Profile.jsx**, **Settings.jsx** — all async `.then()` callbacks check `cancelledRef.current` before calling setState.
- `useEffect` cleanup sets `cancelledRef.current = true`.

### Touch/Mobile Fixes
- **YourIdeas.jsx**: Delete button now visible on touch via `group-focus-within/card:opacity-100`
- **App.jsx, IdeaFeed.jsx**: Replaced `onMouseEnter`/`onMouseLeave` inline handlers with CSS `.surprise-btn:hover` and `.add-idea-btn:hover` classes
- **index.css**: Added `touch-action: manipulation` on all interactive elements to eliminate 300ms tap delay

### Accessibility
- **Home.jsx**: Search input now has `aria-label="Search ideas"`; category filter buttons have `aria-pressed`
- **Settings.jsx**: Added `htmlFor`/`id` pairs linking labels to inputs; added loading spinner while profile data loads
- **All pages**: Replaced root `<div>` with `<main>` landmark
- **All SVGs**: Added `aria-hidden="true"` to decorative icons
- **Buttons**: Added `type="button"` where missing; added `aria-label` to Surprise Me, delete, and theme toggle buttons

### Stale Closures
- **IdeaFeed.jsx**: `loadMore` now uses `loadingMoreRef` and `hasMoreRef` instead of closure-captured state for guard flags

### Browser Compatibility
- **index.css**: `scrollbar-none` now also targets Firefox (`scrollbar-width: none`) and IE (`-ms-overflow-style: none`)
- **ThemeContext.jsx**: `localStorage` wrapped in try/catch (Safari private mode)
- **firebase/auth.js**: `signInWithPopup` falls back to `signInWithRedirect` on mobile; added `getRedirectResult` handler at module scope
- **IdeaFeed.jsx**: Added `IntersectionObserver` support check with fallback

### Infinite Scroll
- Sentinel `<div>` now only renders when `hasMore` is true

## Completed — SEO & Polish (Jun 3)

### Select Dropdown
- Replaced NativeSelect with Radix UI Select (shadcn v4) — `src/components/ui/select.jsx`
- Radix Select causes layout shift (`react-remove-scroll` lock) → fixed with CSS override in `index.css`:
  ```css
  html body[data-scroll-locked] {
    overflow: visible !important;
    margin-right: 0 !important;
    --removed-body-scroll-bar-size: 0 !important;
  }
  ```
- `--radix-select-trigger-width` CSS variable NOT set by radix-ui v1.4.3 (meta-package) → removed all CSS variable references from Select component
- Dropdown uses Portal + popper positioning

### Idea Cards Not Loading (YourIdeas / Profile)
- `fetchUserIdeas` used `where("creatorId")` + `orderBy("createdAt")` → requires composite Firestore index (missing)
- Fix: removed `orderBy` from query, sort client-side in `src/firebase/ideas.js`
- Added try/catch to `YourIdeas.jsx` and `Profile.jsx` so errors don't hang loading spinner

### SEO
- Installed `react-helmet-async` — wrapped app in `<HelmetProvider>` in `App.jsx`
- Created `src/components/SEO.jsx` — reusable component with title, description, OG tags, canonical URL
- Added SEO to all pages: Home, Your Ideas, Settings, Profile (dynamic name/bio)
- Created `public/robots.txt` — allows all crawlers, references sitemap
- Created `public/sitemap.xml` — lists home page URL

## Completed — Google Indexing Fix (Sep 28)

### CRITICAL: Wrong Canonical Domain (was silently deindexing the site)
- `ideacloud.vercel.app` is a **completely different app** (a `zh-CN` Chinese-language site), NOT this project. This project lives on **`ideacloud-itrans.vercel.app`**.
- `robots.txt`, `sitemap.xml`, and `SEO.jsx` all pointed at `ideacloud.vercel.app` → the canonical tag told Google the content belonged to a different site, which blocks indexing entirely. All three now use `ideacloud-itrans.vercel.app`.
- **Any future domain change must update:** `scripts/prerender.mjs` `SITE_ORIGIN`, `src/components/SEO.jsx` `BASE_URL`, `public/robots.txt`, `public/sitemap.xml`.

### Build-Time Prerendering (replaces the `@prerender/prerender` idea)
- `scripts/prerender.mjs` runs after `vite build` (`npm run build`), reads Firestore via the **REST API** (not the SDK — works in plain Node), and writes real HTML + JSON-LD into `dist/`:
  - `dist/index.html` — home, latest ideas, category counts, `WebSite`/`Organization`/`ItemList` JSON-LD
  - `dist/profile/<uid>/index.html` — one per user, `ProfilePage` JSON-LD, `og:type=profile`
  - `dist/sitemap.xml` — every prerendered URL with `<lastmod>` from the newest idea
  - `dist/robots.txt` — sitemap line forced to the canonical origin
- Reads `VITE_FIREBASE_*` from `.env` via its own loader (`loadEnv()`), resolved relative to the repo root, not cwd.
- **Never fails the build.** Missing env, Firestore unreachable, or an empty collection all degrade to a shell page with a warning.
- Content is injected into `<div id="prerender-root" hidden aria-hidden="true">` after `#root` — hidden so users never see a flash, but crawlers read it. React still mounts normally into `#root`.
- HTML is escaped (`esc()`) — user titles containing `< > & "` cannot break out into markup.
- Generated description for home appends real categories: `"...fund them. Browse ideas in Education and Finance."` Excludes the `Other` bucket.

### Pristine Shell Cache (idempotency)
- Re-running the prerender must not inherit its own previous output, or titles/JSON-LD/`<title>` tags stack up.
- Solution: `prerenderShell()` plugin in `vite.config.js` snapshots Vite's finished `index.html` to `node_modules/.cache/prerender-shell.html` on every build. The prerender always renders from that snapshot.
- Cache lives **outside `dist/`** so it is never deployed, and Vite rewrites it every build so it cannot go stale.
- Output is normalised to **LF** (`normalizeEol`). Without this, Windows CRLF vs Linux LF made runs non-reproducible.
- Override for tests: `PRERENDER_DIST` and `PRERENDER_SHELL_CACHE` env vars.
- `vite.config.js` now uses `fileURLToPath(import.meta.url)` instead of `__dirname` — fixes a pre-existing `no-undef` lint error under ESM.

### Static SEO Fallback in index.html
- `index.html` now ships a complete `<head>`: title, description, canonical, OG (type/site_name/title/description/url/image/width/height/alt), Twitter card, theme-color.
- This is the baseline; `SEO.jsx` overrides it client-side per route. Without it, non-JS crawlers saw zero metadata.

### Indexing Hygiene
- `/your-ideas` and `/settings` now pass `robots="noindex, nofollow"` to `<SEO>` — auth-gated thin pages must not enter the index.
- Public pages verified to carry **no** `noindex` (regression-tested).
- JSON-LD: `WebSite` + `SearchAction` on Home, `ProfilePage` on profiles, `ItemList` of `CreativeWork` (name/description/genre/datePublished/author) on Home.
- `vercel.json` gained long-lived `Cache-Control` for hashed `/assets/`, 1 week for icons/og-image, 1 hour for `robots.txt`/`sitemap.xml`. Kept the COOP header for the Google OAuth popup.

### Images
- `scripts/generate-assets.py` (Pillow) generates all static images — cloud built as a union of antialiased circles + rounded base, Indigo gradient matching `src/index.css`:
  - `og-image.png` 1200×630, `apple-touch-icon.png` 180, `favicon-32x32.png`, `icon-192.png`, `icon-512.png`
- `public/site.webmanifest` links the icons. Run `npm run assets` after changing brand colours.
- Regenerating images is deterministic — no randomness in the cloud geometry.

### Verification
- `npm run test:prerender` — **57 assertions** covering metadata, canonical/og correctness, HTML escaping of `< > & "`, per-user idea isolation, pluralisation, sitemap `<lastmod>`, robots dedup, no stale origin anywhere, LF-only output, byte-identical re-runs, and graceful degradation when the collection is empty.
- Fixtures in `scripts/_fixture-fetch.mjs` stub Firestore via `--import`, so tests never touch the live database. Windows needs `pathToFileURL(...).href` for `--import` paths.
- `npm run lint` — 16 pre-existing errors (unused `React` imports in shadcn `ui/*`, `react-refresh` in `ui/*` + `ThemeContext`, unused `Button` + `set-state-in-effect` in `YourIdeas.jsx`, one `exhaustive-deps` warning in `IdeaFeed.jsx`). **All pre-date this work; none are in the SEO code.** Left alone deliberately.

### Known Data Issue (not code)
- The Firestore `ideas` collection is **empty** — 2 users exist, 0 ideas. The home feed renders "No ideas yet". Prerendering works correctly but has no idea content to show until ideas are posted. This is the main reason there is nothing to rank for yet.

## Next Steps
1. **Deploy** — `git push` (origin is `github.com/TechDinith/ideacloud`, branch `main`) and let Vercel auto-deploy. Verify `npm run build` passes in the Vercel log, including the `[prerender]` lines.
2. **Post ideas** — the `ideas` collection is empty; there is nothing for Google to index until real content exists.
3. **Search Console** — add `https://ideacloud-itrans.vercel.app/` as a URL-prefix property, verify via DNS TXT, submit `sitemap.xml`, then URL Inspection → "Request indexing" for `/` and each `/profile/<uid>`.
4. **Bing Webmaster Tools** — import the GSC property; it also drives Bing + Copilot.
5. **Prerender limit** — currently caps at 24 ideas (`MAX_IDEAS`) and 200 users (`MAX_PROFILES`). Raise once the collection is large, or old ideas will silently fall out of the home page and sitemap.
6. **Reconsider the domain** — a `.vercel.app` subdomain works but a branded domain helps trust and recall. If migrating, update the 4 places listed above and re-submit the sitemap.
7. **Phase 2** — Sponsor accounts, in-app chat, monetization, rich text editor.
