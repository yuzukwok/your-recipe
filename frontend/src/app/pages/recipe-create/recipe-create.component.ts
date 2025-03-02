import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { RecipeService, ImageService, AuthService } from '../../services';
import { ImageUploadResponse } from '../../models';

@Component({
  selector: 'app-recipe-create',
  templateUrl: './recipe-create.component.html',
  styleUrls: ['./recipe-create.component.scss']
})
export class RecipeCreateComponent implements OnInit {
  recipeForm!: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  
  // 图片上传相关
  mainImageFile: File | null = null;
  mainImagePreview: string | null = null;
  mainImageId: string | null = null;
  
  stepImageFiles: (File | null)[] = [];
  stepImagePreviews: (string | null)[] = [];
  stepImageIds: (string | null)[] = [];
  
  isUploadingImage = false;
  imageUploadError: string | null = null;
  
  // AI食材识别相关
  isAnalyzingImage = false;
  aiImageFile: File | null = null;
  
  // 标签相关
  availableTags: string[] = [];
  isLoadingTags = false;

  constructor(
    private formBuilder: FormBuilder,
    private recipeService: RecipeService,
    private authService: AuthService,
    private imageService: ImageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadAvailableTags();
    // 检查用户是否已登录
    // console.log('用户是否已登录:', this.authService.isLoggedIn());
    // console.log('当前用户:', this.authService.getCurrentUser());
    // console.log('当前Token:', this.authService.getToken());
  }
  
  // 加载所有可用标签
  loadAvailableTags(): void {
    this.isLoadingTags = true;
    this.recipeService.getAllTags().subscribe({
      next: (tags) => {
        this.availableTags = tags;
        this.isLoadingTags = false;
      },
      error: (err) => {
        console.error('加载标签失败', err);
        this.isLoadingTags = false;
      }
    });
  }
  
  // 添加标签到输入框
  addTagToInput(tag: string): void {
    const tagsControl = this.recipeForm.get('tags');
    if (tagsControl) {
      const currentTags = tagsControl.value || '';
      const tagsArray = currentTags ? currentTags.split(/[,\s]+/).filter((t: string) => t.trim()) : [];
      
      // 检查标签是否已存在
      if (!tagsArray.includes(tag)) {
        tagsArray.push(tag);
        tagsControl.setValue(tagsArray.join(', '));
      }
    }
  }

  private initForm(): void {
    this.recipeForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      cooking_time: [30, [Validators.required, Validators.min(1)]],
      difficulty: [1, [Validators.required]],
      servings: [2, [Validators.required, Validators.min(1)]],
      main_image_id: [null],
      ingredients: this.formBuilder.array([
        this.createIngredientGroup()
      ]),
      steps: this.formBuilder.array([
        this.createStepGroup()
      ]),
      tags: ['']
    });
    
    // 初始化步骤图片数组
    this.stepImageFiles = [null];
    this.stepImagePreviews = [null];
    this.stepImageIds = [null];
  }

  private createIngredientGroup(): FormGroup {
    return this.formBuilder.group({
      name: ['', Validators.required],
      amount: ['', Validators.required],
      unit: ['']
    });
  }

  private createStepGroup(): FormGroup {
    return this.formBuilder.group({
      description: ['', Validators.required],
      image_id: [null]
    });
  }

  get ingredientsArray(): FormArray {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  get stepsArray(): FormArray {
    return this.recipeForm.get('steps') as FormArray;
  }

  addIngredient(): void {
    this.ingredientsArray.push(this.createIngredientGroup());
  }

  removeIngredient(index: number): void {
    if (this.ingredientsArray.length > 1) {
      this.ingredientsArray.removeAt(index);
    }
  }

  addStep(): void {
    this.stepsArray.push(this.createStepGroup());
    this.stepImageFiles.push(null);
    this.stepImagePreviews.push(null);
    this.stepImageIds.push(null);
  }

  removeStep(index: number): void {
    if (this.stepsArray.length > 1) {
      this.stepsArray.removeAt(index);
      this.stepImageFiles.splice(index, 1);
      this.stepImagePreviews.splice(index, 1);
      this.stepImageIds.splice(index, 1);
    }
  }
  
  // 主图片上传处理
  onMainImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.mainImageFile = file;
      
      // 创建预览
      const reader = new FileReader();
      reader.onload = () => {
        this.mainImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
      
      // 上传图片
      this.uploadMainImage(file);
    }
  }
  
  // 步骤图片上传处理
  onStepImageSelected(event: Event, stepIndex: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.stepImageFiles[stepIndex] = file;
      
      // 创建预览
      const reader = new FileReader();
      reader.onload = () => {
        this.stepImagePreviews[stepIndex] = reader.result as string;
      };
      reader.readAsDataURL(file);
      
      // 上传图片
      this.uploadStepImage(file, stepIndex);
    }
  }
  
  // 上传主图片
  uploadMainImage(file: File): void {
    this.isUploadingImage = true;
    this.imageUploadError = null;
    
    this.imageService.uploadImage(file, true).subscribe({
      next: (response: ImageUploadResponse) => {
        // console.log('主图片上传成功:', response);
        this.mainImageId = response.id;
        this.recipeForm.patchValue({ main_image_id: response.id });
        this.isUploadingImage = false;
      },
      error: (err) => {
        // console.error('主图片上传失败:', err);
        this.imageUploadError = '图片上传失败，请重试';
        this.isUploadingImage = false;
      }
    });
  }
  
  // 上传步骤图片
  uploadStepImage(file: File, stepIndex: number): void {
    this.isUploadingImage = true;
    this.imageUploadError = null;
    
    this.imageService.uploadImage(file, false).subscribe({
      next: (response: ImageUploadResponse) => {
        // console.log(`步骤${stepIndex+1}图片上传成功:`, response);
        this.stepImageIds[stepIndex] = response.id;
        
        // 更新FormArray中对应步骤的image_id
        const stepFormGroup = (this.stepsArray.at(stepIndex) as FormGroup);
        stepFormGroup.patchValue({ image_id: response.id });
        
        this.isUploadingImage = false;
      },
      error: (err) => {
        // console.error(`步骤${stepIndex+1}图片上传失败:`, err);
        this.imageUploadError = '图片上传失败，请重试';
        this.isUploadingImage = false;
      }
    });
  }
  
  // 删除主图片
  removeMainImage(): void {
    this.mainImageFile = null;
    this.mainImagePreview = null;
    this.mainImageId = null;
    this.recipeForm.patchValue({ main_image_id: null });
  }
  
  // 删除步骤图片
  removeStepImage(stepIndex: number): void {
    this.stepImageFiles[stepIndex] = null;
    this.stepImagePreviews[stepIndex] = null;
    this.stepImageIds[stepIndex] = null;
    
    // 更新FormArray中对应步骤的image_id
    const stepFormGroup = (this.stepsArray.at(stepIndex) as FormGroup);
    stepFormGroup.patchValue({ image_id: null });
  }

  onSubmit(): void {
    if (this.recipeForm.invalid) {
      // console.log('表单无效，无法提交:', this.recipeForm.errors);
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    // 深度复制表单值
    const formValue = JSON.parse(JSON.stringify(this.recipeForm.value));
    
    // 处理标签
    if (typeof formValue.tags === 'string' && formValue.tags) {
      formValue.tags = formValue.tags.split(/[,\s]+/).map((tag: string) => tag.trim()).filter((tag: string) => Boolean(tag));
    } else {
      formValue.tags = [];
    }

    // 调整步骤数据格式 - 添加order字段
    if (formValue.steps && Array.isArray(formValue.steps)) {
      formValue.steps = formValue.steps.map((step: any, index: number) => ({
        ...step,
        order: index + 1
      }));
    }

    // console.log('提交的菜谱数据:', JSON.stringify(formValue, null, 2));
    // console.log('提交时的认证状态 - 已登录:', this.authService.isLoggedIn());
    // console.log('提交时的认证Token:', this.authService.getToken());

    // 确保用户已登录
    if (!this.authService.isLoggedIn()) {
      this.error = '创建菜谱失败: 您需要先登录';
      this.isSubmitting = false;
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/recipes/create' }});
      return;
    }

    this.recipeService.createRecipe(formValue).subscribe({
      next: (recipe) => {
        // console.log('创建菜谱成功:', recipe);
        this.isSubmitting = false;
        this.router.navigate(['/recipes', recipe.id]);
      },
      error: (err) => {
        this.isSubmitting = false;
        // console.error('创建菜谱失败', err);
        
        let errorMsg = '请稍后再试';
        if (err.status === 401) {
          errorMsg = '未授权，请重新登录';
          // 重定向到登录页面
          this.authService.logout();
          this.router.navigate(['/login'], { queryParams: { returnUrl: '/recipes/create' }});
        } else if (err.status === 422) {
          errorMsg = '请求数据格式有误';
          // console.log('请求数据格式错误，服务器响应:', err.error);
        } else if (err.status === 307) {
          errorMsg = '重定向错误，API路径可能有问题';
          // console.log('重定向错误:', err);
        } else if (err.error && err.error.detail) {
          errorMsg = err.error.detail;
        }
        
        this.error = `创建菜谱失败: ${errorMsg}`;
      }
    });
  }

  // AI识别食材相关方法
  openAiImageSelector(): void {
    // 通过代码触发隐藏的文件输入框
    const fileInput = document.getElementById('ingredients-ai-image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }
  
  onAiImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.aiImageFile = file;
      
      // 上传图片并分析
      this.uploadAndAnalyzeImage(file);
    }
  }
  
  uploadAndAnalyzeImage(file: File): void {
    this.isAnalyzingImage = true;
    this.error = null;
    
    // 使用专门的上传并识别食材的API
    this.imageService.uploadAndIdentifyIngredients(file).subscribe({
      next: (response: ImageUploadResponse) => {
        // console.log('食材图片分析结果:', response);
        
        // 如果有AI标签，处理食材
        if (response.ai_tags) {
          this.processIngredientsFromAiTags(response.ai_tags);
        } else {
          // 如果没有AI标签，尝试再次分析
          this.identifyIngredientsFromImage(response.id);
        }
      },
      error: (err) => {
        // console.error('食材图片上传或分析失败:', err);
        this.error = '图片分析失败，请手动添加食材';
        this.isAnalyzingImage = false;
      }
    });
  }
  
  identifyIngredientsFromImage(imageId: string): void {
    this.imageService.identifyIngredients(imageId).subscribe({
      next: (tags: any) => {
        // console.log('单独识别食材结果:', tags);
        this.processIngredientsFromAiTags(tags);
      },
      error: (err) => {
        // console.error('食材识别失败:', err);
        this.error = '无法识别图片中的食材，请手动添加';
        this.isAnalyzingImage = false;
      }
    });
  }
  
  processIngredientsFromAiTags(aiTags: any): void {
    try {
      // 解析AI返回的食材信息
      let ingredients: string[] = [];
      
      // 确保aiTags是对象
      if (typeof aiTags === 'string') {
        aiTags = JSON.parse(aiTags);
      }
      
      // 从新的专门API获取食材列表
      if (aiTags.ingredients && Array.isArray(aiTags.ingredients)) {
        ingredients = aiTags.ingredients;
      } 
      // 兼容处理旧API格式
      else if (aiTags.主要食材 && Array.isArray(aiTags.主要食材)) {
        ingredients = aiTags.主要食材;
      } else if (aiTags.主要食材 && typeof aiTags.主要食材 === 'string') {
        // 处理逗号或分号分隔的字符串
        ingredients = aiTags.主要食材.split(/[,，、;；]/);
      }
      
      // 添加识别到的食材
      if (ingredients.length > 0) {
        // 清除初始的空白食材行（如果存在）
        if (this.ingredientsArray.length === 1 && 
            !this.ingredientsArray.at(0).get('name')?.value) {
          this.ingredientsArray.removeAt(0);
        }
        
        // 添加识别到的每个食材
        ingredients.forEach(ingredient => {
          if (ingredient && ingredient.trim()) {
            const ingredientName = ingredient.trim();
            this.ingredientsArray.push(
              this.formBuilder.group({
                name: [ingredientName, Validators.required],
                amount: ['适量', Validators.required],
                unit: ['']
              })
            );
          }
        });
      } else {
        this.error = '未能识别到食材，请手动添加';
      }
    } catch (err) {
      // console.error('处理AI识别食材失败:', err);
      this.error = '处理识别结果失败，请手动添加食材';
    } finally {
      this.isAnalyzingImage = false;
    }
  }
} 