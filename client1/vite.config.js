import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()
  ],
  server: {
    host: '0.0.0.0',   // ye zaroori hai
    port: 5173         // optional: port fix rakh sakte ho
  }
})
