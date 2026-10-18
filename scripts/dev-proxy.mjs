#!/usr/bin/env node
// Local stand-in for the backend on :8080 so Vite's existing /api proxy works unchanged.
import http from 'node:http';
import https from 'node:https';

const target = process.env.BONAFIDE_API_URL || 'https://bonafide-api-199277557753.asia-southeast1.run.app';
const port = Number(process.env.BONAFIDE_PROXY_PORT || 8080);
const base = new URL(target);
const client = base.protocol === 'https:' ? https : http;
const upstreamPort = base.port || (base.protocol === 'https:' ? 443 : 80);
const basePath = base.pathname.replace(/\/$/, '');
const HOP_BY_HOP = new Set([
  'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailer', 'transfer-encoding', 'upgrade',
]);

function forwarded(headers) {
  const out = {};
  for (const [name, value] of Object.entries(headers)) {
    if (!HOP_BY_HOP.has(name.toLowerCase()) && name.toLowerCase() !== 'host') {
      out[name] = value;
    }
  }
  out.host = base.host;
  return out;
}

const server = http.createServer((req, res) => {
  const upstream = client.request(
    {
      hostname: base.hostname,
      port: upstreamPort,
      method: req.method,
      path: basePath + req.url,
      headers: forwarded(req.headers),
      timeout: 300_000,
    },
    (answer) => {
      res.writeHead(answer.statusCode || 502, forwarded(answer.headers));
      answer.pipe(res);
    });

  upstream.on('timeout', () => upstream.destroy(new Error('upstream timeout')));
  upstream.on('error', (error) => {
    if (!res.headersSent) {
      res.writeHead(502, { 'content-type': 'application/json' });
    }
    res.end(JSON.stringify({ code: 'PROXY_ERROR', message: `Cannot reach ${target}: ${error.message}` }));
  });
  req.on('aborted', () => upstream.destroy());
  req.pipe(upstream);
});

server.listen(port, () => {
  console.log(`[dev-proxy] http://localhost:${port} -> ${target}`);
});
