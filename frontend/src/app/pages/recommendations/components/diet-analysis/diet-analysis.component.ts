import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-diet-analysis',
  templateUrl: './diet-analysis.component.html',
  styles: []
})
export class DietAnalysisComponent implements OnInit {
  timePeriods = ['周报告', '月报告'];
  selectedPeriod = '周报告';
  
  nutritionData = {
    carbs: 55,
    protein: 20,
    fat: 25,
    targetCarbs: 50,
    targetProtein: 25,
    targetFat: 25
  };
  
  // 近期烹饪的菜谱数据
  recentRecipes = [
    { name: '西红柿炒鸡蛋', frequency: 3, nutrition: { carbs: 10, protein: 15, fat: 8 } },
    { name: '青椒土豆丝', frequency: 2, nutrition: { carbs: 25, protein: 5, fat: 7 } },
    { name: '红烧排骨', frequency: 2, nutrition: { carbs: 8, protein: 30, fat: 25 } },
    { name: '蒜蓉西兰花', frequency: 2, nutrition: { carbs: 12, protein: 8, fat: 5 } },
    { name: '清蒸鲈鱼', frequency: 1, nutrition: { carbs: 5, protein: 25, fat: 10 } }
  ];
  
  // 使用频率最高的食材
  topIngredients = [
    { name: '鸡蛋', count: 8, category: '蛋白质' },
    { name: '西红柿', count: 5, category: '蔬菜' },
    { name: '土豆', count: 4, category: '碳水' },
    { name: '猪肉', count: 4, category: '蛋白质' },
    { name: '洋葱', count: 3, category: '蔬菜' }
  ];
  
  // 饮食目标
  dietaryGoals = {
    currentGoal: '减脂',
    progress: 65,
    warnings: [
      '本周饮食中糖分摄入超标20%',
      '连续5天未摄入足够的膳食纤维'
    ],
    achievements: [
      '本周蛋白质摄入达标',
      '水果摄入量提升30%'
    ]
  };

  constructor() { }

  ngOnInit(): void {
  }
  
  changePeriod(period: string): void {
    this.selectedPeriod = period;
    // 在实际应用中，这里会请求不同时间段的数据
  }
  
  exportReport(): void {
    // 在实际应用中，这里会生成PDF报告或提供数据导出功能
    console.log('导出饮食报告');
  }
} 