// Servidor estático do Curso Power BI (sem dependências) — pronto para Railway
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'site');
const PORT = process.env.PORT || 3000;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.zip': 'application/zip',
  '.pbix': 'application/octet-stream', '.csv': 'text/csv; charset=utf-8',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};
const DOWNLOAD = new Set(['.zip', '.xlsx', '.pbix', '.csv']);

function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Arquivo não encontrado</title><body style="font-family:system-ui;padding:40px;max-width:640px;margin:auto;line-height:1.6">' +
    '<h1>Arquivo não encontrado</h1><p>Se você tentou baixar uma base de dados, peça o arquivo ao professor: ' +
    'ele ainda não foi colocado na pasta <code>site/arquivos</code> do servidor.</p><p><a href="/">Voltar ao curso</a></p></body>');
}

http.createServer((req, res) => {
  let urlPath;
  try { urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch (e) { return notFound(res); }
  if (urlPath === '/healthz') { res.writeHead(200); return res.end('ok'); }
  let file = path.normalize(path.join(ROOT, urlPath));
  if (!file.startsWith(ROOT)) return notFound(res);
  fs.stat(file, (err, st) => {
    if (!err && st.isDirectory()) {
      if (!urlPath.endsWith('/')) { res.writeHead(301, { Location: encodeURI(urlPath) + '/' }); return res.end(); }
      file = path.join(file, 'index.html');
    }
    fs.stat(file, (err2, st2) => {
      if (err2 || !st2.isFile()) return notFound(res);
      const ext = path.extname(file).toLowerCase();
      const headers = {
        'Content-Type': TYPES[ext] || 'application/octet-stream',
        'Content-Length': st2.size,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400',
        'X-Content-Type-Options': 'nosniff'
      };
      if (DOWNLOAD.has(ext)) headers['Content-Disposition'] = `attachment; filename*=UTF-8''${encodeURIComponent(path.basename(file))}`;
      res.writeHead(200, headers);
      if (req.method === 'HEAD') return res.end();
      fs.createReadStream(file).pipe(res);
    });
  });
}).listen(PORT, '0.0.0.0', () => console.log(`Curso Power BI rodando na porta ${PORT}`));
