# 个人主页 - 精英开发者

一个帅气、高大上的黑色系个人主页，专为精英开发者设计。

## ✨ 特性

- 🎨 **黑色系设计** - 现代、专业的深色主题
- ⚡ **高性能** - 优化的动画和交互效果
- 📱 **响应式布局** - 完美适配所有设备
- 🌟 **动态效果** - 粒子背景、滚动动画、悬停效果
- 🎯 **用户体验** - 流畅的导航和交互动画

## 🚀 快速开始

1. 克隆或下载项目文件
2. 直接在浏览器中打开 `index.html` 文件
3. 或者使用本地服务器运行：
   ```bash
   # 使用 Python
   python -m http.server 8000
   
   # 使用 Node.js
   npx serve .
   ```

## 📁 项目结构

```
个人主页/
├── index.html          # 主页面文件
├── style.css           # 样式文件
├── script.js           # JavaScript交互逻辑
└── README.md          # 项目说明
```

## 🎨 设计特色

### 颜色主题
- 主色调：深黑色 (#0a0a0a)
- 强调色：青色 (#4ecdc4)
- 辅助色：红色 (#ff6b6b)

### 动画效果
- 加载动画
- 滚动触发动画
- 技能进度条动画
- 粒子背景效果
- 悬停交互效果

## 📱 响应式设计

- **桌面端**：完整功能展示
- **平板端**：自适应布局
- **移动端**：优化触摸交互

## 🔧 自定义配置

### 修改个人信息
编辑 `index.html` 文件中的以下部分：

```html
<!-- 首页区域 -->
<div class="profile-info">
    <h3>你的名字</h3>
    <p>你的职位</p>
</div>

<!-- 关于我区域 -->
<div class="about-text">
    <h3>你的标题</h3>
    <p>你的介绍...</p>
</div>

<!-- 联系信息 -->
<div class="contact-details">
    <div class="contact-item">
        <i class="fas fa-envelope"></i>
        <span>你的邮箱</span>
    </div>
</div>
```

### 修改技能数据
在 `index.html` 中更新技能百分比：

```html
<div class="skill-item" data-percent="95">
    <span class="skill-name">技能名称</span>
    <div class="skill-bar">
        <div class="skill-progress"></div>
    </div>
</div>
```

### 添加项目
复制并修改项目卡片：

```html
<div class="project-card">
    <div class="project-image">
        <div class="project-overlay">
            <h4>项目类型</h4>
            <p>项目描述</p>
        </div>
    </div>
    <div class="project-info">
        <h3>项目标题</h3>
        <p>详细描述...</p>
        <div class="project-tags">
            <span class="tag">技术栈</span>
        </div>
    </div>
</div>
```

## 🌟 功能亮点

### 导航功能
- 平滑滚动导航
- 移动端汉堡菜单
- 滚动时导航栏样式变化

### 动画效果
- 渐入动画
- 技能进度条动画
- 项目悬停效果
- 粒子背景动画

### 交互功能
- 联系表单验证
- 成功通知提示
- 响应式触摸交互

## 🛠️ 技术栈

- **HTML5** - 语义化标记
- **CSS3** - 现代样式和动画
- **JavaScript** - 交互逻辑
- **Font Awesome** - 图标库
- **Google Fonts** - 字体服务

## 📈 性能优化

- 图片懒加载
- CSS动画优化
- JavaScript事件委托
- 响应式图片
- 代码分割和压缩

## 🐛 问题反馈

如果你遇到任何问题或有改进建议，请：

1. 检查浏览器控制台是否有错误信息
2. 确保所有文件路径正确
3. 尝试刷新浏览器缓存
4. 在不同浏览器中测试

## 📄 许可证

本项目采用 MIT 许可证 - 详见 LICENSE 文件。

## 🤝 贡献

欢迎提交 Pull Request 或提出 Issue 来改进这个项目。

---

**享受你的帅气个人主页！** 🚀