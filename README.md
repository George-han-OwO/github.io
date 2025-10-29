# 个人网站 - 免费部署指南

## 🚀 项目介绍
这是一个现代感黑色主题的个人网站，包含响应式设计、动画效果和交互功能。

## 📁 项目结构
```
├── index.html      # 主页面
├── styles.css      # 样式文件
├── script.js       # 交互功能
└── README.md       # 说明文档
```

## 🌐 免费部署到 GitHub Pages（推荐）

### 步骤1：创建GitHub账号
访问 [github.com](https://github.com) 注册免费账号

### 步骤2：创建新仓库
1. 登录GitHub
2. 点击右上角的 "+" → "New repository"
3. 仓库名称格式：**你的用户名.github.io**（重要！）
   - 例如：如果你的用户名是 `georgegao`，仓库名就是 `georgegao.github.io`
4. 选择 "Public"（公开）
5. 不要初始化README文件
6. 点击 "Create repository"

### 步骤3：上传文件
1. 点击 "uploading an existing file"
2. 拖拽上传以下文件：
   - `index.html`
   - `styles.css`
   - `script.js`
3. 写提交信息："Initial website upload"
4. 点击 "Commit changes"

### 步骤4：开启GitHub Pages
1. 进入你的仓库
2. 点击 "Settings" 标签
3. 向下滚动到 "Pages" 部分
4. 在 "Source" 下选择 "Deploy from a branch"
5. 选择 "main" 分支和 "/ (root)" 文件夹
6. 点击 "Save"

### 步骤5：绑定你的域名（可选）
1. 在 "Pages" 设置页面
2. 找到 "Custom domain" 部分
3. 输入你的域名（如：yourdomain.com）
4. 点击 "Save"
5. 在你的域名提供商处设置DNS：
   - 类型：CNAME
   - 名称：www（或@）
   - 值：你的用户名.github.io

### 步骤6：访问你的网站
- **GitHub Pages地址**：https://你的用户名.github.io
- **自定义域名**：https://yourdomain.com

## 🎯 其他免费部署方案

### Netlify（更简单）
1. 访问 [netlify.com](https://netlify.com)
2. 拖拽你的项目文件夹到网页
3. 自动获得网址：https://随机名称.netlify.app
4. 支持自定义域名

### Vercel（性能优秀）
1. 访问 [vercel.com](https://vercel.com)
2. 用GitHub账号登录
3. 导入你的GitHub仓库
4. 自动部署

## 📝 个性化修改

### 修改个人信息
1. 打开 `index.html`
2. 替换以下内容：
   - "Your Name" → 你的真实姓名
   - "your.email@example.com" → 你的邮箱
   - "+86 138 0000 0000" → 你的电话
   - "中国 北京" → 你的位置
   - 社交媒体链接（GitHub、LinkedIn等）

### 修改头像
1. 替换 `index.html` 中的头像URL：
   ```html
   <img src="你的头像链接" alt="个人照片" class="avatar">
   ```

### 修改技能
在 `index.html` 中找到技能部分，修改技能名称和百分比

### 修改项目
替换项目图片、标题、描述和技术栈

## 🎨 自定义样式
- 主要颜色：`--accent-color: #6366f1;`
- 背景颜色：`--bg-primary: #0a0a0a;`
- 在 `styles.css` 中修改CSS变量

## 📱 功能特性
- ✅ 完全响应式设计
- ✅ 现代黑色主题
- ✅ 平滑滚动导航
- ✅ 技能条动画
- ✅ 项目展示
- ✅ 联系表单
- ✅ 社交媒体链接
- ✅ 加载动画
- ✅ 鼠标跟随效果

## 🔧 本地预览
在本地文件夹中双击 `index.html` 即可在浏览器中预览

## 📞 技术支持
如遇到问题，可以：
1. 检查文件是否完整上传
2. 确认GitHub Pages设置正确
3. 查看浏览器控制台错误信息
4. 重新上传文件

## 🎉 恭喜！
你的网站现在已经可以在互联网上访问了！完全免费，无需服务器费用。