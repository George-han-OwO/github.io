# 阿里云DNS配置指南 - georgehan0514.top

## 🔍 截图分析

从您提供的截图中，我可以看到：
- 您的域名 `georgehan0514.top` 已成功注册在阿里云
- 域名已完成实名认证
- DNS服务器为阿里云默认服务器：`ns1.alidns.com` 和 `ns2.alidns.com`

## 📝 阿里云DNS配置步骤

### 1. 进入云解析DNS控制台

在截图界面，点击左侧菜单的 "**云解析DNS**" 或 "**DNS解析**" 选项，进入DNS配置界面。

### 2. 添加A记录（主域名指向GitHub Pages）

在DNS解析设置页面，点击 "**添加记录**" 按钮：

#### 第一条A记录：
```
记录类型：A
主机记录：@
记录值：185.199.108.153
TTL：3600
```

#### 第二条A记录：
```
记录类型：A
主机记录：@
记录值：185.199.109.153
TTL：3600
```

#### 第三条A记录：
```
记录类型：A
主机记录：@
记录值：185.199.110.153
TTL：3600
```

#### 第四条A记录：
```
记录类型：A
主机记录：@
记录值：185.199.111.153
TTL：3600
```

### 3. 添加CNAME记录（www子域名）

添加www子域名的CNAME记录：

```
记录类型：CNAME
主机记录：www
记录值：你的GitHub用户名.github.io （例如：username.github.io）
TTL：3600
```

### 4. 添加TXT记录（验证所有权，可选）

如果GitHub Pages要求验证域名所有权：

```
记录类型：TXT
主机记录：@
记录值：github-pages-verification=验证字符串
TTL：3600
```

## 🚀 后续GitHub Pages配置

1. **创建GitHub仓库**：命名为 `你的用户名.github.io`
2. **上传网站文件**：包括index.html, style.css, script.js, CNAME等
3. **设置自定义域名**：
   - 进入仓库Settings → Pages
   - 在Custom domain中输入：`georgehan0514.top`
   - 勾选Enforce HTTPS
   - 保存设置

## ⏱️ 生效时间

- **DNS记录生效**：阿里云DNS通常在5-30分钟内生效
- **全球传播**：完全传播可能需要24-48小时
- **HTTPS证书**：GitHub会自动配置，通常需要几分钟到几小时

## 🔧 验证DNS配置

配置完成后，可以通过以下方式验证：

1. 使用 `nslookup` 命令：
   ```
   nslookup georgehan0514.top
   nslookup www.georgehan0514.top
   ```

2. 或使用在线DNS检测工具检查解析是否正确

## 📋 配置完成清单

- [ ] 添加4条A记录指向GitHub Pages IP
- [ ] 添加CNAME记录指向GitHub用户名.github.io
- [ ] 在GitHub Pages中设置自定义域名
- [ ] 等待DNS生效并测试访问

---

**提示**：如果您选择其他托管平台（如Netlify、Vercel等），只需修改相应的A记录或CNAME记录值即可。

需要更详细的帮助吗？请随时告诉我！