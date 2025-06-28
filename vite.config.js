import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
// 依赖移动引入插件
import AutoImport from 'unplugin-auto-import/vite'
// 组件自动引入插件
import Components from 'unplugin-vue-components/vite'
// 图标插件
import Icons from 'unplugin-icons/vite'
// 图标解析器
import IconsResolver from 'unplugin-icons/resolver'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// https://vite.dev/config/

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/types/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json', // 生成 ESLint 兼容的全局变量配置文件
        globalsPropValue: true, // 将自动导入的 API 作为全局变量
      },
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      dts: false, // 指定类型声明文件的路径
      dirs: ['src/components'],
      resolvers: [
        IconsResolver({
          prefix: '', // 设置为 '' 表示你可以直接使用 <HeroiconsOutlineTrash /> 而不是 <IconHeroiconsOutlineTrash />
        }),
        ElementPlusResolver(),
      ],
    }),
    Icons({
      autoInstall: false, // 没有这个参数的话，第一次用图标会报错找不到
    }),
  ],
  // 自动导入组件
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/element/index.scss" as *;`,
      },
    },
  },
})
