import { renderLayout } from './layout.js';
import { renderRulesPage } from './pages/rulesPage.js';

// Определяне на активната страница
function getActivePage() {
  const path = window.location.pathname;
  
  // Map пътища към идентификатори
  if (path === '/' || path === '/index.html') {
    return 'home';
  } else if (path === '/pages/game/game.html') {
    return 'game';
  } else if (path === '/pages/rules.html') {
    return 'rules';
  } else if (path === '/pages/about.html') {
    return 'about';
  }
  
  return 'home'; // default
}

// Зареждане на съдържание за съответната страница
function loadPageContent(activePage) {
  const contentDiv = document.getElementById('page-content');
  if (!contentDiv) return;

  // Специално рендериране за Rules страницата
  if (activePage === 'rules') {
    renderRulesPage(contentDiv);
    return;
  }

  // Статично съдържание за останалите страници
  const pageContent = {
    home: `
      <h2>Добре дошли в Canastify!</h2>
      <p>Българска канаста - онлайн игра за четирима играчи.</p>
      <p>Изберете опция от менюто, за да започнете.</p>
    `,
    game: `
      <h2>Игра</h2>
      <p>Тук ще бъде игралното поле (в разработка).</p>
    `,
    about: `
      <h2>За проекта</h2>
      <p>Canastify е модерна уеб реализация на класическата българска канаста.</p>
      <p>Проектът е изграден с vanilla JavaScript, без външни библиотеки.</p>
    `
  };

  contentDiv.innerHTML = pageContent[activePage] || pageContent.home;
}

// Инициализация при зареждане на страницата
document.addEventListener('DOMContentLoaded', () => {
  const activePage = getActivePage();
  renderLayout(activePage);
  loadPageContent(activePage);
});
