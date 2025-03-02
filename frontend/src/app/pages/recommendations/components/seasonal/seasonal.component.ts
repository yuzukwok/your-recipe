import { Component, OnInit } from '@angular/core';
import { Recipe } from '../../../../models';

@Component({
  selector: 'app-seasonal',
  templateUrl: './seasonal.component.html',
  styles: [] // 使用内联空样式代替外部样式文件
})
export class SeasonalComponent implements OnInit {
  seasons = ['春季', '夏季', '秋季', '冬季'];
  currentSeason = '夏季'; // 假设当前是夏季
  currentLocation = '北京';
  locations = ['北京', '上海', '广州', '成都', '哈尔滨'];
  
  seasonalIngredients = [
    { name: '西瓜', popularity: 98, image: 'https://via.placeholder.com/100' },
    { name: '黄瓜', popularity: 95, image: 'https://via.placeholder.com/100' },
    { name: '茄子', popularity: 88, image: 'https://via.placeholder.com/100' },
    { name: '西红柿', popularity: 85, image: 'https://via.placeholder.com/100' },
    { name: '玉米', popularity: 82, image: 'https://via.placeholder.com/100' }
  ];
  
  weeklyTrending: Recipe[] = [
    {
      id: 101,
      title: '凉拌西瓜皮',
      description: '夏日清凉解暑的家常小菜',
      difficulty: 1,
      cooking_time: 20,
      likes_count: 245,
      tags: ['夏季', '凉菜', '素食']
    },
    {
      id: 102,
      title: '西瓜冰沙',
      description: '简单易做的夏季饮品',
      difficulty: 1,
      cooking_time: 10,
      likes_count: 312,
      tags: ['夏季', '饮品', '甜点']
    },
    {
      id: 103,
      title: '蒜蓉茄子',
      description: '夏季餐桌上的下饭神器',
      difficulty: 2,
      cooking_time: 30,
      likes_count: 189,
      tags: ['夏季', '家常菜', '下饭']
    }
  ];
  
  festivals = [
    { 
      name: '端午节', 
      date: '2023-06-22', 
      recipes: ['粽子', '咸鸭蛋', '雄黄酒'] 
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }
  
  changeSeason(season: string): void {
    this.currentSeason = season;
    // 在实际应用中，这里会调用API根据选择的季节加载相应的食材和食谱
  }
  
  changeLocation(location: string): void {
    this.currentLocation = location;
    // 在实际应用中，这里会调用API根据选择的位置加载相应的食材和食谱
  }
} 