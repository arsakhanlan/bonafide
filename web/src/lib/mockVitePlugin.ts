import type { Plugin } from 'vite';

/**
 * Lightweight mock API plugin for local demo and testing without running Java/Docker backend.
 * Only activated when VITE_MOCK=true.
 */
export function mockApiPlugin(): Plugin {
  return {
    name: 'mock-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost');
        const path = url.pathname;
        const method = req.method;

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', () => {
          let parsed: any = {};
          try {
            if (body) parsed = JSON.parse(body);
          } catch {}

          res.setHeader('Content-Type', 'application/json');

          // POST /api/cases
          if (method === 'POST' && path === '/api/cases') {
            res.statusCode = 201;
            res.end(JSON.stringify({ caseId: 'c_' + Math.random().toString(36).substring(2, 8) }));
            return;
          }

          // DELETE /api/cases/:id
          if (method === 'DELETE' && path.startsWith('/api/cases/')) {
            res.statusCode = 204;
            res.end();
            return;
          }

          // POST /api/demo/cases/:id/skip
          if (method === 'POST' && path.includes('/skip')) {
            const days = parsed.days || 8;
            const simulatedDate = new Date(new Date('2026-10-17').getTime() + days * 86400000)
              .toISOString()
              .split('T')[0];
            res.statusCode = 202;
            res.end(JSON.stringify({ today: simulatedDate, woken: 1 }));
            return;
          }

          // POST /api/demo/cases
          if (method === 'POST' && path === '/api/demo/cases') {
            const persona = (parsed.persona || 'RAVI').toLowerCase();
            res.statusCode = 201;
            res.end(JSON.stringify({ caseId: `c_${persona}_demo` }));
            return;
          }

          // POST /api/cases/:caseId/letters/:letterId/approve
          if (method === 'POST' && path.endsWith('/approve')) {
            res.statusCode = 200;
            res.end(JSON.stringify({ status: 'APPROVED' }));
            return;
          }

          // POST /api/cases/:caseId/letters/:letterId/sent
          if (method === 'POST' && path.endsWith('/sent')) {
            res.statusCode = 200;
            res.end(JSON.stringify({ status: 'SENT' }));
            return;
          }

          // POST /api/cases/:caseId/events
          if (method === 'POST' && path.endsWith('/events')) {
            res.statusCode = 202;
            res.end(JSON.stringify({ eventId: 'ev_' + Math.random().toString(36).substring(2, 9) }));
            return;
          }

          next();
        });
      });
    },
  };
}

