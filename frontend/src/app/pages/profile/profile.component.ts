import { Component, OnInit } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService, RecipeService, CookingRecordService, NotificationService } from '../../services';
import { User, Recipe, CookingRecord } from '../../models';

interface ProfileStats {
  totalRecipes: number;
  totalCookingRecords: number;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  stats: ProfileStats = {
    totalRecipes: 0,
    totalCookingRecords: 0
  };
  
  // 状态
  isLoading = true;
  error: string | null = null;
  
  // 菜谱和烹饪记录
  recentRecipes: Recipe[] = [];
  recentCookingRecords: CookingRecord[] = [];
  
  // 星级评分配置
  readonly starsArray = [1, 2, 3, 4, 5];

  constructor(
    private authService: AuthService,
    private recipeService: RecipeService,
    private cookingRecordService: CookingRecordService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadUserData();
  }

  // 判断星星是否应该填充
  isStarFilled(star: number, rating: number | undefined): boolean {
    return star <= (rating || 0);
  }

  loadUserData(): void {
    this.isLoading = true;
    this.user = this.authService.getCurrentUser();
    
    if (!this.user) {
      this.error = '无法获取用户信息，请重新登录';
      this.isLoading = false;
      return;
    }
    
    // 获取用户的菜谱和烹饪记录
    forkJoin({
      recipes: this.recipeService.getUserRecipes(this.user.id).pipe(
        catchError(() => of([]))
      ),
      cookingRecords: this.cookingRecordService.getCookingRecords({user_id: this.user.id}).pipe(
        catchError(() => of([]))
      )
    }).subscribe({
      next: (data) => {
        this.stats.totalRecipes = data.recipes.length;
        this.stats.totalCookingRecords = data.cookingRecords.length;
        
        // 获取最新的5个菜谱和烹饪记录
        this.recentRecipes = data.recipes.slice(0, 5);
        this.recentCookingRecords = data.cookingRecords.slice(0, 5);
        
        // 确保所有烹饪记录都有必要的属性
        this.recentCookingRecords.forEach(record => {
          // 设置菜谱标题默认值
          if (!record.recipe_title && record.recipe_id) {
            record.recipe_title = record.recipe_title || '未命名菜谱';
          }
          
          // 确保评分有默认值，这样在模板中可以安全比较
          if (record.rating === undefined || record.rating === null) {
            record.rating = 0;
          }
        });
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('加载用户数据失败', error);
        this.error = '加载用户数据失败，请稍后再试';
        this.isLoading = false;
      }
    });
  }
} 