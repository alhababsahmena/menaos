# MENAOS Frontend — Chain Memory

This file is the operating chain log for the 20-prompt frontend build. Each
prompt **must read it first** and **must update it last**. It is not narrative
documentation — it is a checklist + decision log so the next prompt picks up
without re-deriving context.

## Stack (locked in bootstrap)

- React 19.2.6 · TypeScript 6.0.3 (strict + `noUncheckedIndexedAccess`)
- Vite 8.0.15 · Vitest 4.1.7 · Playwright 1.60.0
- React Router 6.30.4 · TanStack Query 5.100.14 · Zustand 5.0.14
- React Hook Form 7.77.0 · Zod 4.4.3 · Axios 1.16.1
- Tailwind 4.3.0 (`@tailwindcss/vite`) · Radix + Headless UI · TanStack Table 8 · Recharts 3
- Brand accent: **indigo `#4F46E5`** (registered as `--color-brand-*`)

## Operating contract (applies to every prompt)

1. **Read this file first.** Then re-read any shared file you intend to touch.
2. **Never break prior work.** Additive changes preferred. Contract changes
   (types, API signatures) must update every caller and be recorded below.
3. **Strict TypeScript.** No `any`, no `!` to silence the compiler. Types come
   from `@types` or feature-local `types/`. Use `unknown` + narrowing at
   trust boundaries.
4. **Best practices, not "good enough".** Feature folders, small components,
   accessibility (keyboard + ARIA + focus management), loading/empty/error on
   every async surface, no business logic in components.
5. **Static now, integration-ready.** All data flows through the mock API
   layer (Prompt 4) behind `VITE_USE_MOCKS` (Prompt 5). Components never
   import `@mocks/*` directly — only through feature hooks/services.
6. **At the end of every prompt:** `npm run typecheck && npm run lint &&
   npm run build`. Fix before stopping. Confirm the prompt's acceptance
   checklist explicitly.

## Design direction (locked)

Refined-utilitarian internal tool. Dense but highly legible, generous-enough
spacing, strong information hierarchy. Light + dark themes. Display font for
headings paired with a clean body font — **not** Inter / Roboto / Arial.
Accessibility is non-negotiable.

## Architecture cheat sheet

`components → hooks → services (feature api/) → apiClient (lib/) → (mock | axios)`

- Outside `features/<x>/` you may only import `@features/<x>` (the barrel).
- `apiClient` is the only sanctioned consumer of `@mocks/*`.
- Env is validated by Zod in `src/config/env.ts` at module load.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full contract.

---

## Prompt log

### Prompt 1 — Project skeleton, folder architecture & conventions ✅

**Status:** complete. Typecheck + lint + build + Vitest all green.

**Files added:**

- `frontend/PROGRESS.md` (this file)
- `frontend/ARCHITECTURE.md`
- `frontend/.env.example`
- `frontend/src/config/env.ts` (Zod-validated `VITE_API_BASE_URL` +
  `VITE_USE_MOCKS`)
- Full `src/` tree:
  - `src/{app,routes,config,lib,stores,hooks,types,mocks}/`
  - `src/components/{ui,layout,data,feedback}/`
  - `src/features/{auth,users,roles,projects,platforms,tasks,availability,
    disputes,dashboards,financials,profile}/{api,components,pages,schemas,
    types}/`
  - `src/styles/.gitkeep`, `src/test/.gitkeep`
- Barrel `index.ts` in every TS folder (80 total)

**Files changed:**

- `frontend/tsconfig.app.json` — added `paths` for all 10 aliases
- `frontend/vite.config.ts` — exports shared `aliases`, wires `resolve.alias`
- `frontend/vitest.config.ts` — imports `aliases` from `vite.config.ts`
- `frontend/eslint.config.js` — added `no-restricted-imports`:
  - bans `@features/*/*` (cross-feature deep imports) everywhere
  - bans `@mocks/*` everywhere **except** `src/lib/**` and `src/mocks/**`
- `frontend/src/main.tsx` — imports `App` via `@app`, side-effect imports
  `@config/env` to run validation at startup; replaces the `!` non-null
  assertion on `getElementById('root')` with an explicit throw
- `frontend/src/App.tsx` → moved to `frontend/src/app/App.tsx`
- `frontend/src/App.test.tsx` → moved to `frontend/src/app/App.test.tsx`

**Key decisions:**

- **Aliases use `@`-prefixed top-level keys, not just `@/...`.** This matches
  the prompt spec and keeps imports short (`@features/auth` vs
  `@/features/auth`).
- **`no-restricted-imports` enforces the cross-feature rule by pattern**
  (`@features/*/*`) rather than introducing `eslint-plugin-boundaries`. Within
  a feature, code uses relative paths; outside, only the barrel.
- **`apiClient` is the only sanctioned consumer of `@mocks/*`.** ESLint
  exempts `src/lib/**` and `src/mocks/**` from the `@mocks` ban so the mock
  layer can wire itself up internally without circular ESLint errors.
- **Env validation runs at module load** (`main.tsx` side-effect imports
  `@config/env`). Misconfiguration fails fast at startup with a clear message
  rather than at first network call.
- **App lives at `src/app/App.tsx`** (not `src/App.tsx`) so the architecture
  is locked from this prompt forward.
- **`src/index.css` stays at `src/` for now**; relocating to `src/styles/`
  belongs to the theme/typography pass (later prompt). Defer.

**Deferred / pending for later prompts:**

- Tailwind theme (light + dark, semantic CSS variables) and the
  display-font + body-font pairing — Prompt 7 region.
- Concrete contents of every barrel — added on demand by later prompts.
- `src/styles/` content (move of `index.css`, font @font-face, theme tokens)
  — Prompt 7 region.
- `src/test/` content (render helper, mock providers) — Prompt 4–5 region.
- Permission keys / nav config / route constants under `src/config/` —
  Prompts 5, 10, 11.

**Verification (Prompt 1 acceptance checklist):**

- [x] Tree exists (80 barrel files; 11 features × {api, components, pages,
      schemas, types} + each feature root)
- [x] Aliases resolve in a real import (`main.tsx` uses `@app` + `@config`)
- [x] `npm run typecheck` — clean
- [x] `npm run lint` — clean
- [x] `npm run build` — clean
- [x] `npm run test` — 1/1 passing (App smoke)
- [x] `PROGRESS.md` written
- [x] `ARCHITECTURE.md` written

### Prompt 2 — _pending_

### Prompt 3 — _pending_

### Prompt 4 — _pending_

### Prompt 5 — _pending_

### Prompt 6 — _pending_

### Prompt 7 — _pending_

### Prompt 8 — _pending_

### Prompt 9 — _pending_

### Prompt 10 — _pending_

### Prompt 11 — _pending_

### Prompt 12 — _pending_

### Prompt 13 — _pending_

### Prompt 14 — _pending_

### Prompt 15 — _pending_

### Prompt 16 — _pending_

### Prompt 17 — _pending_

### Prompt 18 — _pending_

### Prompt 19 — _pending_

### Prompt 20 — _pending_
