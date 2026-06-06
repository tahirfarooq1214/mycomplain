// Minimal test server — no Express, no dependencies, just raw Node.js
const http = require('http');
const PORT = parseInt(process.env.PORT || '3000', 10);

console.log(`[test] Starting minimal server on 0.0.0.0:${PORT}...`);

const server = http.createServer((req, res) => {
  console.log(`[test-req] ${req.method} ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', port: PORT, time: new Date().toISOString() }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[test] Listening on 0.0.0.0:${PORT} — ready for requests`);
});
