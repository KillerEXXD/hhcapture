import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Library build mode for integration with TournamentPro
  if (mode === 'lib') {
    return {
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          '@types': path.resolve(__dirname, './src/types'),
          '@lib': path.resolve(__dirname, './src/lib'),
          '@components': path.resolve(__dirname, './src/components'),
          '@hooks': path.resolve(__dirname, './src/hooks')
        }
      },
      build: {
        lib: {
          entry: path.resolve(__dirname, 'src/index.ts'),
          name: 'HHToolModular',
          fileName: 'hhtool-modular',
          formats: ['es']
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'react/jsx-runtime'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              'react/jsx-runtime': 'jsxRuntime'
            },
            assetFileNames: (assetInfo) => {
              if (assetInfo.name === 'style.css') return 'style.css';
              return assetInfo.name || 'asset';
            }
          }
        },
        sourcemap: true,
        outDir: 'dist',
        cssCodeSplit: false
      }
    };
  }

  // Default standalone app mode
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@types': path.resolve(__dirname, './src/types'),
        '@lib': path.resolve(__dirname, './src/lib'),
        '@components': path.resolve(__dirname, './src/components'),
        '@hooks': path.resolve(__dirname, './src/hooks')
      }
    },
    server: {
      port: 3001,
      host: '127.0.0.1',
      strictPort: false,
      open: false  // Disable auto-open, we'll handle it in the script
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html')
        }
      }
    },
    optimizeDeps: {
      exclude: ['playground']
    }
  };
});
