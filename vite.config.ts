import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        },
        manifest: {
          id: '/',
          name: 'Mallaesa',
          short_name: 'Mallaesa',
          description: 'Sistema Integral de Seguridad Perimetral y Gestión Operativa MALLAESA',
          theme_color: '#898A82',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: 'https://appdesignproyectos.com/mallaesaicono.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'https://appdesignproyectos.com/mallaesaicono.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio per runtime environment constraints.
      hmr: process.env.ENABLE_HMR === 'true',
      watch: process.env.ENABLE_HMR === 'true' ? {} : null,
    },
  };
});
