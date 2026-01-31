import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        game: resolve(__dirname, 'pages/game/game.html'),
        rules: resolve(__dirname, 'pages/rules.html'),
        credits: resolve(__dirname, 'pages/credits.html')
      }
    }
  }
});
