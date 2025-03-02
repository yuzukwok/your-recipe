import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Recipe, CookingRecordCreate } from '../../models';
import { RecipeService, CookingRecordService, ImageService } from '../../services';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-cooking-record-create',
  templateUrl: './cooking-record-create.component.html',
  styleUrls: ['./cooking-record-create.component.scss']
})
export class CookingRecordCreateComponent implements OnInit {
  recipe: Recipe | null = null;
  recipeLoading = false;
  recipeError: string | null = null;
  
  recordForm: FormGroup;
  saving = false;
  error: string | null = null;
  success = false;
  
  selectedImages: File[] = [];
  uploadedImageIds: string[] = [];
  imageUploading = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private recipeService: RecipeService,
    private cookingRecordService: CookingRecordService,
    private imageService: ImageService
  ) {
    // 初始化表单，默认评分为5星
    this.recordForm = this.fb.group({
      rating: [5, [Validators.min(1), Validators.max(5)]],
      notes: ['', [Validators.maxLength(1000)]],
      actual_time: [null, [Validators.min(1), Validators.max(999)]]
    });
  }

  ngOnInit(): void {
    // 从查询参数中获取菜谱ID
    this.route.queryParams.subscribe(params => {
      const recipeId = params['recipeId'];
      if (recipeId) {
        this.loadRecipe(+recipeId);
      }
    });
  }
  
  /**
   * 加载菜谱详情
   */
  loadRecipe(recipeId: number): void {
    this.recipeLoading = true;
    this.recipeError = null;
    
    this.recipeService.getRecipe(recipeId)
      .pipe(finalize(() => this.recipeLoading = false))
      .subscribe({
        next: (recipe) => {
          this.recipe = recipe;
        },
        error: (err) => {
          console.error('加载菜谱详情失败', err);
          this.recipeError = '无法加载菜谱详情，请稍后再试';
        }
      });
  }
  
  /**
   * 提交烹饪记录
   */
  onSubmit(): void {
    if (this.recordForm.invalid || !this.recipe?.id) {
      return;
    }
    
    this.saving = true;
    this.error = null;
    
    const record: CookingRecordCreate = {
      recipe_id: this.recipe.id,
      rating: this.recordForm.value.rating,
      notes: this.recordForm.value.notes,
      actual_time: this.recordForm.value.actual_time,
      images: this.uploadedImageIds.length > 0 ? this.uploadedImageIds : undefined
    };
    
    this.cookingRecordService.createCookingRecord(record)
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: () => {
          this.success = true;
          setTimeout(() => {
            this.router.navigate(['/recipes', this.recipe?.id]);
          }, 2000);
        },
        error: (err) => {
          console.error('创建烹饪记录失败', err);
          this.error = '创建烹饪记录失败，请稍后再试';
        }
      });
  }
  
  /**
   * 文件选择处理
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        if (file.type.startsWith('image/')) {
          this.selectedImages.push(file);
        }
      }
    }
  }
  
  /**
   * 移除选定的图片
   */
  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
  }
  
  /**
   * 上传所有选定的图片
   */
  uploadImages(): void {
    if (this.selectedImages.length === 0) {
      return;
    }
    
    this.imageUploading = true;
    const uploadPromises = this.selectedImages.map(file => 
      this.imageService.uploadImage(file).toPromise()
    );
    
    Promise.all(uploadPromises)
      .then(results => {
        this.uploadedImageIds = results
          .filter(result => result && result.id)
          .map(result => result?.id as string);
        this.selectedImages = []; // 清空已上传的图片
      })
      .catch(err => {
        console.error('上传图片失败', err);
        this.error = '上传图片失败，请稍后再试';
      })
      .finally(() => {
        this.imageUploading = false;
      });
  }
  
  /**
   * 取消创建烹饪记录
   */
  cancel(): void {
    this.router.navigate(['/recipes', this.recipe?.id]);
  }
} 