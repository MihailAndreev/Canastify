# Copilot Instructions for Canastify

## Project Overview
Bulgarian Canasta web game - multi-page vanilla JavaScript app with planned Supabase backend.

## Critical Architecture Rules

### Multi-Page, Not SPA
- Each screen = separate HTML file (no SPA router)
- Navigation via `<a>` links or `window.location`
- Vite builds multiple entry points (see [vite.config.js](../vite.config.js))

### Page-Per-Folder Structure (PLANNED, not yet implemented)
The architecture document defines this target structure, but **current code hasn't migrated yet**:
```
src/pages/<page>/
  ├─ <page>.html
  ├─ <page>.css
  └─ <page>.js
```
Current reality: flat structure with `pages/` and `scripts/` at root level.

### Technology Constraints
- ❌ **NO TypeScript** - vanilla JavaScript only
- ❌ **NO frameworks** - no React, Vue, or Angular
- ✅ ES Modules (`type="module"`)
- ✅ Bootstrap for CSS/layout
- ✅ Vite for dev server + build

## Key Files & Patterns

### Entry Points
- [index.html](../index.html) - Home/main menu
- [pages/game.html](../pages/game.html) - Game table interface
- [pages/rules.html](../pages/rules.html) - Rules display

### Configuration
- [vite.config.js](../vite.config.js) - Multi-page build config using `rollupOptions.input`
- [package.json](../package.json) - Scripts: `npm run dev`, `npm run build`, `npm run preview`

### Documentation (Bulgarian Language)
- [docs/architecture_20260129.md](../docs/architecture_20260129.md) - **Source of truth** for architecture
- [docs/GAME_RULES_bg.md](../docs/GAME_RULES_bg.md) - Complete Bulgarian Canasta rules (301 lines)
- [docs/FAQ_bg.md](../docs/FAQ_bg.md) - Gameplay FAQ in Bulgarian

## Development Workflow

### Commands
```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
```

### Git Discipline (from architecture doc)
1. One small change per iteration
2. Implement → manual test → commit
3. Never commit broken code
4. Target: **15+ commits across 3+ days**

## Code Organization Principles

### Layered Architecture (Target State)
```
src/
├─ pages/       # Each page: html + css + js
├─ shared/      # Reusable UI (header/footer/modals/toasts)
├─ domain/      # Bulgarian Canasta rules (pure logic, no DOM)
├─ services/    # Supabase integration (no DOM)
└─ styles/      # Global theme + Bootstrap customization
```

### Layer Rules
- **Domain layer**: Pure functions, no DOM, no Supabase
- **Services layer**: No DOM work, returns plain data
- **Shared/UI**: May touch DOM, but no game rules
- **Pages**: Coordinate between layers

### Demo Mode Pattern
- Home → "Play Demo" → Lobby with room code `DEMO`
- Auto-fills 4 demo players + ready state
- Enables quick testing without setup

## Game-Specific Context

### Bulgarian Canasta Core Concepts
- 4 players, 2 teams (partners sit opposite)
- 110 cards (2 standard decks + 6 jokers)
- **Canasta** = 7-card combination (critical for positive scoring)
- Red 3s (♦3, ♥3) = bonus cards
- Black 3s (♣3, ♠3) = blocking cards
- **Strategic closing**: Can close "on minus" to penalize opponents without canasta

### Rule of Thumb
If unsure about game rules, reference [docs/GAME_RULES_bg.md](../docs/GAME_RULES_bg.md) or [docs/FAQ_bg.md](../docs/FAQ_bg.md).

## Future Integration Points

### Supabase (not yet implemented)
- **Auth**: register/login/logout
- **Database**: min. 4 tables for game data
- **Storage**: avatars, images, exports
- **Realtime**: Lobby presence (optional)

### Lobby System (planned)
- Room code generation (e.g., `A7K9`)
- 4-player room requirement
- Ready state tracking
- Demo room: code `DEMO`

## When Writing Prompts

Every implementation prompt should include:
1. What we're adding/fixing
2. Which files we'll touch
3. Manual test steps + expected result
4. Reminder: multi-page, no TS/frameworks, modular imports

## Architecture Update Protocol

When changing architecture rules, update **both**:
1. [docs/architecture_20260129.md](../docs/architecture_20260129.md)
2. This file (`.github/copilot-instructions.md`)

**Priority**: If code and docs differ, actual code behavior has priority, but docs must be updated.
