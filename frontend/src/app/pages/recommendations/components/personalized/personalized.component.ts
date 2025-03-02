import { Component, OnInit } from '@angular/core';
import { Recipe } from '../../../../models';

@Component({
  selector: 'app-personalized',
  templateUrl: './personalized.component.html',
  styleUrls: ['./personalized.component.scss']
})
export class PersonalizedComponent implements OnInit {
  userPreferences = {
    diet: '普通',
    allergies: ['无'],
    cookingSkill: 2,
    equipment: ['烤箱', '电饭煲', '炒锅']
  };
  
  preferenceSliders = {
    healthVsTaste: 50,
    quickVsComplex: 50,
    traditionalVsCreative: 50
  };
  
  recommendedRecipes: Recipe[] = [
    {
      id: 1,
      title: '健康三明治',
      description: '营养早餐，富含蛋白质和膳食纤维',
      difficulty: 1,
      cooking_time: 15,
      image_url: 'https://via.placeholder.com/300',
      tags: ['早餐', '健康', '快手菜']
    },
    {
      id: 2,
      title: '蒜蓉西兰花',
      description: '简单美味的蔬菜菜肴，丰富维生素C',
      difficulty: 1,
      cooking_time: 20,
      image_url: 'https://via.placeholder.com/300',
      tags: ['蔬菜', '低脂', '快手菜']
    },
    {
      id: 3,
      title: '意式烤鸡',
      description: '香草风味烤鸡，口感鲜嫩多汁',
      difficulty: 2,
      cooking_time: 60,
      image_url: 'https://via.placeholder.com/300',
      tags: ['主菜', '烤箱', '晚餐']
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  updatePreferenceSlider(slider: string, value: number): void {
    this.preferenceSliders[slider as keyof typeof this.preferenceSliders] = value;
  }
  
  updatePreference(preference: string, value: any): void {
    (this.userPreferences as any)[preference] = value;
  }
  
  dislikeRecipe(recipeId: number): void {
    this.recommendedRecipes = this.recommendedRecipes.filter(recipe => recipe.id !== recipeId);
    // 在实际应用中，这里会调用API将用户不喜欢的食谱反馈给后端优化算法
  }
} 