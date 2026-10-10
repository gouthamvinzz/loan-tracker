import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function localPersistencePlugin(): Plugin {
  return {
    name: 'local-persistence-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const filePath = path.resolve(process.cwd(), 'data/portfolio.json');

        if (req.url === '/api/loans' && req.method === 'GET') {
          if (fs.existsSync(filePath)) {
            try {
              const data = fs.readFileSync(filePath, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(data);
              return;
            } catch (err) {
              console.error('Error reading portfolio.json:', err);
            }
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ exists: false }));
          return;
        }

        if (req.url === '/api/loans' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localPersistencePlugin()],
});
