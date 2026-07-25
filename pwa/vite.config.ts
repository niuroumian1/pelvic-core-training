import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { appConfig } from './src/config/appConfig'
import {
  resolveDeploymentBase,
  toDeploymentPath,
} from './src/config/deployment'

const activeDeploymentBase = resolveDeploymentBase(
  process.env.PWA_DEPLOY_TARGET,
)

function appMetadata(): Plugin {
  const replacements: Record<string, string> = {
    __APP_DISPLAY_NAME__: appConfig.displayName,
    __APP_DESCRIPTION__: appConfig.description,
    __APP_THEME_COLOR__: appConfig.themeColor,
    __APP_ICON_PATH__: appConfig.iconPath,
  }

  return {
    name: 'app-metadata',
    transformIndexHtml(html) {
      return Object.entries(replacements).reduce(
        (result, [token, value]) => result.replaceAll(token, value),
        html,
      )
    },
  }
}

export default defineConfig({
  base: activeDeploymentBase,
  test: {
    environment: 'jsdom',
  },
  plugins: [
    appMetadata(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [appConfig.iconPath],
      manifest: {
        id: toDeploymentPath(appConfig.internalId, activeDeploymentBase),
        start_url: activeDeploymentBase,
        scope: activeDeploymentBase,
        name: appConfig.displayName,
        short_name: appConfig.shortName,
        description: appConfig.description,
        theme_color: appConfig.themeColor,
        background_color: appConfig.themeColor,
        display: 'standalone',
        orientation: 'portrait',
        lang: 'zh-CN',
        icons: [
          {
            src: toDeploymentPath(appConfig.iconPath, activeDeploymentBase),
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        navigateFallback: 'index.html'
      }
    })
  ]
})
