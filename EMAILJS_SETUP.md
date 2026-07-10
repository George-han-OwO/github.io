# 联系表单邮件发送配置指南

## 概述

本文档提供多种方案配置网站联系表单的邮件发送功能，特别适合未成年人使用。可以将表单数据发送到你的Outlook邮箱。

## 适合未成年人的邮件发送方案

### 方案1：使用免费的邮件服务API（推荐）

#### A. 使用EmailJS（免费，无需实名）
1. 访问 https://www.emailjs.com/
2. 使用QQ邮箱或Outlook邮箱注册
3. 创建邮件服务（免费版每月100封邮件）
4. 获取Public Key、Service ID和Template ID

#### B. 配置EmailJS到Outlook邮箱
```javascript
// 替换script.js中的腾讯云配置为EmailJS配置
const EMAILJS_CONFIG = {
    serviceId: '你的EmailJS Service ID',
    templateId: '你的EmailJS Template ID', 
    publicKey: '你的EmailJS Public Key',
    toEmail: '你的Outlook邮箱@outlook.com'
};
```

### 方案2：使用表单数据保存到本地文件

如果无法使用邮件服务，可以将表单数据保存为本地文件：
```javascript
// 将表单数据保存为JSON文件
function saveFormDataToFile(formData) {
    const data = {
        timestamp: new Date().toISOString(),
        contact: formData.get('contact'),
        name: formData.get('name'), 
        message: formData.get('message'),
        games: getSelectedGames()
    };
    
    // 创建下载链接
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contact-form-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}
```

### 方案3：使用Google Forms（无需编程）

1. 创建Google表单：https://forms.google.com
2. 设置表单字段（联系方式、姓名、留言、游戏选择）
3. 获取表单提交链接
4. 将网站表单重定向到Google表单

## 快速配置EmailJS到Outlook邮箱

### 步骤1：注册EmailJS账户
1. 访问 https://www.emailjs.com/
2. 使用你的Outlook邮箱注册
3. 完成邮箱验证

### 步骤2：创建邮件服务
1. 在EmailJS控制台点击"Email Services"
2. 选择"Gmail"或"Outlook"作为邮件服务
3. 连接你的Outlook邮箱
4. 获取Service ID

### 步骤3：创建邮件模板

1. 在EmailJS控制台点击"Email Templates"
2. 点击"Create Template"创建新模板
3. 使用以下模板内容：

**模板名称**: `游戏伙伴邀请模板`
**收件人**: `GeorgeGaoHan@outlook.com`（固定发送到你的邮箱）
**主题**: `新的游戏伙伴邀请 - {{name}}`

**邮件内容**（HTML格式）：
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
    <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333; text-align: center; margin-bottom: 30px;">新的伙伴申请！</h2>
        
        <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #2c3e50; margin-top: 0;">好友申请：</h3>
            <ul style="color: #555; line-height: 1.6;">
                <li><strong>昵称：</strong>{{name}}</li>
                <li><strong>联系方式：</strong>{{contact}}</li>
                <li><strong>发送时间：</strong>{{date}}</li>
            </ul>
        </div>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #856404; margin-top: 0;">申请内容：</h4>
            <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">{{message}}</p>
        </div>
        
        <div style="border-top: 1px dashed #ddd; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
            来自个人网站的游戏邀请系统
        </div>
    </div>
</div>
```

4. 获取Template ID

### 步骤4：更新script.js配置
```javascript
// 替换为你的EmailJS配置
const EMAILJS_CONFIG = {
    serviceId: 'service_xxxxxxxxx',
    templateId: 'template_xxxxxxxxx',
    publicKey: 'publickey_xxxxxxxxx',
    toEmail: '你的Outlook邮箱@outlook.com'
};
```

## 测试功能

配置完成后：

1. 访问你的网站
2. 滚动到 "联系我~" 区域
3. 填写测试信息：
   - 联系方式：测试QQ
   - 昵称：测试用户
   - 干啥？：测试游戏邀请
4. 点击 "发送邀请" 按钮
5. 检查你的QQ邮箱是否收到测试邮件

## 功能特点

- ✅ 实时表单验证
- ✅ 发送状态提示（发送中/成功/失败）
- ✅ 自动清空表单
- ✅ 响应式设计
- ✅ 腾讯云高可靠性邮件服务

## 注意事项

1. **费用说明**：腾讯云邮件推送服务有免费额度，超出后按量计费
2. **安全性**：API密钥需要妥善保管，建议使用环境变量或后端服务
3. **域名要求**：需要配置发信域名才能正常发送邮件
4. **发送限制**：注意腾讯云的发送频率和数量限制

## 安全建议

由于前端直接暴露API密钥存在安全风险，建议：

1. **使用后端服务**：将邮件发送逻辑放在后端服务器
2. **环境变量**：在生产环境中使用环境变量存储敏感信息
3. **API网关**：通过API网关进行请求转发和认证

## 故障排除

如果邮件发送失败：

1. 检查腾讯云API密钥配置是否正确
2. 确认发信域名是否已验证通过
3. 查看浏览器控制台的错误信息
4. 检查腾讯云服务状态
5. 确认网络连接正常

## 支持的游戏列表

联系表单会自动包含以下游戏信息：
- 碧蓝档案、Minecraft、CSGO
- 崩坏星穹铁道、R6、战地2042
- 绝地潜兵2、PayDay2、暗区突围
- 三角洲、逃离塔科夫、和平精英、CODM

---

**重要安全提醒**：当前实现为前端演示版本，在生产环境中建议使用后端服务来处理邮件发送，避免在前端暴露API密钥。

---

完成配置后，你的网站访客就可以通过联系表单直接向你发送游戏邀请，所有邀请都会自动转发到你的QQ邮箱！