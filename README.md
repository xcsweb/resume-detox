# resume-detox · 简历 AI 味检测器

纯前端单文件应用（BYOK 模式）：粘贴简历 → 大模型逐条检测"AI 味"并给出改写。你的 API Key 只保存在自己浏览器的 localStorage，**不上传到任何服务器**。

- 12 家大模型厂商预设，开箱即用
- 两种代理方案可选（本地 Node 代理 / 托管版内置函数代理），跨域无忧
- 零依赖：前端无构建、代理仅用 Node 内置模块

---

## 一、三种使用方式（按省事程度排序）

### 方式 1：在线托管版（推荐，什么都不用装）

托管版已内置代理函数，**所有厂商开箱即用，无需安装 Node**：

1. 把本仓库推到你的 GitHub
2. 打开 [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project** → 选本仓库
3. 所有配置已写在 `netlify.toml`，直接点 **Deploy** 即可

> 也可以部署到 Cloudflare Pages（仓库已含 `functions/api/chat.js`），效果相同。

### 方式 2：本地运行代理（想用讯飞星火/OpenAI 的双击用户，或内网环境）

需要先安装 Node.js（见下方第三节），然后：

```bash
git clone https://github.com/xcsweb/resume-detox.git
cd resume-detox
node server.js
```

浏览器打开 `http://localhost:8080` 即可。此模式下自动走本地代理，全部厂商可用。

- 更换端口：Windows `set PORT=3000`，macOS/Linux `export PORT=3000`，再运行 `node server.js`
- 也可以 `npm start`

### 方式 3：双击 index.html 直接打开

零安装，但受浏览器跨域限制，仅下表中 ✅ 的厂商可用（保存配置前点「测试连接」确认）。

---

## 二、大模型厂商配置总表（2026-09 实测）

实测方法：向各厂商发送 CORS 预检请求（OPTIONS）+ 带 Origin 的 POST，检查 `Access-Control-Allow-Origin` 响应头。

| 厂商 | Base URL | 模型示例 | 双击直开 | 备注 |
|---|---|---|:---:|---|
| DeepSeek | `https://api.deepseek.com/v1` | `deepseek-chat` | ✅ | |
| 通义千问 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-plus` | ✅ | |
| 智谱 GLM | `https://open.bigmodel.cn/api/paas/v4` | `glm-5.1` | ✅ | |
| Kimi · 月之暗面 | `https://api.moonshot.cn/v1` | `moonshot-v1-8k` | ✅ | |
| 百度千帆 | `https://qianfan.baidubce.com/v2` | `ernie-4.0-turbo-8k` | ✅ | |
| 硅基流动 | `https://api.siliconflow.cn/v1` | `Qwen/Qwen2.5-7B-Instruct` | ✅ | 有免费模型可白嫖 |
| 腾讯混元 | `https://api.hunyuan.cloud.tencent.com/v1` | `hunyuan-turbos-latest` | ✅ | `hunyuan-lite` 免费 |
| MiniMax | `https://api.minimax.chat/v1` | `MiniMax-Text-01` | ✅ | |
| 阶跃星辰 | `https://api.stepfun.com/v1` | `step-2-mini` | ✅ | |
| 豆包 · 火山方舟 | `https://ark.cn-beijing.volces.com/api/v3` | `doubao-pro-32k` 或 `ep-xxx` 接入点 | ⚠️ 建议走代理 | 预检通过，但部分报错信息浏览器读不到 |
| 讯飞星火 | `https://spark-api-open.xf-yun.com/v1` | `4.0Ultra` | 🔒 必须走代理 | Key 格式为 `APIKey:APISecret`（冒号拼接） |
| OpenAI | `https://api.openai.com/v1` | `gpt-4o-mini` | 🔒 必须走代理 | 国内网络直连不通；**托管版的海外代理可直接用** |

说明：

- ✅ = 双击 index.html 也能直接用；⚠️ / 🔒 = 请用托管版或本地代理方式
- 模型名以各厂商控制台/文档为准，均可自行修改（火山方舟推荐填你开通的 `ep-` 接入点）
- 厂商开通入口：一般在各厂商开放平台控制台创建 API Key 即可，多数有免费额度（混元 lite、星火 lite、硅基流动部分模型完全免费）

## 三、Node.js 安装全流程（仅方式 2 需要）

本项目要求 **Node ≥ 18**（用到内置 fetch）。

### Windows

1. 打开 <https://nodejs.org/>，下载 **LTS（长期支持版）**，得到 `.msi` 安装包
2. 双击安装包 → 一路「下一步」→ 保持默认勾选 **Add to PATH** → Install
3. 验证：按 `Win + R`，输入 `cmd` 回车，在黑窗口输入：

   ```bash
   node -v
   ```

   显示 `v18.x` 或更高即安装成功

4. （可选）会用命令行的话，一条命令等价完成 1~3 步：

   ```bash
   winget install OpenJS.NodeJS.LTS
   ```

### macOS

```bash
# 方式 A：官网下载 LTS 的 .pkg 双击安装（同 Windows 流程）
# 方式 B：有 Homebrew 的话
brew install node
node -v
```

### Linux（Ubuntu / Debian）

```bash
# 官方源（推荐，版本新）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
```

### 验证 & 启动

```bash
node -v        # ≥ v18 即可
node server.js # 启动，默认 http://localhost:8080
```

---

## 四、温度怎么设

温度（temperature）控制模型输出的随机性：

- **0 ~ 0.3**：输出最稳定，评分和 JSON 解析不易出错 —— **默认 0.3**
- **0.5 ~ 0.7**：改写更有文采，但 JSON 检测的解析失败率会上升
- **> 1.0**：仅适合纯创意写作，不建议本项目使用

## 五、常见问题

| 现象 | 原因与解法 |
|---|---|
| 测试连接返回 401 | Key 填错或没额度；星火注意 Key 是 `APIKey:APISecret` 冒号拼接 |
| 返回 403 | Base URL 域名不在白名单（防滥用机制），检查是否填错厂商地址 |
| 控制台报 CORS / Failed to fetch | 该厂商不允许浏览器直连（讯飞星火/OpenAI 等），改用托管版或 `node server.js` |
| 检测结果突然变"本地规则" | 模型返回的 JSON 解析失败（多为温度过高或模型太弱），把温度调回 0.3 或换更强模型 |
| 想换厂商 | 设置弹窗点厂商按钮自动填 Base URL 和模型名，再粘 Key 即可 |

## 六、目录结构

```
index.html                      前端单文件应用（双击可用）
server.js                       本地零依赖代理 + 静态服务（Node ≥18）
netlify.toml                    Netlify 部署配置（零配置导入）
netlify/functions/chat.mjs      Netlify 托管版代理函数
functions/api/chat.js           Cloudflare Pages 代理函数
render.yaml                     Render Blueprint（可选，需绑卡）
```

三处代理（server.js / chat.mjs / chat.js）共用同一份厂商白名单，新增厂商时请同步修改。
