import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {CONFIG} from '../config'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define:{
    __PORT__: JSON.stringify(CONFIG.port),
  },

  server: {
    port: CONFIG.clientDevPort || 3002,
  }
})
