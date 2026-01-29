# Canastify - Project Architecture

_Last updated: 2026-01-29_

## 1. Purpose of This Document

This document defines the **architecture rules** for Canastify:
- **multi-page** (each screen is a separate HTML file; no SPA router as the main model)
- **page-per-folder** structure (each page has its own `html + css + js`)
- **modular code** (shared pieces live in shared modules and are imported)
- **UI / domain / services separation**
- **prompt-driven development** (small steps → manual test → commit)

If code and documentation differ, the **actual code behavior has priority**, but this document must then be updated.

---

## 2. Project Overview

**Canastify** is a web-based application for playing *Bulgarian Canasta*.

High-level goals:
- playable game UI (client-side)
- user accounts (Auth) and roles (admin / normal user)
- persistent data using Supabase (DB + Auth + Storage)
- **Lobby** that groups players into a room (via **room codes**) before starting a game
- **Demo mode** that starts from Home → **Lobby** (auto-filled demo room) → Game
- clean, understandable, modular code

Rule source of truth:
- `docs/RULES_CANASTA_BG.md`
- `docs/FAQ.md`

---

## 3. Technology Stack

### 3.1 Frontend
- HTML5 (**multi-page**)
- CSS3
- JavaScript (ES Modules)
- **Bootstrap** (CSS/UI components + layout)

Constraints:
- **No TypeScript**
- **No UI frameworks** (React / Vue / Angular)

### 3.2 Backend-as-a-Service (later phases)
- Supabase:
  - Auth (register / login / logout)
  - PostgreSQL DB (min. 4 tables)
  - Storage (upload / download: avatars, images, exports)
  - Realtime / Presence (useful for Lobby, if/when needed)

### 3.3 Tooling
- Vite (dev server + build)
- Git + GitHub
- GitHub Copilot (AI-assisted coding)

---

## 4. Architectural Style

We use a **layered, modular, multi-page architecture**, with a strict rule:

> **Each page lives in its own folder with its own HTML + CSS + JS.**

Shared/reusable pieces live in shared modules (imported where needed).

### Key principles
- **Multi-page first** (no SPA router for screens)
- **Small, focused modules** (avoid monolith files)
- **UI separated from logic**
- **Services separated from UI and domain**
- **Domain logic is pure** where possible (no DOM, no Supabase)

---

## 5. Navigation Model

- Each screen is a separate HTML entry file.
- Navigation uses normal links (`<a href="...">`) and/or explicit `window.location`.
- Components (modals/toasts) are UI helpers inside pages, not “screens”.

---

## 6. Folder Structure

### 6.1 Root

```
Canastify/
├─ .github/
│  └─ copilot-instructions.md
│
├─ docs/
│  ├─ ARCHITECTURE.md
│  ├─ RULES_CANASTA_BG.md
│  └─ FAQ.md
│
├─ src/
│  ├─ pages/                 # each page in its own folder (html+css+js)
│  ├─ shared/                # reusable UI + helpers used by multiple pages
│  ├─ domain/                # Bulgarian Canasta rules + game state (pure logic)
│  ├─ services/              # Supabase + integrations (no DOM)
│  ├─ assets/                # images, icons, card assets
│  └─ styles/                # global styles (theme pack, base)
│
├─ supabase/
│  └─ migrations/
│
├─ index.html
├─ package.json
└─ vite.config.js
```

### 6.2 Pages (required structure)

Each page must be a folder with these three files:

```
src/pages/<page>/
  ├─ <page>.html
  ├─ <page>.css
  └─ <page>.js
```

Examples:
- `src/pages/home/home.html | home.css | home.js`
- `src/pages/lobby/lobby.html | lobby.css | lobby.js`
- `src/pages/game/game.html | game.css | game.js`
- `src/pages/account/account.html | account.css | account.js`

---

## 7. Shared Layer (Reusable UI + Helpers)

Location:
- `src/shared/`

Purpose:
- reusable UI (header/footer/toasts/modals)
- auth/session helpers (localStorage now, Supabase later)
- lobby helpers (room codes + room state store)
- demo helpers (demo scenario setup)

Suggested structure:

```
src/shared/
  ├─ ui/
  │  ├─ header.js
  │  ├─ footer.js
  │  ├─ modal.js
  │  ├─ toast.js
  │  └─ ui-kit.css
  ├─ utils/
  │  ├─ dom.js
  │  ├─ storage.js
  │  └─ validation.js
  ├─ auth/
  │  ├─ session.js
  │  ├─ require-auth.js
  │  └─ require-admin.js
  ├─ lobby/
  │  ├─ room-code.js
  │  └─ lobby-store.js
  └─ demo/
     ├─ demo-mode.js
     └─ demo-scenarios.js
```

Rules:
- Shared UI modules may touch DOM.
- Shared modules must not contain Bulgarian Canasta rules.

---

## 8. Theme Pack (Global Look & Feel)

Goal: a unified “game-like” UI similar to the reference screens:
- big buttons, panels, readable typography, consistent spacing
- background + panel styles
- common button variants (primary/secondary/green etc.)

Implementation:
- `src/styles/theme.css` (CSS variables + base theme)
- `src/shared/ui/ui-kit.css` (panels/buttons helpers that complement Bootstrap)
- Each page includes Bootstrap + `theme.css` (+ optional `ui-kit.css`)

---

## 9. Domain Layer (Game Logic)

Location:
- `src/domain/`

Purpose:
- Bulgarian Canasta rules, scoring, validations, and game-state transitions.

Typical files:
- `constants.js`
- `cards.js`
- `scoring.js`
- `rules-engine.js`
- `game-state.js`

Rules:
- **No DOM access**
- **No Supabase access**
- Prefer pure functions and predictable outputs

---

## 10. Services Layer (Supabase / Integrations)

Location:
- `src/services/`

Purpose:
- Supabase Auth / DB / Storage
- later: Realtime presence/events for Lobby

Rules:
- **No DOM work**
- Return plain data + structured errors

---

## 11. Screens / Pages (Planned)

### Home / Main Menu (`/home`)
Buttons:
- **Play Canasta** (goes to Lobby)
- **Play Demo** (goes to Lobby in demo mode)
- **Account**
- **Instructions**
- **FAQ**

### Lobby (`/lobby`)
Room-based gateway before starting a game:
- **Create Room** → generates **room code** (e.g. `A7K9`)
- **Join Room** → enter room code
- shows players list + ready state
- **Start Game** enabled when room has 4 players (and optionally all ready)

**Demo mode rule (confirmed):**
- Home → **Play Demo** → opens **Lobby** with room code `DEMO`
- Lobby auto-fills 4 demo players + ready
- Start Game leads to Game with a demo scenario

### Game Table (`/game`)
- main gameplay UI (table, hands, meld slots, discard/deck, actions)

### Account (`/account`)
- user profile + avatar
- statistics (placeholders first; real stats later)

### Admin (`/admin`)
- role-protected admin panel (users, content, games)

---

## 12. Workflow Rules (Prompts + Git)

We develop feature-by-feature:
1) one small change
2) implement
3) manual test
4) commit

Every prompt must include:
1) what we add/fix
2) which files we touch
3) manual test steps + expected result
4) constraints: multi-page, page-per-folder, modular imports, no TS/frameworks

Git discipline:
- never commit broken code
- commit after each stable step
- target: **15+ commits** across **3+ days**

---

## 13. Copilot Constitution

`.github/copilot-instructions.md` is the project “constitution”.
When we change architecture rules, we update both:
- `docs/ARCHITECTURE.md`
- `.github/copilot-instructions.md`
