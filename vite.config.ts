import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: 'BATCOM',
        short_name: 'BATCOM',
        description: 'Personal Mission Command Center',
        theme_color: '#090909',
        background_color: '#090909',
        display: 'standalone',
        orientation: 'portrait-primary',

        icons: [
          {
            src: '/batcom-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/batcom-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})