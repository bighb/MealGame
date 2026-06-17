/**
 * 主应用逻辑
 */

// DOM 元素
const elements = {
  title: document.getElementById('title'),
  subtitle: document.getElementById('subtitle'),
  rollerContainer: document.getElementById('roller-container'),
  rollerViewport: document.getElementById('roller-viewport'),
  rollerTrack: document.getElementById('roller-track'),
  spinBtn: document.getElementById('spin-btn'),
  retryBtn: document.getElementById('retry-btn'),
  result: document.getElementById('result'),
  resultCard: document.getElementById('result-card'),
  resultEmoji: document.getElementById('result-emoji'),
  resultText: document.getElementById('result-text'),
  resultSub: document.getElementById('result-sub'),
  editModal: document.getElementById('edit-modal'),
  modalBackdrop: document.getElementById('modal-backdrop'),
  modalContent: document.getElementById('modal-content'),
  foodList: document.getElementById('food-list'),
  newFoodInput: document.getElementById('new-food-input'),
  addFoodBtn: document.getElementById('add-food-btn'),
  closeModalBtn: document.getElementById('close-modal-btn'),
  footerTip: document.getElementById('footer-tip'),
  bg: document.getElementById('bg'),
  floatingFoods: document.getElementById('floating-foods'),
};

// 滚动器实例
let roller = null;

// 状态
let isSpinning = false;

// 防抖状态
let clickTimes = [];
const CLICK_LIMIT = 3;
const CLICK_WINDOW = 30000; // 30秒

/**
 * 初始化应用
 */
function initApp() {
  // 初始化滚动器
  roller = new FoodRoller(elements.rollerViewport, elements.rollerTrack);
  roller.init(foodManager.getAll());

  // 入场动画
  playEnterAnimation();

  // 绑定事件
  bindEvents();

  // 创建浮动食物装饰
  createFloatingFoods();

  // 创建星星背景
  createStars();
}

/**
 * 入场动画
 */
function playEnterAnimation() {
  const tl = gsap.timeline({ defaults: { ease: 'back.out(1.7)' } });

  tl.fromTo(elements.title,
    { opacity: 0, y: -50, scale: 0.5 },
    { opacity: 1, y: 0, scale: 1, duration: 0.8 }
  )
  .fromTo(elements.subtitle,
    { opacity: 0, y: -20 },
    { opacity: 1, y: 0, duration: 0.5 },
    '-=0.3'
  )
  .fromTo(elements.rollerContainer,
    { opacity: 0, y: 50, scale: 0.9 },
    { opacity: 1, y: 0, scale: 1, duration: 0.6 },
    '-=0.2'
  )
  .fromTo(elements.spinBtn,
    { opacity: 0, scale: 0 },
    { opacity: 1, scale: 1, duration: 0.5 },
    '-=0.2'
  )
  .fromTo(elements.footerTip,
    { opacity: 0 },
    { opacity: 1, duration: 0.5 },
    '-=0.2'
  );

  // 按钮脉冲效果
  elements.spinBtn.classList.add('btn-pulse', 'btn-shine');
}

/**
 * 绑定事件
 */
function bindEvents() {
  // 开始按钮
  elements.spinBtn.addEventListener('click', handleSpin);

  // 重试按钮
  elements.retryBtn.addEventListener('click', handleRetry);

  // 编辑弹窗
  elements.modalBackdrop.addEventListener('click', closeEditModal);
  elements.closeModalBtn.addEventListener('click', closeEditModal);
  elements.addFoodBtn.addEventListener('click', handleAddFood);
  elements.newFoodInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAddFood();
  });

  // 长按打开编辑
  let longPressTimer = null;
  elements.rollerViewport.addEventListener('touchstart', (e) => {
    longPressTimer = setTimeout(() => {
      openEditModal();
    }, 800);
  });
  elements.rollerViewport.addEventListener('touchend', () => {
    clearTimeout(longPressTimer);
  });
  elements.rollerViewport.addEventListener('touchmove', () => {
    clearTimeout(longPressTimer);
  });

  // 鼠标长按（桌面端）
  elements.rollerViewport.addEventListener('mousedown', (e) => {
    longPressTimer = setTimeout(() => {
      openEditModal();
    }, 800);
  });
  elements.rollerViewport.addEventListener('mouseup', () => {
    clearTimeout(longPressTimer);
  });
  elements.rollerViewport.addEventListener('mouseleave', () => {
    clearTimeout(longPressTimer);
  });
}

/**
 * 检查是否触发防抖
 */
function checkAntiCheat() {
  const now = Date.now();
  // 清除过期的点击记录
  clickTimes = clickTimes.filter(time => now - time < CLICK_WINDOW);

  if (clickTimes.length >= CLICK_LIMIT) {
    return true; // 触发防抖
  }

  clickTimes.push(now);
  return false;
}

/**
 * 显示防抖提示
 */
function showAntiCheatMessage() {
  // 创建提示元素
  const msg = document.createElement('div');
  msg.className = 'fixed inset-0 z-50 flex items-center justify-center';
  msg.innerHTML = `
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
    <div class="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 mx-4 max-w-sm shadow-2xl transform">
      <div class="text-6xl mb-4 text-center">😤</div>
      <div class="text-2xl font-bold text-gray-800 text-center mb-2">真纠结，别吃了！</div>
      <div class="text-gray-500 text-center mb-6">30秒内点了3次，看来你不太饿嘛</div>
      <button class="w-full py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 active:scale-95 transform transition-all" onclick="this.closest('.fixed').remove()">
        好吧，我再想想
      </button>
    </div>
  `;
  document.body.appendChild(msg);

  // 入场动画
  gsap.fromTo(msg.querySelector('.relative'),
    { scale: 0.5, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
  );

  // 震动反馈
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }

  // 清空点击记录，重新开始计数
  clickTimes = [];
}

/**
 * 处理开始滚动
 */
function handleSpin() {
  if (isSpinning) return;

  // 检查防抖
  if (checkAntiCheat()) {
    showAntiCheatMessage();
    return;
  }

  isSpinning = true;

  // 按钮状态
  elements.spinBtn.disabled = true;
  elements.spinBtn.classList.remove('btn-pulse', 'btn-shine');
  gsap.to(elements.spinBtn, { scale: 0.9, duration: 0.1 });

  // 隐藏结果
  hideResult();

  // 震动反馈
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }

  // 音效模拟（视觉反馈）
  elements.rollerViewport.classList.add('shake');
  setTimeout(() => elements.rollerViewport.classList.remove('shake'), 500);

  // 开始滚动
  roller.spin((selectedFood) => {
    // 震动反馈
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    // 显示结果
    showResult(selectedFood);

    isSpinning = false;
  });
}

/**
 * 显示结果
 */
function showResult(food) {
  elements.result.classList.remove('hidden');
  elements.resultEmoji.textContent = food.emoji;
  elements.resultText.textContent = `今天吃 ${food.name}！`;
  elements.resultSub.textContent = getRandomEncouragement();

  // 结果动画
  gsap.fromTo(elements.resultCard,
    { scale: 0, rotation: -10 },
    {
      scale: 1,
      rotation: 0,
      duration: 0.6,
      ease: 'back.out(1.7)',
      onComplete: () => {
        elements.resultEmoji.classList.add('emoji-bounce');
      }
    }
  );

  // 彩带效果
  launchConfetti();

  // 切换按钮
  elements.spinBtn.classList.add('hidden');
  elements.retryBtn.classList.remove('hidden');
  gsap.fromTo(elements.retryBtn,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.3 }
  );

  // 改变背景色
  changeBackground();
}

/**
 * 隐藏结果
 */
function hideResult() {
  elements.resultEmoji.classList.remove('emoji-bounce');
  gsap.to(elements.resultCard, {
    scale: 0,
    duration: 0.3,
    ease: 'back.in(1.7)',
    onComplete: () => {
      elements.result.classList.add('hidden');
    }
  });
}

/**
 * 处理重试
 */
function handleRetry() {
  hideResult();

  // 重置滚动器
  roller.reset();
  roller.init(foodManager.getAll());

  // 切换按钮
  elements.retryBtn.classList.add('hidden');
  elements.spinBtn.classList.remove('hidden');
  elements.spinBtn.disabled = false;
  elements.spinBtn.classList.add('btn-pulse', 'btn-shine');

  gsap.fromTo(elements.spinBtn,
    { scale: 0.8 },
    { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
  );
}

/**
 * 获取随机鼓励语
 */
function getRandomEncouragement() {
  const messages = [
    '好吃到飞起！🚀',
    '今天也是美好的一天！☀️',
    '命运的安排，接受吧！✨',
    '听起来就很美味！😋',
    '完美选择！👏',
    '去享受美食吧！🎉',
    '你的胃在欢呼！🥳',
    '这就是命运的安排！💫',
    '快去吃吧，别犹豫了！🏃',
    '今天你值得拥有！💖',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * 彩带效果
 */
function launchConfetti() {
  const duration = 3 * 1000;
  const end = Date.now() + duration;

  const colors = ['#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff', '#4b0082', '#ee82ee'];

  (function frame() {
    confetti({
      particleCount: 7,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    });
    confetti({
      particleCount: 7,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

/**
 * 改变背景颜色
 */
function changeBackground() {
  const gradients = [
    'linear-gradient(to bottom right, #f97316, #ec4899, #8b5cf6)',
    'linear-gradient(to bottom right, #06b6d4, #3b82f6, #8b5cf6)',
    'linear-gradient(to bottom right, #10b981, #06b6d4, #3b82f6)',
    'linear-gradient(to bottom right, #f59e0b, #ef4444, #ec4899)',
    'linear-gradient(to bottom right, #8b5cf6, #ec4899, #f97316)',
  ];

  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
  elements.bg.style.background = randomGradient;
}

/**
 * 创建浮动食物装饰
 */
function createFloatingFoods() {
  const foodEmojis = ['🍕', '🍔', '🍟', '🌮', '🍜', '🍣', '🍩', '🍦', '🧁', '🍰', '🥐', '🥯'];

  for (let i = 0; i < 15; i++) {
    const food = document.createElement('div');
    food.className = 'floating-food';
    food.textContent = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
    food.style.left = Math.random() * 100 + '%';
    food.style.animationDuration = (8 + Math.random() * 12) + 's';
    food.style.animationDelay = Math.random() * 10 + 's';
    food.style.fontSize = (1.5 + Math.random() * 2) + 'rem';
    elements.floatingFoods.appendChild(food);
  }
}

/**
 * 创建星星背景
 */
function createStars() {
  for (let i = 0; i < 30; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 2 + 's';
    star.style.animationDuration = (1 + Math.random() * 2) + 's';
    document.body.appendChild(star);
  }
}

/**
 * 打开编辑弹窗
 */
function openEditModal() {
  elements.editModal.classList.remove('hidden');
  renderFoodList();

  gsap.fromTo(elements.modalBackdrop,
    { opacity: 0 },
    { opacity: 1, duration: 0.3 }
  );
  gsap.fromTo(elements.modalContent,
    { scale: 0.8, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
  );
}

/**
 * 关闭编辑弹窗
 */
function closeEditModal() {
  gsap.to(elements.modalContent, {
    scale: 0.8,
    opacity: 0,
    duration: 0.2,
  });
  gsap.to(elements.modalBackdrop, {
    opacity: 0,
    duration: 0.3,
    onComplete: () => {
      elements.editModal.classList.add('hidden');
      // 重新初始化滚动器
      roller.init(foodManager.getAll());
    }
  });
}

/**
 * 渲染食物列表
 */
function renderFoodList() {
  elements.foodList.innerHTML = '';
  const foods = foodManager.getAll();

  foods.forEach((food, index) => {
    const item = document.createElement('div');
    item.className = 'food-item';

    const info = document.createElement('div');
    info.className = 'flex items-center gap-3';

    const emoji = document.createElement('span');
    emoji.className = 'text-2xl';
    emoji.textContent = food.emoji;

    const name = document.createElement('span');
    name.className = 'font-medium text-gray-700';
    name.textContent = food.name;

    info.appendChild(emoji);
    info.appendChild(name);

    const deleteBtn = document.createElement('div');
    deleteBtn.className = 'food-item-delete';
    deleteBtn.textContent = '✕';
    deleteBtn.addEventListener('click', () => {
      if (foodManager.remove(index)) {
        renderFoodList();
        // 添加删除动画
        gsap.fromTo(item,
          { x: 0, opacity: 1 },
          { x: 100, opacity: 0, duration: 0.3 }
        );
      } else {
        // 提示不能删除
        gsap.to(item, {
          x: -10,
          duration: 0.1,
          yoyo: true,
          repeat: 3,
        });
      }
    });

    item.appendChild(info);
    item.appendChild(deleteBtn);
    elements.foodList.appendChild(item);
  });
}

/**
 * 处理添加食物
 */
function handleAddFood() {
  const input = elements.newFoodInput;
  const text = input.value.trim();

  if (!text) return;

  // 解析输入（支持 "🍕 披萨" 格式）
  let emoji = '🍽️';
  let name = text;

  const emojiMatch = text.match(/^(\p{Emoji_Presentation}|\p{Emoji}️?)/u);
  if (emojiMatch) {
    emoji = emojiMatch[0];
    name = text.slice(emoji.length).trim();
  }

  if (!name) {
    name = text;
  }

  foodManager.add(emoji, name);
  input.value = '';
  renderFoodList();

  // 添加动画
  const lastItem = elements.foodList.lastElementChild;
  if (lastItem) {
    gsap.fromTo(lastItem,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3 }
    );
  }
}

// 启动应用
document.addEventListener('DOMContentLoaded', initApp);
