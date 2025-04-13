import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat()
export default defineConfig([
  // 排除
  { ignores: ['dist/**', 'node_modules/**'] },
  ...compat.config({
    extends: ['./.eslintrc-auto-import.json'],
  }),
  {
    files: ['**/*.{js,mjs,cjs,vue}'],
    plugins: { js },
    extends: ['js/recommended'],
  },
  {
    files: ['**/*.{js,mjs,cjs,vue}'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['**/*.{js,mjs,cjs,vue}'],
    rules: {
      // 强制使用单引号
      quotes: ['error', 'single'],
      // 禁止使用分号
      semi: ['error', 'never'],
    },
  },
  pluginVue.configs['flat/recommended'],
])
