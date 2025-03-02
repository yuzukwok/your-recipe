import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Recipe } from '../../models';
import { ImageService } from '../../services';

@Component({
  selector: 'app-recipe-card',
  templateUrl: './recipe-card.component.html',
  styleUrls: ['./recipe-card.component.scss']
})
export class RecipeCardComponent implements OnInit {
  @Input() recipe!: Recipe;
  @Input() showActions: boolean = true;
  
  loading: boolean = false;
  imageError: boolean = false;
  
  constructor(
    private imageService: ImageService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.processMainImage();
    this.processStepImages();
  }
  
  /**
   * 处理主图片，包括错误处理和回退逻辑
   */
  processMainImage(): void {
    if (this.recipe.main_image_id) {
      this.loading = true;
      try {
        this.recipe.main_image_url = this.imageService.getImageDirectUrl(this.recipe.main_image_id);
      } catch (error) {
        console.error('获取主图片URL失败:', error);
        this.imageError = true;
        // 如果有步骤图片则使用第一个步骤图片作为回退
        this.tryUseFirstStepImageAsFallback();
      } finally {
        this.loading = false;
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
    if (!this.recipe.main_image_url && this.recipe.steps && this.recipe.steps.length > 0) {
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
    if (this.recipe.steps) {
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
  }
  
  /**
   * 图片加载错误处理
   */
  onImageError(): void {
    this.imageError = true;
    console.log('图片加载失败，显示占位图');
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

  // 查看菜谱详情
  viewRecipe(event: MouseEvent): void {
    // 阻止事件冒泡，防止触发卡片的点击事件
    event.stopPropagation();
    
    // 导航到菜谱详情页
    this.router.navigate(['/recipes', this.recipe.id]);
  }
} 