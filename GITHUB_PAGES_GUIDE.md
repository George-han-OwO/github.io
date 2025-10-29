# GitHub Pages 部署指南

## 1. 准备工作

您已经完成了本地Git仓库的初始化，接下来需要将您的网站文件推送到GitHub。

## 2. 推送到GitHub

由于在自动推送过程中遇到了网络问题，您可以通过以下方式手动上传文件：

1. 登录您的GitHub账户
2. 访问您的仓库：https://github.com/George-han-OwO/github.io
3. 点击"Add file"按钮，选择"Upload files"
4. 拖拽或选择您的网站文件（index.html, script.js, styles.css等）
5. 添加提交信息，如"Initial website files"
6. 点击"Commit changes"按钮

## 3. 配置GitHub Pages

1. 在您的仓库页面，点击"Settings"选项卡
2. 在左侧菜单中找到并点击"Pages"
3. 在"Source"部分，选择分支（通常是"main"或"master"）
4. 点击"Save"按钮
5. 等待几分钟，GitHub会自动构建并部署您的网站
6. 部署完成后，您将在页面顶部看到您的网站URL（通常是https://george-han-owo.github.io）

## 4. 配置自定义域名

如果您想使用自己的域名，请按照以下步骤操作：

1. 在您的仓库中创建一个名为`CNAME`的文件（无扩展名）
2. 在文件中输入您的域名（例如：example.com）
3. 提交并推送此文件

## 5. DNS配置

在您的域名注册商处，添加以下DNS记录：

### 如果使用apex域（example.com）：
添加四条A记录，指向GitHub Pages的IP地址：
- 185.199.108.153
- 185.199.109.153
- 185.199.110.153
- 185.199.111.153

### 如果使用www子域（www.example.com）：
添加一条CNAME记录，指向您的GitHub Pages站点：
- 主机名：www
- 指向：george-han-owo.github.io

## 6. 验证域名

1. 返回GitHub仓库的"Settings" > "Pages"
2. 在"Custom domain"部分，确认您的域名已正确设置
3. 勾选"Enforce HTTPS"选项（如果可用）

## 注意事项

- DNS更改可能需要24-48小时才能完全生效
- 确保您的网站文件中包含一个index.html文件作为首页
- 如果您的网站使用相对路径引用资源，确保路径正确