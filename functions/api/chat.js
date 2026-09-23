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

/* /api/chat?base=<base-url> → 转发 <base-url>/chat/completions，绕开浏览器 CORS 限制 */
export async function onRequestPost({ request }) {
  const url = new URL(request.url);
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
  const auth = request.headers.get('Authorization');
  if (auth) headers.Authorization = auth;
  try {
    const body = await request.text();
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
}
