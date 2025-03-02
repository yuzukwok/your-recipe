import { Component, OnInit } from '@angular/core';

interface Cuisine {
  id: string;
  name: string;
  description: string;
  image: string;
  selected: boolean;
}

interface FusionRecipe {
  id: number;
  title: string;
  description: string;
  image: string;
  cuisines: string[];
  difficulty: number;
  cookTime: number;
  rating: number;
  tags: string[];
  ingredients: string[];
}

@Component({
  selector: 'app-recipe-fusion',
  templateUrl: './recipe-fusion.component.html',
  styleUrls: ['./recipe-fusion.component.scss']
})
export class RecipeFusionComponent implements OnInit {
  // 可选择的菜系
  cuisines: Cuisine[] = [
    {
      id: 'chinese',
      name: '中式',
      description: '注重食材原味，讲究色香味俱全',
      image: 'assets/images/cuisines/chinese.jpg',
      selected: true
    },
    {
      id: 'italian',
      name: '意式',
      description: '简单新鲜的食材，橄榄油和香草的完美搭配',
      image: 'assets/images/cuisines/italian.jpg',
      selected: false
    },
    {
      id: 'japanese',
      name: '日式',
      description: '精致摆盘，清淡口味，强调食材新鲜度',
      image: 'assets/images/cuisines/japanese.jpg',
      selected: false
    },
    {
      id: 'mexican',
      name: '墨西哥',
      description: '辛辣多彩，玉米、豆类和辣椒的创意组合',
      image: 'assets/images/cuisines/mexican.jpg',
      selected: false
    },
    {
      id: 'indian',
      name: '印度',
      description: '香料丰富，咖喱和烤饼的经典搭配',
      image: 'assets/images/cuisines/indian.jpg',
      selected: false
    },
    {
      id: 'thai',
      name: '泰式',
      description: '酸甜辣咸的平衡，椰奶和香料的独特风味',
      image: 'assets/images/cuisines/thai.jpg',
      selected: false
    }
  ];

  // 融合菜谱推荐
  fusionRecipes: FusionRecipe[] = [
    {
      id: 1,
      title: '意式麻婆豆腐',
      description: '结合意大利番茄和香草风味的创新麻婆豆腐，减少辣度，增加了橄榄油和罗勒的香气',
      image: 'assets/images/recipes/fusion1.jpg',
      cuisines: ['中式', '意式'],
      difficulty: 3,
      cookTime: 35,
      rating: 4.7,
      tags: ['创新', '融合', '豆腐'],
      ingredients: ['豆腐', '意大利番茄', '罗勒', '橄榄油', '大蒜', '洋葱']
    },
    {
      id: 2,
      title: '墨西哥春卷',
      description: '用墨西哥辣椒、牛油果和奶酪填充的春卷，搭配酸奶油蘸料，东西方口味的完美结合',
      image: 'assets/images/recipes/fusion2.jpg',
      cuisines: ['中式', '墨西哥'],
      difficulty: 2,
      cookTime: 25,
      rating: 4.5,
      tags: ['小吃', '派对', '辣味'],
      ingredients: ['春卷皮', '牛油果', '墨西哥辣椒', '奶酪', '酸奶油', '青葱']
    },
    {
      id: 3,
      title: '咖喱寿司卷',
      description: '印度咖喱风味的创意寿司，内馅使用咖喱鸡肉和烤蔬菜，搭配薄荷酸奶酱',
      image: 'assets/images/recipes/fusion3.jpg',
      cuisines: ['日式', '印度'],
      difficulty: 4,
      cookTime: 45,
      rating: 4.8,
      tags: ['创意', '聚会', '咖喱'],
      ingredients: ['寿司米', '海苔', '咖喱粉', '鸡胸肉', '烤蔬菜', '薄荷']
    }
  ];

  // 当前选中的菜系组合
  selectedCuisines: string[] = ['中式'];
  
  // 创意程度
  creativityLevel: number = 3;
  
  // 复杂度偏好
  complexityPreference: number = 2;

  constructor() { }

  ngOnInit(): void {
    this.updateSelectedCuisines();
  }

  // 切换菜系选择状态
  toggleCuisine(cuisine: Cuisine): void {
    cuisine.selected = !cuisine.selected;
    this.updateSelectedCuisines();
  }

  // 更新已选菜系列表
  updateSelectedCuisines(): void {
    this.selectedCuisines = this.cuisines
      .filter(cuisine => cuisine.selected)
      .map(cuisine => cuisine.name);
  }

  // 生成融合菜谱
  generateFusion(): void {
    console.log('生成融合菜谱', {
      cuisines: this.selectedCuisines,
      creativity: this.creativityLevel,
      complexity: this.complexityPreference
    });
    // 实际应用中，这里会调用API获取推荐的融合菜谱
  }

  // 获取菜系图标样式
  getCuisineStyle(cuisine: Cuisine): object {
    return {
      'border-color': cuisine.selected ? '#10b981' : 'transparent',
      'background-color': cuisine.selected ? 'rgba(16, 185, 129, 0.1)' : 'white'
    };
  }

  // 获取难度星级显示
  getDifficultyStars(difficulty: number): number[] {
    return Array(difficulty).fill(0);
  }
} 