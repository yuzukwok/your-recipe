import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Recipe, Ingredient, Step } from '../../models';
import { RecipeService, ImageService, CookingRecordService, AuthService, NotificationService } from '../../services';
import { switchMap, finalize } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe | null = null;
  isLoading = true;
  error: string | null = null;
  activeStepIndex = 0;
  
  imageLoading = false;
  imageError = false;
  
  // 用户是否为菜谱作者
  isOwner = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService,
    private imageService: ImageService,
    private cookingRecordService: CookingRecordService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          return of(null);
        }
        
        this.isLoading = true;
        this.error = null;
        return this.recipeService.getRecipe(+id);
      })
    ).subscribe({
      next: (recipe) => {
        if (!recipe) {
          this.error = '未找到菜谱';
          this.isLoading = false;
          return;
        }
        
        this.recipe = recipe;
        
        this.processMainImage();
        this.processStepImages();
        
        // 检查用户是否为菜谱作者
        this.checkIfUserIsOwner();
        
        // 完成加载
        this.isLoading = false;
      },
      error: (err) => {
        console.error('获取菜谱详情失败', err);
        this.error = '获取菜谱详情失败，请稍后再试';
        this.isLoading = false;
      }
    });
  }
  
  /**
   * 检查当前登录用户是否为菜谱作者
   */
  checkIfUserIsOwner(): void {
    if (!this.recipe || !this.recipe.user_id) {
      this.isOwner = false;
      return;
    }
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.isOwner = false;
      return;
    }
    
    this.isOwner = currentUser.id === this.recipe.user_id;
  }
  
  /**
   * 编辑菜谱
   */
  editRecipe(): void {
    if (!this.recipe || !this.recipe.id) {
      console.error('无法编辑菜谱：菜谱ID不存在');
      return;
    }
    
    // 导航到编辑菜谱页面
    this.router.navigate(['/recipes', this.recipe.id, 'edit']);
  }
  
  /**
   * 处理主图片，包括错误处理和回退逻辑
   */
  processMainImage(): void {
    if (!this.recipe) return;
    
    if (this.recipe.main_image_id) {
      this.imageLoading = true;
      try {
        this.recipe.main_image_url = this.imageService.getImageDirectUrl(this.recipe.main_image_id);
      } catch (error) {
        console.error('获取主图片URL失败:', error);
        this.imageError = true;
        // 如果有步骤图片则使用第一个步骤图片作为回退
        this.tryUseFirstStepImageAsFallback();
      } finally {
        this.imageLoading = false;
      }
    } else {
      // 没有主图片ID，尝试使用第一个步骤图片
      this.tryUseFirstStepImageAsFallback();
    }
  }
  
  /**
   * 尝试使用第一个步骤图片作为回退
   */
  tryUseFirstStepImageAsFallback(): void {
    if (!this.recipe || this.recipe.main_image_url) return;
    
    if (this.recipe.steps && this.recipe.steps.length > 0) {
      const firstStep = this.recipe.steps[0];
      if (firstStep.image_id) {
        try {
          this.recipe.main_image_url = this.imageService.getImageDirectUrl(firstStep.image_id);
        } catch (error) {
          console.error('获取步骤图片URL失败:', error);
          this.imageError = true;
        }
      }
    }
  }
  
  /**
   * 处理所有步骤图片
   */
  processStepImages(): void {
    if (!this.recipe || !this.recipe.steps) return;
    
    this.recipe.steps.forEach(step => {
      if (step.image_id) {
        try {
          step.image = this.imageService.getImageDirectUrl(step.image_id);
        } catch (error) {
          console.error(`获取步骤${step.order}图片URL失败:`, error);
        }
      }
    });
  }
  
  /**
   * 图片加载错误处理
   */
  onImageError(): void {
    this.imageError = true;
    // console.log('图片加载失败，显示占位图');
  }

  getDifficultyText(difficulty: number | undefined): string {
    if (!difficulty) return '未知';
    
    switch(difficulty) {
      case 1: return '简单';
      case 2: return '中等';
      case 3: return '困难';
      default: return '未知';
    }
  }

  getFormattedTime(minutes: number | undefined): string {
    if (!minutes) return '未知';
    
    if (minutes < 60) {
      return `${minutes}分钟`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`;
    }
  }

  getFormattedDate(dateString: string | undefined): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  setActiveStep(index: number): void {
    if (index >= 0 && this.recipe?.steps && index < this.recipe.steps.length) {
      this.activeStepIndex = index;
    }
  }

  nextStep(): void {
    if (this.recipe?.steps && this.activeStepIndex < this.recipe.steps.length - 1) {
      this.activeStepIndex++;
    }
  }

  prevStep(): void {
    if (this.activeStepIndex > 0) {
      this.activeStepIndex--;
    }
  }

  goBack(): void {
    this.router.navigate(['/recipes']);
  }

  /**
   * 创建烹饪记录
   */
  createCookingRecord(): void {
    if (!this.recipe || !this.recipe.id) {
      console.error('无法创建烹饪记录：菜谱ID不存在');
      return;
    }
    
    // 导航到创建烹饪记录页面，并传递菜谱ID
    this.router.navigate(['/cooking-records/create'], {
      queryParams: { recipeId: this.recipe.id }
    });
  }

  /**
   * 确认删除菜谱
   */
  confirmDeleteRecipe(): void {
    if (!this.recipe || !this.recipe.id) {
      console.error('无法删除菜谱：菜谱ID不存在');
      return;
    }
    
    // 使用原生window.confirm
    const confirmed = window.confirm(`您确定要删除"${this.recipe.title}"吗？此操作不可撤销，所有相关的烹饪记录也将被删除。`);
    if (confirmed) {
      this.deleteRecipe();
    }
  }
  
  /**
   * 删除菜谱
   */
  private deleteRecipe(): void {
    if (!this.recipe || !this.recipe.id) return;
    
    this.isLoading = true;
    this.recipeService.deleteRecipe(this.recipe.id).subscribe({
      next: () => {
        this.notificationService.success('菜谱已成功删除');
        this.router.navigate(['/recipes']);
      },
      error: (err) => {
        console.error('删除菜谱失败', err);
        this.notificationService.error('删除菜谱失败，请稍后再试');
        this.isLoading = false;
      }
    });
  }
} 