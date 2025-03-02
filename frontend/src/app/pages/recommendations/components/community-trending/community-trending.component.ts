import { Component, OnInit } from '@angular/core';

interface TrendingRecipe {
  id: number;
  title: string;
  image: string;
  author: string;
  authorAvatar: string;
  likes: number;
  comments: number;
  saves: number;
  tags: string[];
  timePosted: string;
}

interface TrendingTag {
  name: string;
  count: number;
  trending: boolean;
}

interface CommunityChallenge {
  id: number;
  title: string;
  description: string;
  image: string;
  participants: number;
  daysLeft: number;
  prize: string;
}

@Component({
  selector: 'app-community-trending',
  templateUrl: './community-trending.component.html',
  styleUrls: ['./community-trending.component.scss']
})
export class CommunityTrendingComponent implements OnInit {
  // 当前选中的时间范围
  selectedTimeRange: string = '本周';
  timeRanges: string[] = ['今日', '本周', '本月'];
  
  // 当前选中的分类
  selectedCategory: string = '全部';
  categories: string[] = ['全部', '早餐', '午餐', '晚餐', '小吃', '甜点', '饮品'];
  
  // 热门菜谱
  trendingRecipes: TrendingRecipe[] = [
    {
      id: 1,
      title: '香煎三文鱼牛油果沙拉',
      image: 'assets/images/recipes/trending1.jpg',
      author: '美食达人',
      authorAvatar: 'assets/images/avatars/user1.jpg',
      likes: 1243,
      comments: 89,
      saves: 356,
      tags: ['健康', '低碳水', '高蛋白'],
      timePosted: '2小时前'
    },
    {
      id: 2,
      title: '韩式辣白菜炒饭',
      image: 'assets/images/recipes/trending2.jpg',
      author: '韩食专家',
      authorAvatar: 'assets/images/avatars/user2.jpg',
      likes: 987,
      comments: 124,
      saves: 278,
      tags: ['辣', '主食', '快手'],
      timePosted: '5小时前'
    },
    {
      id: 3,
      title: '抹茶红豆千层蛋糕',
      image: 'assets/images/recipes/trending3.jpg',
      author: '甜点控',
      authorAvatar: 'assets/images/avatars/user3.jpg',
      likes: 1567,
      comments: 203,
      saves: 489,
      tags: ['甜点', '下午茶', '日式'],
      timePosted: '昨天'
    },
    {
      id: 4,
      title: '意式番茄罗勒汤',
      image: 'assets/images/recipes/trending4.jpg',
      author: '西餐厨师',
      authorAvatar: 'assets/images/avatars/user4.jpg',
      likes: 756,
      comments: 67,
      saves: 198,
      tags: ['汤品', '素食', '简单'],
      timePosted: '2天前'
    }
  ];
  
  // 热门标签
  trendingTags: TrendingTag[] = [
    { name: '低脂', count: 1243, trending: true },
    { name: '快手菜', count: 987, trending: true },
    { name: '早餐', count: 876, trending: false },
    { name: '家常菜', count: 765, trending: false },
    { name: '烘焙', count: 654, trending: true },
    { name: '素食', count: 543, trending: false },
    { name: '下午茶', count: 432, trending: true },
    { name: '宝宝辅食', count: 321, trending: true }
  ];
  
  // 社区挑战
  communityChallenge: CommunityChallenge = {
    id: 1,
    title: '创意早餐挑战',
    description: '用创新方式改造传统早餐，分享你的创意早餐食谱，赢取丰厚奖品！',
    image: 'assets/images/challenges/breakfast.jpg',
    participants: 1243,
    daysLeft: 5,
    prize: '高级厨具套装'
  };
  
  // 显示模式
  viewMode: 'grid' | 'list' = 'grid';

  constructor() { }

  ngOnInit(): void {
  }
  
  // 切换时间范围
  changeTimeRange(range: string): void {
    this.selectedTimeRange = range;
    // 实际应用中，这里会根据选择的时间范围加载相应的热门菜谱
  }
  
  // 切换分类
  changeCategory(category: string): void {
    this.selectedCategory = category;
    // 实际应用中，这里会根据选择的分类加载相应的热门菜谱
  }
  
  // 切换显示模式
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }
  
  // 格式化数字（超过1000显示为1k）
  formatNumber(num: number): string {
    return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString();
  }
  
  // 加入挑战
  joinChallenge(): void {
    console.log('加入挑战', this.communityChallenge.id);
    // 实际应用中，这里会调用API加入挑战
  }
} 