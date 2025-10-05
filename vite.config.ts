import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        open: true
      },
      preview: {
        port: 3001,
        host: '0.0.0.0'
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@components': path.resolve(__dirname, 'components'),
          '@utils': path.resolve(__dirname, 'utils'),
          '@types': path.resolve(__dirname, 'types.ts')
        }
      },
      build: {
        // Optimize bundle size
        rollupOptions: {
          output: {
            manualChunks: {
              // Vendor chunks for better caching
              vendor: ['react', 'react-dom'],
              ui: ['lucide-react']
            }
          }
        },
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 2000,
        // Disable source maps for faster builds
        sourcemap: false,
        // Optimize CSS
        cssCodeSplit: false,
        // Use esbuild for faster minification
        minify: 'esbuild',
        // Reduce memory usage
        target: 'es2015'
      },
      // Optimize dependencies
      optimizeDeps: {
        include: ['react', 'react-dom', 'lucide-react'],
        exclude: ['firebase']
      },
      // CSS optimization
      css: {
        devSourcemap: true
      }
    };
});
