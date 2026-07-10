# 网站部署指南 - georgehan0514.top

## 📋 部署前准备

### 1. 检查网站文件
确保以下文件存在于项目根目录：
- ✅ index.html
- ✅ style.css
- ✅ script.js
- ✅ CNAME (已创建)
- ✅ User_/user.png (头像文件)

### 2. 测试本地运行
在部署前，请确保网站在本地运行正常：
```bash
# 在项目目录下启动本地服务器
python -m http.server 8000
# 或使用任何其他本地服务器
```

## 🚀 GitHub Pages 部署步骤

### 第一步：创建GitHub仓库
1. 访问 [GitHub.com](https://github.com)
2. 创建新仓库，命名为：`你的用户名.github.io`
3. 将仓库设为公开（Public）

### 第二步：上传文件到GitHub
```bash
# 初始化Git仓库
git init
git add .
git commit -m "Initial deployment"

# 连接到GitHub仓库
git remote add origin https://github.com/你的用户名/你的用户名.github.io.git
git branch -M main
git push -u origin main
```

### 第三步：启用GitHub Pages
1. 进入仓库的 **Settings** 页面
2. 左侧菜单选择 **Pages**
3. 在 **Branch** 部分选择 `main` 分支
4. 点击 **Save**

### 第四步：配置自定义域名
1. 在Pages设置的 **Custom domain** 中输入：`georgehan0514.top`
2. 勾选 **Enforce HTTPS**
3. 等待DNS生效（通常需要几分钟到几小时）

## 🌐 域名DNS配置

### 登录域名注册商控制面板
根据您的域名注册商（如阿里云、腾讯云等）：

### 添加DNS记录：

**A记录（主域名）：**
```
主机记录：@
记录类型：A
记录值：185.199.108.153
TTL：3600
```

**A记录（备用）：**
```
主机记录：@
记录类型：A
记录值：185.199.109.153
TTL：3600
```

**CNAME记录（www子域名）：**
```
主机记录：www
记录类型：CNAME
记录值：你的用户名.github.io
TTL：3600
```

## ⏱️ 生效时间

- **GitHub Pages**：部署后立即生效
- **DNS解析**：通常需要2-48小时全球生效
- **HTTPS证书**：自动配置，可能需要几小时

## 🔍 测试访问

部署完成后，测试以下地址：
1. `https://你的用户名.github.io` （GitHub Pages原始地址）
2. `https://georgehan0514.top` （自定义域名）
3. `https://www.georgehan0514.top` （带www的域名）

## 🛠️ 故障排除

### 常见问题：

**1. 404错误**
- 检查文件是否上传到正确分支
- 确认index.html在根目录

**2. DNS解析失败**
- 等待DNS传播完成
- 检查DNS记录是否正确

**3. HTTPS证书问题**
- 等待GitHub自动配置证书
- 确保勾选了"Enforce HTTPS"

## 📞 技术支持

如果遇到问题，可以：
1. 检查GitHub Pages文档
2. 查看域名注册商帮助文档
3. 联系我获取进一步帮助

---
**祝您部署顺利！** 🎉