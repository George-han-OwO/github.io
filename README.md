# George Han 的个人网站

个人介绍、编程与设计技能、黑客松经历、游戏兴趣和联系方式。使用原生 HTML、CSS 和 JavaScript，部署到 GitHub Pages，无需安装依赖或构建。

## 本地预览

在仓库目录运行：

```sh
python -m http.server 8000 --bind 127.0.0.1
```

打开 http://127.0.0.1:8000/ 。直接打开 `index.html` 也可以浏览正文与使用锚点导航。

## 文件说明

- `index.html`：个人资料、游戏介绍、联系方式和页面元信息。
- `style.css`：深色主题、响应式布局、键盘焦点与减少动态效果设置。
- `script.js`：移动端导航、当前章节提示、年份更新及旧版浏览器数据清理。
- `music-config.js`：当前歌曲《Under Bright Lights》的演出者、封面与本地完整音源。
- `music-player.js`、`music-player.css`：右上角的封面黑胶播放器、播放状态、真实进度和移动端收起布局。
- `music/`：歌曲封面、本地完整音源与出处说明。
- `User_/`：原有头像和白子图片。
- `CNAME`：原有 GitHub Pages 自定义域名。
- `tests/navigation.test.cjs`：导航及旧版数据清理的回归测试。

## 维护

### 音乐盒

当前歌曲为 TWERL、Ekko & Sidetrack、Indy Skies 的《Under Bright Lights》。播放器按“左侧彩色封面和黑胶、右侧歌曲信息、底部横跨整行的进度条”排布。播放器边框、按钮、唱片和进度条采用黑白配色。

更换歌曲时，在 `music-config.js` 中改歌名、歌手、封面和本地音源路径；`duration` 是尚未加载播放器前显示的秒数。

```js
window.SITE_MUSIC = {
  title: "歌曲名称",
  artist: "歌手名称",
  credit: "feat. 合作歌手",
  cover: "music/cover.jpg",
  duration: 0,
  audioSrc: "music/under-bright-lights.mp3",
  sourcePage: "https://soundcloud.com/用户名/歌曲名",
};
```

播放器直接读取配置的本地音频文件作为完整音源。曲目时长由浏览器读取音频元数据；播放、暂停、拖动进度条和唱片动画会保持同步。

访客点击播放后才发声，进度条跟随真实音频并支持拖动及键盘方向键调整。播放时碟片旋转，暂停时停止；系统开启“减少动态效果”时不旋转。点击右上角音乐盒可以展开或收起，手机默认收起。无需账号、密钥或后端。

### 页面资料

编辑 `index.html` 更新学校、年级、比赛经历、游戏时长和联系方式。这些资料均为静态内容，不会自动同步。页面不依赖外部字体、图标库或第三方游戏接口；JavaScript 不可用时，正文、导航与邮箱链接仍可使用。

账号绑定板块、隐藏管理员登录、账号数据文件及每日同步工作流已移除。新版仅尝试删除本站以前使用的两个浏览器存储键，不会读取账号资料，也不会清空其他本地数据。仓库历史及 GitHub 中已有的 Secrets 不受此代码修改影响。

## 检查

需要 Node.js 18 或更新版本：

```sh
node --check script.js
node --test tests/navigation.test.cjs
```

将审核后的修改合并至 `master`，并沿用仓库已有的 GitHub Pages 发布设置。仓库中的 DNS 配置文档是历史部署参考；`EMAILJS_SETUP.md` 是已停用联系表单的历史说明，当前页面没有该表单。
