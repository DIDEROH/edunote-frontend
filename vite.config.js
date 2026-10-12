import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Application installable et disponible hors ligne (service worker Workbox).
    // Les données de l'API sont mises en cache côté application (IndexedDB,
    // cf. src/utils/offline) : le service worker ne gère que l'interface et les médias.
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['logo.webp', 'pwa-64x64.png', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'EduNote — Gestion scolaire',
        short_name: 'EduNote',
        description: 'Gestion scolaire : élèves, saisie des notes et bulletins, même hors ligne.',
        lang: 'fr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#F3F4FC',
        theme_color: '#4F46E5',
        categories: ['education', 'productivity'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Interface complète précachée : l'application s'ouvre sans réseau
        globPatterns: ['**/*.{js,css,html,png,svg,webp,woff2}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            // Feuille de style Google Fonts (Inter, JetBrains Mono)
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Fichiers de polices
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Photos d'élèves et logos servis par l'API (/storage/...)
            urlPattern: ({ url, request }) => request.destination === 'image' && url.pathname.startsWith('/storage/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'edunote-images',
              expiration: { maxEntries: 600, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
