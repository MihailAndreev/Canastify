/**
 * Създава и инжектира общ layout (header, nav, main, footer)
 * @param {string} activePage - 'home', 'game', 'rules', 'about'
 */
export function renderLayout(activePage) {
  const app = document.getElementById('app');
  if (!app) {
    console.error('Element #app not found');
    return;
  }

  // Навигационни линкове
  const navLinks = [
    { id: 'home', label: 'Начало', href: '/index.html' },
    { id: 'game', label: 'Игра', href: '/pages/game/game.html' },
    { id: 'rules', label: 'Правила', href: '/pages/rules.html' },
    { id: 'about', label: 'За проекта', href: '/pages/about.html' }
  ];

  // Генериране на nav линкове с active class
  const navHTML = navLinks
    .map(link => {
      const activeClass = link.id === activePage ? ' class="active"' : '';
      return `<a href="${link.href}"${activeClass}>${link.label}</a>`;
    })
    .join('\n        ');

  // Layout структура
  app.innerHTML = `
    <header>
      <div class="container">
        <h1 class="site-title">Canastify</h1>
        <nav>
          ${navHTML}
        </nav>
      </div>
    </header>

    <main>
      <div class="container">
        <div id="page-content">
          <!-- Съдържанието на страницата се зарежда тук -->
        </div>
      </div>
    </main>

    <footer>
      <div class="container">
        <p>&copy; 2026 Canastify - Българска канаста</p>
      </div>
    </footer>
  `;
}
