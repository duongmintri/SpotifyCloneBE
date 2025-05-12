import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Thêm dòng này để mở cho tất cả các địa chỉ IP
    allowedHosts: ['spotifyclone.sytes.net']
  }
})
