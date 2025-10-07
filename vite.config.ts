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
            manualChunks: (id) => {
              // Vendor chunks for better caching
              if (id.includes('node_modules')) {
                if (id.includes('react') || id.includes('react-dom')) {
                  return 'vendor';
                }
                if (id.includes('lucide-react')) {
                  return 'ui';
                }
                return 'libs';
              }
              
              // Separate forms into their own chunk
              if (id.includes('/forms/')) {
                return 'forms';
              }
              
              // Separate print components
              if (id.includes('Print') || id.includes('/print/')) {
                return 'print';
              }
              
              // Separate context and utils
              if (id.includes('/context/') || id.includes('/utils/')) {
                return 'core';
              }
            }
          }
        },
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 1000,
        // Enable source maps only in development
        sourcemap: process.env.NODE_ENV === 'development',
        // Enable CSS code splitting for better caching
        cssCodeSplit: true,
        // Use esbuild for faster minification
        minify: 'esbuild',
        // Target modern browsers for smaller bundle
        target: 'es2020'
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
