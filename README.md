# 🍽️ 今天吃什么？

每天饭点不知道吃什么？让这个小游戏帮你决定！点击按钮，老虎机式滚动随机选择，还有丰富的动画效果和趣味互动。

## ✨ 功能特性

- 🎰 **老虎机式滚动** - 流畅的滚动动画，模拟真实抽奖体验
- 🎊 **彩带庆祝** - 选中食物后有华丽的彩带特效
- ✨ **浮动装饰** - 背景有浮动的食物 emoji 和闪烁的星星
- 📱 **移动端适配** - 支持触摸操作和震动反馈
- ✏️ **自定义菜单** - 长按可编辑食物列表，添加/删除食物
- 💾 **本地存储** - 食物列表自动保存到浏览器
- 🛡️ **防抖机制** - 30秒内点3次会提示"真纠结，别吃了！"
- 🍕 **27种食物** - 内置丰富的食物选项，涵盖中餐、西餐、日料等

## 🎮 玩法说明

1. 点击 **"🎲 开始选择"** 按钮
2. 等待滚动停止，查看命运的安排
3. 长按滚动区域可以编辑食物列表
4. 如果30秒内点3次，会被吐槽哦 😤

## 🛠️ 技术栈

### 核心框架

| 技术 | 版本 | 作用 |
|------|------|------|
| **HTML5** | - | 页面结构，使用语义化标签 |
| **CSS3** | - | 样式和动画，包括渐变、模糊、过渡效果 |
| **JavaScript (ES6+)** | - | 核心逻辑，包括滚动控制、状态管理、事件处理 |

### 动画引擎

| 技术 | 版本 | 作用 |
|------|------|------|
| **GSAP** | 3.12.5 | 专业级动画引擎，负责：<br>- 滚动动画的缓动效果（先快后慢）<br>- 入场动画（标题、按钮的淡入缩放）<br>- 结果卡片的弹出动画<br>- 速度模糊效果（快速滚动时添加模糊） |
| **Canvas Confetti** | 1.9.3 | 彩带特效库，负责：<br>- 选中食物后的庆祝彩带<br>- 从屏幕两侧发射彩色纸屑<br>- 支持自定义颜色和粒子数量 |

### UI 框架

| 技术 | 版本 | 作用 |
|------|------|------|
| **TailwindCSS** | CDN | 实用优先的 CSS 框架，负责：<br>- 响应式布局（移动端/桌面端适配）<br>- 渐变背景、阴影、圆角等视觉效果<br>- 毛玻璃效果（backdrop-blur）<br>- 按钮样式和交互状态 |

### 字体

| 技术 | 版本 | 作用 |
|------|------|------|
| **Google Fonts** | - | 提供 Noto Sans SC 中文字体，确保文字显示美观 |

## 📁 项目结构

```
MealGame/
├── index.html      # 主页面，包含 HTML 结构和 CDN 引入
├── style.css       # 自定义样式，包括动画关键帧和特效
├── foods.js        # 食物数据管理，包括本地存储和 CRUD 操作
├── roller.js       # 滚动选择器核心逻辑，使用 GSAP 实现动画
├── app.js          # 主应用逻辑，包括事件绑定、状态管理、特效控制
├── PHASE.md        # 功能规划文档，记录待开发功能
└── README.md       # 项目说明文档
```

## 🚀 快速开始

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/bighb/MealGame.git
cd MealGame

# 启动本地服务器（任选一种）
python3 -m http.server 8080
# 或者
npx serve .
# 或者
php -S localhost:8080

# 打开浏览器访问
open http://localhost:8080
```

### 部署到服务器

项目是纯静态文件，可以直接部署到任何 Web 服务器：

```bash
# 上传到服务器
scp -r * user@server:/var/www/mealgame/

# Nginx 配置示例
server {
    listen 80;
    server_name _;
    root /var/www/mealgame;
    index index.html;
    
    location / {
        try_files $uri $uri/ $uri.html =404;
    }
}
```

## 🎯 核心实现

### 滚动动画原理

```javascript
// 使用 GSAP 实现先快后慢的减速效果
gsap.to(track, {
  y: targetY,
  duration: 3 + Math.random() * 2,  // 3-5秒随机时长
  ease: 'power3.out',  // 缓动函数，先快后慢
  onUpdate: () => {
    // 快速滚动时添加模糊效果
    const blur = Math.max(0, (1 - progress * 1.5) * 2);
    track.style.filter = `blur(${blur}px)`;
  }
});
```

### 防抖机制

```javascript
// 记录点击时间，30秒内超过3次触发防抖
const clickTimes = [];
const CLICK_LIMIT = 3;
const CLICK_WINDOW = 30000; // 30秒

function checkAntiCheat() {
  const now = Date.now();
  clickTimes = clickTimes.filter(time => now - time < CLICK_WINDOW);
  if (clickTimes.length >= CLICK_LIMIT) return true;
  clickTimes.push(now);
  return false;
}
```

### 本地存储

```javascript
// 使用 localStorage 保存食物列表
class FoodManager {
  save() {
    localStorage.setItem('meal-game-foods', JSON.stringify(this.foods));
  }
  
  load() {
    const saved = localStorage.getItem('meal-game-foods');
    return saved ? JSON.parse(saved) : [...DEFAULT_FOODS];
  }
}
```

## 📋 待开发功能

详见 [PHASE.md](./PHASE.md)

- 🎯 食物对决模式
- 🚫 今日不宜功能
- 🎭 食物专属特效
- 🔊 音效支持
- 🏆 成就系统

## 📄 许可证

MIT License

## 🙏 致谢

- [GSAP](https://greensock.com/gsap/) - 强大的动画引擎
- [Canvas Confetti](https://github.com/catdad/canvas-confetti) - 彩带特效
- [TailwindCSS](https://tailwindcss.com/) - 实用的 CSS 框架
- [Google Fonts](https://fonts.google.com/) - 免费字体服务
