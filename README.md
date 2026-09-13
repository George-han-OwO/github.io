# George Han · EKU 个人网站

保留原有个人介绍、游戏兴趣和联系方式，加入本地 EKU 3D 模型、站内游走、攀爬、捧字动作、DeepSeek 官方 API 对话和右上角管理员登录。

## 快速开始

需要 Node.js 22+。确认 `public/models/eku.glb` 存在后：

```sh
npm ci
npm run build
npm run setup
npm start
```

打开 `http://localhost:3000`。第一次可以跳过 `setup` 查看角色动作，但真实对话和管理员登录需要在终端配置账号名、密码及 API Key。

完整服务器配置、HTTPS、systemd、额度及数据说明见 [部署说明](deploy/README.md)。此版本需要 Node.js 服务器，不能仅用 GitHub Pages 或 Python 静态服务器运行后端功能。

## 使用

- EKU 会在当前可见内容之间走动、爬边框、阅读文字并把文字副本拿起后放回。
- 点击角色或右下角「和 EKU 聊天」打开对话；可拖动角色位置。
- 对话面板提供挥手、爬边框、拿字看看三个动作按钮。
- 「暂停游走」与「收起 EKU」控制当前页面；遵守系统减少动态效果设置。
- 右上角管理员登录通过服务器验证账号名和密码，登录后可以设置全站游走和访客对话开关。
- 对话需要有效的 DeepSeek 官方 API Key，密钥仅由服务器读取。

## 文件

- `index.html`、`style.css`、`script.js`：原有个人页面与导航。
- `companion.css`、`client/`：EKU 渲染、骨骼姿态、页面动作、聊天和管理面板。
- `server/`：管理员认证、受限会话、DeepSeek 代理、请求校验、限流和持久设置。
- `scripts/setup.mjs`：安全的终端配置向导。
- `scripts/build.mjs`：生成只包含公开内容的 `dist/`。
- `public/models/eku.glb`：本地转换的实际 EKU 模型，随部署包交付，未纳入公开 Git 仓库。
- `tests/`：导航、动作边界、认证和 API 回归测试。
- `deploy/`：服务器部署说明与配置示例。

旧版游戏账号绑定仍然保持移除；新管理员登录使用服务器校验，不采用旧版前端密码或 localStorage 登录标记。

```sh
npm test
npm run build
```
