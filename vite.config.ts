import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import solidSvg from 'vite-plugin-solid-svg'
import devtools from 'solid-devtools/vite'
import { join } from 'path'

export default defineConfig({
  plugins: [solid(), solidSvg(), devtools()],
  base: '/',
  resolve: {
    alias: {
      '@': join(__dirname, 'src'),
    }
  }
})
