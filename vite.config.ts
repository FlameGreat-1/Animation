import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    glsl({
      include: [
        '**/*.glsl',
        '**/*.wgsl',
        '**/*.vert',
        '**/*.frag',
        '**/*.vs',
        '**/*.fs'
      ],
      exclude: undefined,
      warnDuplicatedImports: true,
      defaultExtension: 'glsl',
      compress: false,
      watch: true,
      root: '/'
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/hero-animation': resolve(__dirname, './src/hero-animation'),
      '@/components': resolve(__dirname, './src/hero-animation/components'),
      '@/hooks': resolve(__dirname, './src/hero-animation/hooks'),
      '@/utils': resolve(__dirname, './src/hero-animation/utils'),
      '@/types': resolve(__dirname, './src/hero-animation/types')
    }
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production'),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  },
  server: {
    host: true,
    port: 3000,
    open: true,
    cors: true,
    hmr: {
      overlay: true
    }
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'animation-vendor': ['framer-motion', '@react-spring/three', '@react-spring/web'],
          'physics-vendor': ['cannon-es', '@react-three/cannon'],
          'postprocessing-vendor': ['postprocessing', '@react-three/postprocessing']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      '@react-three/postprocessing',
      'framer-motion',
      '@react-spring/three',
      '@react-spring/web',
      '@use-gesture/react',
      'cannon-es',
      '@react-three/cannon',
      'postprocessing',
      'zustand'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    target: 'es2020'
  },
  css: {
    devSourcemap: true
  },
  json: {
    namedExports: true,
    stringify: false
  }
})
