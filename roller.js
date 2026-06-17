/**
 * 滚动选择器核心逻辑
 */

class FoodRoller {
  constructor(viewportEl, trackEl) {
    this.viewport = viewportEl;
    this.track = trackEl;
    this.itemHeight = window.innerWidth >= 768 ? 96 : 80;
    this.isSpinning = false;
    this.items = [];
    this.onComplete = null;

    // GSAP 动画实例
    this.tween = null;
  }

  /**
   * 初始化滚动列表
   */
  init(foods) {
    this.track.innerHTML = '';
    this.items = [];

    // 生成扩展列表（重复多次以实现无限滚动效果）
    const extendedFoods = [];
    for (let i = 0; i < 60; i++) {
      extendedFoods.push(foods[i % foods.length]);
    }

    // 创建 DOM 元素
    extendedFoods.forEach((food, index) => {
      const item = document.createElement('div');
      item.className = 'roller-item';
      item.dataset.index = index;
      item.innerHTML = `
        <span class="roller-item-emoji">${food.emoji}</span>
        <span class="roller-item-text">${food.name}</span>
      `;
      this.track.appendChild(item);
      this.items.push({ el: item, food });
    });

    // 初始位置：显示第一个
    this.track.style.transform = `translateY(0px)`;
  }

  /**
   * 开始滚动
   * @param {Function} onComplete - 完成回调，传入选中的食物
   */
  spin(onComplete) {
    if (this.isSpinning) return;
    this.isSpinning = true;
    this.onComplete = onComplete;

    const foods = foodManager.getAll();
    const totalItems = this.items.length;

    // 随机选择一个目标（在扩展列表的后面部分）
    const minTarget = 30;
    const maxTarget = totalItems - 10;
    const targetIndex = Math.floor(Math.random() * (maxTarget - minTarget)) + minTarget;
    const targetFood = this.items[targetIndex].food;

    // 计算目标位置（让目标项居中于高亮框）
    const viewportHeight = this.viewport.offsetHeight;
    const centerOffset = (viewportHeight - this.itemHeight) / 2;
    const targetY = -(targetIndex * this.itemHeight - centerOffset);

    // 重置位置到开头
    this.track.style.transform = `translateY(0px)`;

    // 使用 GSAP 执行动画
    const spinDuration = 3 + Math.random() * 2; // 3-5秒

    // 添加启动抖动效果
    gsap.to(this.track, {
      y: -50,
      duration: 0.1,
      ease: 'power2.out',
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        // 主滚动动画
        this.tween = gsap.to(this.track, {
          y: targetY,
          duration: spinDuration,
          ease: 'power3.out', // 先快后慢的减速效果
          onUpdate: () => {
            // 添加速度模糊效果
            const progress = this.tween.progress();
            if (progress < 0.7) {
              // 快速滚动时添加模糊
              const blur = Math.max(0, (1 - progress * 1.5) * 2);
              this.track.style.filter = `blur(${blur}px)`;
            } else {
              this.track.style.filter = 'blur(0px)';
            }
          },
          onComplete: () => {
            this.track.style.filter = 'blur(0px)';
            this.isSpinning = false;

            // 高亮选中项
            this.highlightItem(targetIndex);

            // 回调
            if (this.onComplete) {
              setTimeout(() => this.onComplete(targetFood), 300);
            }
          }
        });
      }
    });
  }

  /**
   * 高亮选中的项目
   */
  highlightItem(index) {
    this.items.forEach((item, i) => {
      if (i === index) {
        gsap.to(item.el, {
          scale: 1.2,
          duration: 0.3,
          ease: 'back.out(1.7)',
        });
        item.el.style.opacity = '1';
      } else {
        item.el.style.opacity = '0.4';
      }
    });
  }

  /**
   * 停止滚动
   */
  stop() {
    if (this.tween) {
      this.tween.kill();
    }
    this.isSpinning = false;
    this.track.style.filter = 'blur(0px)';
  }

  /**
   * 重置状态
   */
  reset() {
    this.stop();
    this.items.forEach(item => {
      item.el.style.opacity = '1';
      gsap.set(item.el, { scale: 1 });
    });
    gsap.set(this.track, { y: 0 });
  }
}
