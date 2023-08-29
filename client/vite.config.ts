import path from 'path'
import { build, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { CONFIG } from '../config'


// https://vitejs.dev/config/
export default defineConfig(({ command, mode, ssrBuild }) => {
  // the sockets port shouldn't be specified
  let port = null;
  
  // unless we're using hot reload to test with vite
  if (command === "serve") {
    port = CONFIG.port;
  }
  return {
    plugins: [react({
      babel: {
        plugins: ['@babel/plugin-syntax-import-assertions'],
      },
    })],
    define: {
      __PORT__: JSON.stringify(port),
      __PROTOCOL__: JSON.stringify(CONFIG.protocol)
    },

    resolve: {
      alias: {
        common: path.resolve(__dirname, '../common'),
      }
    },

    server: {
        port: CONFIG.clientDevPort || 3002,
    }

  }
})
