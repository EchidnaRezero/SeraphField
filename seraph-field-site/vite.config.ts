import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({mode}) => {
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/src/generated/posts.json')) {
              return 'content-posts';
            }

            if (id.includes('/src/generated/search-index.json')) {
              return 'content-search-index';
            }

            if (
              id.includes('langium') ||
              id.includes('@chevrotain') ||
              id.includes('chevrotain') ||
              id.includes('vscode-jsonrpc') ||
              id.includes('vscode-languageserver-types')
            ) {
              return 'langium-stack';
            }

            if (id.includes('@mermaid-js/parser')) {
              return 'mermaid-parser';
            }

            if (
              id.includes('react-markdown') ||
              id.includes('remark-gfm') ||
              id.includes('remark-math') ||
              id.includes('rehype-katex') ||
              id.includes('react-syntax-highlighter') ||
              id.includes('katex')
            ) {
              return 'markdown-stack';
            }

            if (id.includes('lucide-react')) {
              return 'icon-stack';
            }

            if (id.includes('/react/') || id.includes('/react-dom/')) {
              return 'react-core';
            }

            if (id.includes('motion')) {
              return 'motion';
            }
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
