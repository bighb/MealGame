/**
 * 食物数据管理
 */

// 默认食物列表
const DEFAULT_FOODS = [
  { emoji: '🍜', name: '拉面', category: '主食' },
  { emoji: '🍕', name: '披萨', category: '西餐' },
  { emoji: '🍔', name: '汉堡', category: '西餐' },
  { emoji: '🍣', name: '寿司', category: '日料' },
  { emoji: '🥘', name: '火锅', category: '中餐' },
  { emoji: '🍚', name: '盖浇饭', category: '主食' },
  { emoji: '🌮', name: '墨西哥卷', category: '西餐' },
  { emoji: '🍝', name: '意面', category: '西餐' },
  { emoji: '🥟', name: '饺子', category: '中餐' },
  { emoji: '🍱', name: '便当', category: '日料' },
  { emoji: '🍗', name: '炸鸡', category: '快餐' },
  { emoji: '🥗', name: '沙拉', category: '轻食' },
  { emoji: '🍛', name: '咖喱饭', category: '主食' },
  { emoji: '🦐', name: '虾', category: '海鲜' },
  { emoji: '🥩', name: '牛排', category: '西餐' },
  { emoji: '🫕', name: '涮羊肉', category: '中餐' },
  { emoji: '🍜', name: '螺蛳粉', category: '主食' },
  { emoji: '🥙', name: '肉夹馍', category: '中餐' },
  { emoji: '🍲', name: '麻辣烫', category: '中餐' },
  { emoji: '🫔', name: '粽子', category: '中餐' },
  { emoji: '🍖', name: '韩麻子烧烤', category: '烧烤' },
  { emoji: '🍜', name: '泡面', category: '速食' },
  { emoji: '🫓', name: '包子', category: '早餐' },
  { emoji: '🎉', name: '国维请客', category: '惊喜' },
  { emoji: '🥡', name: '沙县小吃', category: '中餐' },
  { emoji: '🍳', name: '自己做饭', category: '居家' },
  { emoji: '😤', name: '不吃', category: '减肥' },
];

// 存储键名
const STORAGE_KEY = 'meal-game-foods';

/**
 * 食物管理器
 */
class FoodManager {
  constructor() {
    this.foods = this.load();
  }

  /**
   * 从 localStorage 加载食物列表
   */
  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // 验证数据格式
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].emoji) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load foods from storage:', e);
    }
    // 返回默认列表
    return [...DEFAULT_FOODS];
  }

  /**
   * 保存到 localStorage
   */
  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.foods));
    } catch (e) {
      console.warn('Failed to save foods to storage:', e);
    }
  }

  /**
   * 获取所有食物
   */
  getAll() {
    return [...this.foods];
  }

  /**
   * 添加食物
   */
  add(emoji, name, category = '其他') {
    this.foods.push({ emoji, name, category });
    this.save();
  }

  /**
   * 删除食物
   */
  remove(index) {
    if (this.foods.length <= 3) {
      return false; // 至少保留3个
    }
    this.foods.splice(index, 1);
    this.save();
    return true;
  }

  /**
   * 获取随机食物
   */
  getRandom() {
    return this.foods[Math.floor(Math.random() * this.foods.length)];
  }

  /**
   * 重置为默认列表
   */
  reset() {
    this.foods = [...DEFAULT_FOODS];
    this.save();
  }

  /**
   * 生成用于滚动的扩展列表（重复 N 次）
   */
  getExtendedList(count = 50) {
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(this.foods[i % this.foods.length]);
    }
    return result;
  }
}

// 全局实例
const foodManager = new FoodManager();
