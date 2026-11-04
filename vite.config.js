import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Custom Vite plugin to handle /api/send locally during `npm run dev`
function apiDevMiddleware() {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';
        if (url === '/api/send') {
          // Handle CORS preflight
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

          if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
          }

          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'Method not allowed. Only POST is accepted.' }));
            return;
          }

          let rawBody = '';
          req.on('data', (chunk) => {
            rawBody += chunk;
          });

          req.on('end', async () => {
            try {
              req.body = rawBody ? JSON.parse(rawBody) : {};
            } catch (e) {
              req.body = {};
            }

            // Decorate res with Vercel serverless helper methods
            res.status = (statusCode) => {
              res.statusCode = statusCode;
              return res;
            };
            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return res;
            };

            try {
              const { default: handler } = await import('./api/send.js');
              await handler(req, res);
            } catch (err) {
              console.error('Local dev /api/send error:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                error: err.message || 'Error executing /api/send on local dev server'
              }));
            }
          });
        } else {
          next();
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiDevMiddleware()],
  base: '/',
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'],
          motion: ['framer-motion'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
