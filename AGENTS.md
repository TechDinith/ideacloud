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

## Next Steps
1. **Pre-rendering** — Deploy to Vercel, check Google indexing. If content not indexed, add `@prerender/prerender` middleware via `vercel.json` so Googlebot gets static HTML snapshots.
2. **Push to GitHub** — version control + Vercel auto-deploy
3. **Polish** — Loading states, empty states, error boundaries, accessibility audit
4. **Phase 2** — Sponsor accounts, in-app chat, monetization, rich text editor
