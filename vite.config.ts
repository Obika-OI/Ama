import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'Ama Baby Care',
          short_name: 'Ama',
          description: 'A comprehensive baby care companion with AI acoustic cry analyzer, local weaning recipes, and private tracking.',
          theme_color: '#37b1f5',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: '/assets/aistudio/Untitled_design_20261103_062723_0000_e46b1476.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/assets/aistudio/Untitled_design_20261103_062723_0000_e46b1476.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: '/assets/aistudio/Untitled_design_20261103_062723_0000_e46b1476.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
