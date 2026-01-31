/**
 * Credits Page Renderer
 * Displays project credits and license attribution
 */

export function renderCreditsPage(container) {
  container.innerHTML = `
    <div class="credits-container">
      <h1>Благодарности</h1>
      
      <section class="credits-section">
        <h2>Графични активи</h2>
        <h3>Vector Playing Cards (Version 3.2)</h3>
        <p>
          <strong>Лицензия:</strong> LGPL 3.0
        </p>
        <p>
          Картите в тази игра са използвани от проекта "Vector Playing Cards".
          Благодарим на авторите за предоставянето на високо качествени SVG карти.
        </p>
        <p>
          <strong>Авторско право</strong> © автори на Vector Playing Cards.
          Разпространяво под лиценз LGPL 3.0.
        </p>
        <p>
          <a href="/assets/cards/vector_cards/LGPL 3.0 - LICENSING INFORMATION.txt" target="_blank">
            Вижте пълния текст на LGPL 3.0 лиценза
          </a>
        </p>
      </section>

      <section class="credits-section">
        <h2>Технологии</h2>
        <ul>
          <li><strong>Vite</strong> - За dev server и build</li>
          <li><strong>Bootstrap</strong> - За CSS и лейаут</li>
          <li><strong>Vanilla JavaScript (ES Modules)</strong> - За функционалност</li>
        </ul>
      </section>

      <section class="credits-section">
        <h2>Лицензна информация</h2>
        <p>
          Canastify е проект, който използва трети страни активи под различни лицензи.
          За повече информация вижте файловете с лицензи в папката <code>/assets</code>.
        </p>
      </section>

      <nav class="credits-nav">
        <a href="/" class="btn btn-secondary">← Начало</a>
      </nav>
    </div>
  `;

  // Apply credits-specific styles
  const style = document.createElement('style');
  style.textContent = `
    .credits-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      font-family: 'Inter', sans-serif;
    }

    .credits-container h1 {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
    }

    .credits-section {
      margin-bottom: 30px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
      border-left: 4px solid #007bff;
    }

    .credits-section h2 {
      margin-top: 0;
      color: #007bff;
    }

    .credits-section h3 {
      color: #555;
      margin-top: 15px;
      margin-bottom: 10px;
    }

    .credits-section p {
      line-height: 1.6;
      margin-bottom: 10px;
    }

    .credits-section a {
      color: #007bff;
      text-decoration: none;
    }

    .credits-section a:hover {
      text-decoration: underline;
    }

    .credits-section ul {
      margin: 10px 0;
      padding-left: 20px;
    }

    .credits-section li {
      margin-bottom: 8px;
    }

    code {
      background: #e9ecef;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }

    .credits-nav {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }

    .credits-nav a {
      display: inline-block;
      margin: 0 10px;
    }
  `;
  document.head.appendChild(style);
}
