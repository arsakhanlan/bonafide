import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { mockApiPlugin } from './src/lib/mockVitePlugin';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isMock = process.env.VITE_MOCK === 'true' || mode === 'mock';

  return {
    plugins: [
      react(),
      ...(isMock ? [mockApiPlugin()] : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: '../backend/src/main/resources/static',
      emptyOutDir: true,
    },
    server: {
      port: 3000,
      host: true,
      proxy: isMock
        ? undefined
        : {
            '/api': {
              target: 'http://localhost:8080',
              changeOrigin: true,
            },
          },
    },
  };
});
