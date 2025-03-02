import { Component, OnInit } from '@angular/core';

// 定义替代品接口
interface NutritionDiff {
  protein: number;
  fat: number;
  calcium: number;
}

interface Alternative {
  name: string;
  nutritionDiff: NutritionDiff;
  userRating: number;
  category: string;
  benefits: string[];
  tips: string;
}

interface AlternativesMap {
  [key: string]: Alternative[];
}

interface SearchType {
  value: string;
  label: string;
}

@Component({
  selector: 'app-nutrition-alternatives',
  templateUrl: './nutrition-alternatives.component.html',
  styleUrls: ['./nutrition-alternatives.component.scss']
})
export class NutritionAlternativesComponent implements OnInit {
  selectedIngredient = '牛奶';
  
  ingredients = [
    '牛奶', '鸡蛋', '小麦面粉', '牛肉', '白糖'
  ];
  
  // 替代食材选项
  alternatives: AlternativesMap = {
    '牛奶': [
      { 
        name: '豆浆', 
        nutritionDiff: { 
          protein: -10, 
          fat: -35, 
          calcium: -25 
        },
        userRating: 85,
        category: '植物蛋白',
        benefits: ['低脂肪', '适合乳糖不耐受', '含有异黄酮'],
        tips: '选择无糖版本，口感更接近牛奶，可加入少量香草增加风味' 
      },
      { 
        name: '杏仁奶', 
        nutritionDiff: { 
          protein: -25, 
          fat: -20, 
          calcium: -40 
        },
        userRating: 75,
        category: '坚果类',
        benefits: ['富含维生素E', '无胆固醇', '低卡路里'],
        tips: '质地较稀，不适合直接用于烘焙，可加入少量亚麻籽增加稠度' 
      },
      { 
        name: '酸奶', 
        nutritionDiff: { 
          protein: +5, 
          fat: -10, 
          calcium: +5 
        },
        userRating: 90,
        category: '发酵乳制品',
        benefits: ['含有益生菌', '更易消化', '蛋白质含量高'],
        tips: '酸度会影响烘焙食品的发酵，可添加少量小苏打中和酸度' 
      },
    ]
  };
  
  // 当前查看的替代食材信息
  selectedAlternative: Alternative | null = null;
  
  // 搜索类型
  searchTypes: SearchType[] = [
    { value: 'lower-calories', label: '更低卡路里' },
    { value: 'higher-protein', label: '更高蛋白' },
    { value: 'lactose-free', label: '无乳糖' },
    { value: 'gluten-free', label: '无麸质' }
  ];
  
  selectedSearchType = 'lower-calories';
  
  // 添加Math对象，用于模板中的Math.abs()
  Math = Math;

  constructor() { }

  ngOnInit(): void {
    // 默认选中第一个替代品
    if (this.alternatives[this.selectedIngredient] && this.alternatives[this.selectedIngredient].length > 0) {
      this.selectedAlternative = this.alternatives[this.selectedIngredient][0];
    }
  }
  
  selectIngredient(ingredient: string): void {
    this.selectedIngredient = ingredient;
    // 重置选中的替代品
    if (this.alternatives[this.selectedIngredient] && this.alternatives[this.selectedIngredient].length > 0) {
      this.selectedAlternative = this.alternatives[this.selectedIngredient][0];
    } else {
      this.selectedAlternative = null;
    }
  }
  
  selectAlternative(alternative: Alternative): void {
    this.selectedAlternative = alternative;
  }
  
  updateSearchType(type: string): void {
    this.selectedSearchType = type;
    // 实际应用中，这里会根据选择的搜索类型筛选替代品
  }
} 