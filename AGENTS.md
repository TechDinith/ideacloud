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
| `/dashboard` | Logged-in generators | See/manage own posted ideas |
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

## Build & Verify

```powershell
cmd /c "npm run build"
```

## Next Steps
1. Push to GitHub → Deploy to Vercel
