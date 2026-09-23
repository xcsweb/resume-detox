const ALLOWED_BASES = new Set([
  'api.deepseek.com',
  'dashscope.aliyuncs.com',
  'ark.cn-beijing.volces.com',
  'open.bigmodel.cn',
  'api.moonshot.cn',
  'qianfan.baidubce.com',
  'api.siliconflow.cn',
  'api.openai.com'
]);

export default async (req) => {
  const url = new URL(req.url);
  const base = (url.searchParams.get('base') || '').replace(/\/+$/, '');
  let host = '';
  try { host = new URL(base).hostname; } catch (e) {}
  if (!ALLOWED_BASES.has(host)) {
    return new Response('仅支持转发以下厂商 API：' + [...ALLOWED_BASES].join(', '), {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
  const headers = { 'Content-Type': 'application/json' };
  const auth = req.headers.get('Authorization');
  if (auth) headers.Authorization = auth;
  try {
    const body = await req.text();
    const up = await fetch(base + '/chat/completions', { method: 'POST', headers, body });
    const text = await up.text();
    return new Response(text, {
      status: up.status,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (e) {
    return new Response('代理请求失败：' + e.message, {
      status: 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
};

export const config = { path: '/api/chat' };
