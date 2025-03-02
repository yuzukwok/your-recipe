import { Component, OnInit } from '@angular/core';
import { Recipe, Recommendation, CookingRecord } from '../../models';
import { RecipeService, RecommendationService, CookingRecordService, ImageService, AuthService } from '../../services';

interface CookingRecordWithDisplay extends CookingRecord {
  displayImageUrl?: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  popularRecipes: Recipe[] = [];
  recommendations: Recommendation[] = [];
  seasonalRecipes: Recipe[] = [];
  recentCookingRecords: CookingRecordWithDisplay[] = [];
  isLoading = true;
  error: string | null = null;
  Math = Math;
  isLoggedIn = false;

  constructor(
    private recipeService: RecipeService,
    private recommendationService: RecommendationService,
    private cookingRecordService: CookingRecordService,
    private imageService: ImageService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = !!this.authService.getCurrentUser();
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;

    // 获取热门菜谱
    this.recipeService.getPopularRecipes(6).subscribe({
      next: (recipes) => {
        this.popularRecipes = recipes;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('获取热门菜谱失败', err);
        this.error = '获取热门菜谱失败，请稍后再试';
        this.isLoading = false;
      }
    });

    // 获取个性化推荐
    this.recommendationService.getRecommendations(3).subscribe({
      next: (recommendations) => {
        this.recommendations = recommendations;
      },
      error: (err) => {
        console.error('获取推荐菜谱失败', err);
      }
    });

    // 获取季节性推荐
    const currentSeason = this.getCurrentSeason();
    this.recommendationService.getSeasonalRecommendations(currentSeason, 3).subscribe({
      next: (recipes) => {
        this.seasonalRecipes = recipes;
      },
      error: (err) => {
        console.error('获取季节性菜谱失败', err);
      }
    });

    // 获取最新烹饪记录
    this.cookingRecordService.getCookingRecords({ limit: 6, order_by: '-created_at' }).subscribe({
      next: (records) => {
        this.recentCookingRecords = records as CookingRecordWithDisplay[];
        // 为有图片的记录加载第一张图片
        this.recentCookingRecords.forEach(record => {
          if (record.images && record.images.length > 0) {
            record.displayImageUrl = this.imageService.getImageDirectUrl(record.images[0]);
          }
        });
      },
      error: (err) => {
        console.error('获取最新烹饪记录失败', err);
      }
    });
  }

  getCurrentSeason(): string {
    const month = new Date().getMonth() + 1; // 月份从0开始，所以+1
    
    if (month >= 3 && month <= 5) {
      return 'spring';
    } else if (month >= 6 && month <= 8) {
      return 'summer';
    } else if (month >= 9 && month <= 11) {
      return 'autumn';
    } else {
      return 'winter';
    }
  }

  getSeasonName(season: string): string {
    switch(season) {
      case 'spring': return '春季';
      case 'summer': return '夏季';
      case 'autumn': return '秋季';
      case 'winter': return '冬季';
      default: return '';
    }
  }

  formatCookingTime(minutes: number): string {
    if (!minutes) return '未知';
    
    if (minutes < 60) {
      return `${minutes}分钟`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`;
    }
  }

  getStarArray(rating: number | undefined): number[] {
    return Array(rating || 0).fill(0);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  }
} 