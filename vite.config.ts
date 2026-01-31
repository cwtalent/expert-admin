import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  // 开发环境使用根路径，生产环境使用 /expert-admin/
  base: process.env.NODE_ENV === 'production' ? '/expert-admin/' : '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/expert-admin-api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/expert-admin-api/, '/api'),
      },
      '/expert-api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/expert-api/, '/api'),
      },
    },
  },
});
