# 🃏 Canastify

Web-based application for playing Bulgarian Canasta - a strategic card game for 4 players in 2 teams.

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Development](#development)

## 🎯 About

**Canastify** is a digital implementation of Bulgarian Canasta, featuring:
- Multi-page web application architecture
- Clean, modular JavaScript code
- User authentication and persistent data (planned)
- Lobby system with room codes
- Demo mode for quick gameplay

## ✨ Features

### Current
- 🎮 Playable game interface
- 🎨 Clean UI with Bootstrap styling
- 📱 Multi-page navigation (Home → Lobby → Game → Rules)
- 🎲 Demo mode with auto-filled lobby

### Planned
- 👤 User accounts and authentication (Supabase Auth)
- 💾 Persistent game data (Supabase DB)
- 👥 Lobby system with room codes
- 🏆 Admin/user role management
- 📊 Game statistics and history

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Multi-page architecture
- **CSS3** - Styling with Bootstrap
- **JavaScript (ES Modules)** - Vanilla JS, no frameworks
- **Vite** - Build tool and dev server

### Backend (Planned)
- **Supabase** - Backend-as-a-Service
  - Authentication
  - PostgreSQL Database
  - Storage

## 📁 Project Structure

```
Canastify/
├── assets/           # Static assets
│   ├── cards/       # Card images
│   └── icons/       # UI icons
├── docs/            # Documentation
│   ├── architecture_20260129.md  # Architecture guide
│   ├── FAQ_bg.md                 # Frequently Asked Questions (Bulgarian)
│   └── GAME_RULES_bg.md          # Complete game rules (Bulgarian)
├── pages/           # HTML pages
│   ├── index.html   # Home page
│   ├── game.html    # Game interface
│   └── rules.html   # Rules page
├── scripts/         # JavaScript modules
│   └── main.js      # Main entry point
├── styles/          # CSS files
│   └── main.css     # Main styles
├── index.html       # Root entry point
├── package.json     # Dependencies
└── vite.config.js   # Vite configuration
```

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/canastify.git
cd canastify
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 📚 Documentation

- **[Architecture Guide](docs/architecture_20260129.md)** - Complete project architecture and development guidelines
- **[Game Rules (BG)](docs/GAME_RULES_bg.md)** - Detailed rules for Bulgarian Canasta
- **[FAQ (BG)](docs/FAQ_bg.md)** - Frequently asked questions

## 💻 Development

### Code Structure
- **Multi-page architecture** - Each screen is a separate HTML file
- **Modular code** - Shared functionality in ES modules
- **Separation of concerns** - UI, domain logic, and services are separated
- **No build-time TypeScript** - Pure JavaScript for simplicity
- **No UI frameworks** - Vanilla JS with Bootstrap for styling

### Development Workflow
1. Make small, focused changes
2. Test manually in the browser
3. Commit working code
4. Update documentation if needed

### Architecture Principles
- Page-per-folder structure (each page has its own HTML + CSS + JS)
- Shared components in dedicated modules
- Prompt-driven development with incremental steps
- Documentation stays in sync with code

## 📝 License

This project is private and not yet licensed for public use.

## 🤝 Contributing

This is a personal/learning project. Contributions are not currently being accepted.

---

**Game Rules Reference:** Bulgarian Canasta is played with 4 players in 2 teams. The game features special rules for the discard pile, three-card combinations, and strategic "closing on minus" moves. For complete rules, see [GAME_RULES_bg.md](docs/GAME_RULES_bg.md).
