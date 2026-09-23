const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 8080;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.md': 'text/markdown; charset=utf-8'
};

/* 只允许转发已知厂商的 API，防止部署后被当作开放代理滥用 */
const ALLOWED_BASES = new Set([
  'api.deepseek.com',
  'dashscope.aliyuncs.com',
  'ark.cn-beijing.volces.com',
  'open.bigmodel.cn',
  'api.moonshot.cn',
  'qianfan.baidubce.com',
  'api.siliconflow.cn',
  'api.hunyuan.cloud.tencent.com',
  'spark-api-open.xf-yun.com',
  'api.minimax.chat',
  'api.stepfun.com',
  'api.openai.com'
]);

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost');
  const urlPath = decodeURIComponent(u.pathname);

  /* /api/chat?base=<base-url> → 转发 <base-url>/chat/completions，绕开浏览器 CORS 限制 */
  if (urlPath === '/api/chat' && req.method === 'POST') {
    const base = (u.searchParams.get('base') || '').replace(/\/+$/, '');
    let host = '';
    try { host = new URL(base).hostname; } catch (e) {}
    if (!ALLOWED_BASES.has(host)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('仅支持转发以下厂商 API：' + [...ALLOWED_BASES].join(', '));
      return;
    }
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const headers = { 'Content-Type': 'application/json' };
    if (req.headers.authorization) headers.Authorization = req.headers.authorization;
    try {
      const up = await fetch(base + '/chat/completions', {
        method: 'POST',
        headers,
        body: Buffer.concat(chunks)
      });
      const text = await up.text();
      res.writeHead(up.status, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(text);
    } catch (e) {
      res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('代理请求失败：' + e.message);
    }
    return;
  }

  /* 静态文件 */
  let filePath = urlPath === '/' ? '/index.html' : urlPath;
  const file = path.normalize(path.join(ROOT, filePath));
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}/  (API proxy: POST /api/chat?base=...)`));
