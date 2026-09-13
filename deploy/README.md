# EKU · 服务器部署

网站现在包含 Node.js 后端。原来的 GitHub Pages 只能托管静态文件，无法运行管理员登录或 DeepSeek API 代理。

## 本地运行

需要 Node.js 22 或更新版本。

```sh
npm ci
npm run build
npm run setup
npm start
```

`setup` 在终端交互输入管理员账号名、密码、DeepSeek 官方 API Key 和站点地址。密码和 API Key 输入时隐藏；保存到被 Git 忽略的 `.env`，密码仅保存 scrypt 哈希。站点地址应为 `http://localhost:3000`，不要加结尾斜杠。也可以先跳过 `setup` 运行；EKU 动作可用，登录及对话会明确显示尚未配置。

模型已从用户本地 VPK 转换为 `public/models/eku.glb`。模型必须随部署包一起传到服务器。公开 GitHub 分支仅包含代码，不包含原始资源包或转换模型。构建后模型位于 `dist/models/eku.glb`。

## Linux / Ubuntu + systemd + Caddy

以下假设部署位置为 `/opt/georgehan`。先把部署包解压到该目录，确认 Node.js 22+ 和 Caddy 已安装。初次部署需要有权限的服务器操作员创建专用用户及目录：

```sh
sudo useradd --system --home /opt/georgehan --shell /usr/sbin/nologin georgehan
sudo chown -R georgehan:georgehan /opt/georgehan
cd /opt/georgehan
sudo -u georgehan npm ci
sudo -u georgehan npm run setup
sudo -u georgehan npm run build
```

设置 `PUBLIC_ORIGIN=https://你的域名`，保留 `HOST=127.0.0.1` 和 `TRUST_PROXY=loopback`。将下面两个示例里的域名和路径替换为实际值后再安装：

```sh
sudo cp deploy/georgehan.service /etc/systemd/system/georgehan.service
sudo systemctl daemon-reload
sudo systemctl enable --now georgehan
```

把 `deploy/Caddyfile.example` 的站点块加入服务器现有 Caddy 配置（不要覆盖其他站点配置），再执行：

```sh
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
sudo systemctl status georgehan
```

Caddy 负责 HTTPS 和反向代理。本应用只信任 loopback 代理；不要开启对所有代理的信任。若服务器用 Docker、Nginx、CDN 或不同网络拓扑，需要按实际入口调整代理配置再部署。不要将 Node 的 3000 端口直接对公网开放。

验证服务器 `curl http://127.0.0.1:3000/api/health` 返回 `{"ok":true}`，然后通过域名检查模型、管理员登录、保存设置、退出登录和真实 DeepSeek 回复。完成后，再把当前域名从 GitHub Pages 切换到新服务器。不要在新服务器未验证前更改 DNS。

## Windows 服务器

解压部署包，安装 Node.js 22+，在目录中运行上面的本地命令。用站点实际 HTTPS 地址运行 `npm run setup`，通过现有 IIS 或 Caddy 反向代理到 `127.0.0.1:3000`。长期运行应配置现有服务管理器启动 `node --env-file=.env server/index.mjs`，工作目录必须为网站目录。域名、HTTPS、端口和服务注册方式需要按实际服务器配置。

## 管理与限制

- 右上角管理员登录要求账号名和密码。使用 HttpOnly、SameSite=Strict 的会话 Cookie；HTTPS 时为 Secure，8 小时过期。服务器重启后需要重新登录。
- 管理员可开启/关闭全站自动游走与访客对话。设置存于 `private/settings.json`，其他访客最多一分钟内同步。
- API Key 仅在服务器使用，网页不接收也不保存 Key。更改账号、密码或 Key：在服务器运行 `npm run setup` 后重启服务。
- 默认每个 IP 每小时最多 20 次对话，全站每天最多 200 次（UTC 日期）、最多 3 个并发。每日额度持久保存；失败的上游请求也计入每日额度。单进程部署，多实例需要共享会话和限流存储。
- 仅调用 `https://api.deepseek.com/chat/completions`。模型通过 `DEEPSEEK_MODEL` 设置，默认 `deepseek-v4-flash`，采用非思考模式和 JSON 回复。每次最多 600 输出 token，30 秒超时。
- 对话只保留在当前页面内存中，刷新或清空后移除。服务器不写聊天记录。用户消息和当前可见的公开页面标题会发送给 DeepSeek。
- 模型输出动作只能在 `idle / wave / walk / climb / read / pickup` 中选择，只能操作代码标记的公开内容，不执行返回的 JavaScript、HTML 或任意选择器。
- EKU 在当前可见区域探索，滚动后选择新区域。拿起的是文字副本，原文暂时淡化并保留布局；动作结束、滚动、暂停、隐藏时恢复。系统偏好减少动态效果时默认暂停游走。
- `DEEPSEEK_API_KEY`、`.env`、`private/` 和原始 VPK 不要放进 Web 静态目录或公开仓库。

## 发布检查

```sh
npm test
npm run build
npm audit --omit=dev --registry=https://registry.npmjs.org
```

自动化测试使用模拟的 DeepSeek 响应验证请求格式、动作校验、超时、额度、管理员认证和权限。它们不代表已经完成真实 API 联调。真实联调需要配置有效 Key。

DeepSeek 官方接口参考：[Chat Completions](https://api-docs.deepseek.com/api/create-chat-completion/)。模型转换使用 [SourceIO](https://github.com/REDxEYE/SourceIO) 和 Blender，网页渲染使用 [Three.js](https://threejs.org/)。
