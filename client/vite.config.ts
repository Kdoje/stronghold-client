import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {CONFIG} from '../config'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define:{
    __PORT__: JSON.stringify(CONFIG.port),
  },

  resolve: {
    alias: {
      common: path.resolve(__dirname, '../common'),
    }
  },

  server: {
    port: CONFIG.clientDevPort || 3002,
  }
})
