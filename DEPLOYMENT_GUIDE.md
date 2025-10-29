# 🚀 部署到 Georgehan0514.top 完整指南

## 第一步：创建GitHub仓库

1. 登录GitHub账号
2. 创建新仓库，命名为：`你的用户名.github.io`
   - 例如：如果你的用户名是`george123`，仓库名就是`george123.github.io`
3. 仓库设置为公开(Public)
4. 初始化README文件

## 第二步：上传网站文件

### 方法A：直接上传
1. 在新创建的仓库中，点击"Upload files"
2. 上传以下文件：
   - `index.html`
   - `styles.css` 
   - `script.js`
   - `README.md`

### 方法B：使用Git命令
```bash
git clone https://github.com/你的用户名/你的用户名.github.io.git
cd 你的用户名.github.io
copy 你的网站文件到这里
git add .
git commit -m "Initial website"
git push origin main
```

## 第三步：开启GitHub Pages

1. 进入仓库设置(Settings)
2. 找到"Pages"选项
3. 在"Source"中选择"Deploy from a branch"
4. 选择"main"分支和"/ (root)"文件夹
5. 点击"Save"

## 第四步：配置自定义域名

### 在GitHub Pages设置中：
1. 在"Custom domain"输入框中填入：`Georgehan0514.top`
2. 点击"Save"
3. 勾选"Enforce HTTPS"（可能需要等待几分钟）

### 在你的域名注册商处：

#### 方法A：CNAME记录（推荐）
添加以下DNS记录：
```
类型：CNAME
主机名：@ 或 www
指向：你的用户名.github.io
TTL：3600 或默认值
```

#### 方法B：A记录（备用）
如果CNAME不支持，使用A记录：
```
类型：A
主机名：@ 或 www
指向以下IP之一：
- 185.199.108.153
- 185.199.109.153  
- 185.199.110.153
- 185.199.111.153
TTL：3600
```

## 第五步：验证部署

1. 等待DNS生效（通常几分钟到24小时）
2. 访问：https://Georgehan0514.top
3. 如果看到"Your site is ready to be published"，说明配置成功

## 第六步：后续更新

以后更新网站时：
1. 修改本地文件
2. 重新上传到GitHub仓库
3. 等待几分钟自动更新

## 🔧 常见问题解决

### 网站无法访问？
- 检查DNS设置是否正确
- 确认GitHub Pages已启用
- 等待DNS生效（最多24小时）

### HTTPS无法启用？
- 确保DNS设置正确
- 等待几分钟再试
- 检查域名是否已验证

### 样式显示异常？
- 检查文件路径是否正确
- 确认所有文件都已上传
- 清除浏览器缓存

## 📞 需要帮助？

如果遇到问题，可以：
1. 检查GitHub Pages文档
2. 查看DNS设置
3. 联系域名注册商支持

祝你部署成功！🎉