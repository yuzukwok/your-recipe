import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { RecipeService, ImageService, NotificationService } from '../../services';
import { Recipe } from '../../models';

// 扩展ImageUploadResponse接口
interface ExtendedImageUploadResponse {
  id: string;
  file_path: string;
  url?: string;
  ai_tags?: any;
}

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css']
})
export class RecipeEditComponent implements OnInit {
  recipeForm: FormGroup;
  mainImagePreview: string | null = null;
  stepImagePreviews: (string | null)[] = [];
  
  // 添加document属性，使模板可以访问
  document: Document = document;
  
  // 状态
  isLoading = true;
  error: string | null = null;
  isUploadingImage = false;
  isSubmitting = false;
  isAnalyzingImage = false;
  imageUploadError: string | null = null;
  
  // 保存原始数据，用于比较变更
  originalRecipe: Recipe | null = null;
  recipeId: string | null = null;
  
  // 添加标签相关属性
  availableTags: string[] = [];
  isLoadingTags = false;

  constructor(
    private fb: FormBuilder,
    private recipeService: RecipeService,
    private imageService: ImageService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    this.recipeForm = this.initForm();
  }

  ngOnInit(): void {
    this.recipeId = this.route.snapshot.paramMap.get('id');
    if (!this.recipeId) {
      this.error = '未找到菜谱ID';
      this.isLoading = false;
      return;
    }

    this.loadRecipe();
    this.loadAvailableTags();
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

  // 加载菜谱数据
  loadRecipe(): void {
    this.recipeService.getRecipe(+this.recipeId!)
      .pipe(
        tap(recipe => {
          this.originalRecipe = recipe;
        }),
        catchError(error => {
          console.error('加载菜谱失败', error);
          this.error = '无法加载菜谱数据，请稍后再试';
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe(recipe => {
        if (recipe) {
          this.populateForm(recipe);
          this.isLoading = false;
        }
      });
  }

  // 初始化表单
  initForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      cooking_time: [30, [Validators.required, Validators.min(1)]],
      difficulty: [1, [Validators.required]],
      servings: [2, [Validators.required, Validators.min(1)]],
      main_image_id: [''],
      ingredients: this.fb.array([
        this.createIngredient()
      ]),
      steps: this.fb.array([
        this.createStep()
      ]),
      tags: ['']
    });
  }

  // 根据现有菜谱数据填充表单
  populateForm(recipe: Recipe): void {
    // 设置基本信息
    this.recipeForm.patchValue({
      title: recipe.title,
      description: recipe.description,
      cooking_time: recipe.cooking_time,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      main_image_id: recipe.main_image_id || '',
      tags: recipe.tags?.join(',') || ''
    });

    // 设置主图片预览
    if (recipe.main_image_id && recipe.main_image_url) {
      this.mainImagePreview = recipe.main_image_url;
    }

    // 设置食材
    this.ingredientsArray.clear();
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      recipe.ingredients.forEach(ingredient => {
        this.ingredientsArray.push(this.fb.group({
          name: [ingredient.name, [Validators.required]],
          amount: [ingredient.amount, [Validators.required]],
          unit: [ingredient.unit || '']
        }));
      });
    } else {
      this.addIngredient();
    }

    // 设置步骤
    this.stepsArray.clear();
    this.stepImagePreviews = [];
    if (recipe.steps && recipe.steps.length > 0) {
      recipe.steps.forEach(step => {
        this.stepsArray.push(this.fb.group({
          description: [step.description, [Validators.required]],
          image_id: [step.image_id || '']
        }));
        // 如果步骤有image属性，则将其作为预览URL
        this.stepImagePreviews.push(step.image || null);
      });
    } else {
      this.addStep();
    }
  }

  // 创建新食材
  createIngredient(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      amount: ['', [Validators.required]],
      unit: ['']
    });
  }

  // 创建新步骤
  createStep(): FormGroup {
    return this.fb.group({
      description: ['', [Validators.required]],
      image_id: ['']
    });
  }

  // 食材相关方法
  get ingredientsArray(): FormArray {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  addIngredient(): void {
    this.ingredientsArray.push(this.createIngredient());
  }

  removeIngredient(index: number): void {
    if (this.ingredientsArray.length > 1) {
      this.ingredientsArray.removeAt(index);
    }
  }

  // 步骤相关方法
  get stepsArray(): FormArray {
    return this.recipeForm.get('steps') as FormArray;
  }

  addStep(): void {
    this.stepsArray.push(this.createStep());
    this.stepImagePreviews.push(null);
  }

  removeStep(index: number): void {
    if (this.stepsArray.length > 1) {
      this.stepsArray.removeAt(index);
      this.stepImagePreviews.splice(index, 1);
    }
  }

  // 图片相关方法
  onMainImageSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length) {
      const file = inputElement.files[0];
      this.uploadMainImage(file);
    }
  }

  uploadMainImage(file: File): void {
    this.isUploadingImage = true;
    this.imageUploadError = null;
    
    this.imageService.uploadImage(file).subscribe({
      next: (response: ExtendedImageUploadResponse) => {
        this.recipeForm.patchValue({
          main_image_id: response.id
        });
        
        // 创建可访问的URL
        this.mainImagePreview = this.imageService.getImageDirectUrl(response.id);
        this.isUploadingImage = false;
      },
      error: (error) => {
        console.error('上传图片失败', error);
        this.imageUploadError = '上传图片失败，请稍后再试';
        this.isUploadingImage = false;
      }
    });
  }

  removeMainImage(): void {
    this.recipeForm.patchValue({
      main_image_id: ''
    });
    this.mainImagePreview = null;
  }

  onStepImageSelected(event: Event, index: number): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length) {
      const file = inputElement.files[0];
      this.uploadStepImage(file, index);
    }
  }

  uploadStepImage(file: File, index: number): void {
    this.isUploadingImage = true;
    this.imageUploadError = null;
    
    this.imageService.uploadImage(file).subscribe({
      next: (response: ExtendedImageUploadResponse) => {
        const stepControl = this.stepsArray.at(index) as FormGroup;
        stepControl.patchValue({
          image_id: response.id
        });
        
        // 创建可访问的URL
        this.stepImagePreviews[index] = this.imageService.getImageDirectUrl(response.id);
        this.isUploadingImage = false;
      },
      error: (error) => {
        console.error('上传图片失败', error);
        this.imageUploadError = '上传图片失败，请稍后再试';
        this.isUploadingImage = false;
      }
    });
  }

  removeStepImage(index: number): void {
    const stepControl = this.stepsArray.at(index) as FormGroup;
    stepControl.patchValue({
      image_id: ''
    });
    this.stepImagePreviews[index] = null;
  }

  // AI 相关方法
  openAiImageSelector(): void {
    document.getElementById('ai-image-input')?.click();
  }

  onAiImageSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length) {
      const file = inputElement.files[0];
      this.uploadAndAnalyzeImage(file);
    }
  }

  uploadAndAnalyzeImage(file: File): void {
    this.isAnalyzingImage = true;
    
    this.imageService.uploadAndIdentifyIngredients(file).subscribe({
      next: (response) => {
        this.isAnalyzingImage = false;
        if (response.ai_tags) {
          this.processIngredientsFromAiTags(response.ai_tags);
        } else if (response.id) {
          this.identifyIngredientsFromImage(response.id);
        } else {
          this.notificationService.error('无法识别食材，请手动添加');
        }
      },
      error: (error) => {
        console.error('上传或分析图片失败', error);
        this.isAnalyzingImage = false;
        this.notificationService.error('上传或分析图片失败，请手动添加食材');
      }
    });
  }

  identifyIngredientsFromImage(imageId: string): void {
    this.isAnalyzingImage = true;
    this.imageService.identifyIngredients(imageId).subscribe({
      next: (response) => {
        this.isAnalyzingImage = false;
        if (response.ai_tags) {
          this.processIngredientsFromAiTags(response.ai_tags);
        } else {
          this.notificationService.error('无法识别食材，请手动添加');
        }
      },
      error: (error) => {
        console.error('识别食材失败', error);
        this.isAnalyzingImage = false;
        this.notificationService.error('识别食材失败，请手动添加');
      }
    });
  }

  processIngredientsFromAiTags(aiTags: any): void {
    let ingredients = [];
    
    // 处理新版API返回的格式
    if (aiTags.ingredients && Array.isArray(aiTags.ingredients)) {
      ingredients = aiTags.ingredients;
    } 
    // 处理旧版API返回的格式
    else if (typeof aiTags === 'object') {
      // 尝试找到ingredients键
      const keys = Object.keys(aiTags);
      for (const key of keys) {
        if (key.toLowerCase() === 'ingredients' && Array.isArray(aiTags[key])) {
          ingredients = aiTags[key];
          break;
        }
      }
      
      // 如果没有找到特定的键，尝试查找任何包含食材列表的数组
      if (ingredients.length === 0) {
        for (const key of keys) {
          if (Array.isArray(aiTags[key]) && aiTags[key].length > 0 && 
              (typeof aiTags[key][0] === 'string' || 
               (typeof aiTags[key][0] === 'object' && aiTags[key][0].name))) {
            ingredients = aiTags[key];
            break;
          }
        }
      }
    }
    
    if (ingredients.length === 0) {
      this.notificationService.warning('未能识别到任何食材，请手动添加');
      return;
    }
    
    // 清空现有食材（如果只有一个空白行）
    if (this.ingredientsArray.length === 1 && 
        !this.ingredientsArray.at(0).get('name')?.value) {
      this.ingredientsArray.clear();
    }
    
    // 添加识别出的食材
    ingredients.forEach((ingredient: any) => {
      let name = '';
      if (typeof ingredient === 'string') {
        name = ingredient;
      } else if (ingredient.name) {
        name = ingredient.name;
      }
      
      if (name) {
        this.ingredientsArray.push(this.fb.group({
          name: [name, [Validators.required]],
          amount: ['适量', [Validators.required]],
          unit: ['']
        }));
      }
    });
    
    this.notificationService.success(`成功识别并添加了 ${ingredients.length} 种食材`);
  }

  // 表单提交
  onSubmit(): void {
    if (this.recipeForm.invalid) {
      // 标记所有表单控件为touched以显示验证错误
      Object.keys(this.recipeForm.controls).forEach(key => {
        const control = this.recipeForm.get(key);
        control?.markAsTouched();
      });
      
      // 标记所有食材和步骤为touched
      this.ingredientsArray.controls.forEach(control => {
        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach(key => {
            control.get(key)?.markAsTouched();
          });
        }
      });
      
      this.stepsArray.controls.forEach(control => {
        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach(key => {
            control.get(key)?.markAsTouched();
          });
        }
      });
      
      this.notificationService.error('请完善表单信息');
      return;
    }
    
    this.isSubmitting = true;
    
    // 准备数据
    const formData = this.recipeForm.value;
    
    // 处理标签
    const tags = formData.tags ? 
      formData.tags.split(/[,\s]+/).map((tag: string) => tag.trim()).filter((tag: string) => tag) : 
      [];
    
    // 创建更新数据
    const recipeData = {
      title: formData.title,
      description: formData.description,
      cooking_time: formData.cooking_time,
      difficulty: formData.difficulty,
      servings: formData.servings,
      main_image_id: formData.main_image_id || null,
      ingredients: formData.ingredients,
      steps: formData.steps.map((step: any) => ({
        description: step.description,
        image_id: step.image_id || null
      })),
      tags: tags
    };
    
    // 发送更新请求
    this.recipeService.updateRecipe(+this.recipeId!, recipeData).subscribe({
      next: (updatedRecipe) => {
        this.isSubmitting = false;
        this.notificationService.success('菜谱更新成功');
        this.router.navigate(['/recipes', updatedRecipe.id]);
      },
      error: (error) => {
        console.error('更新菜谱失败', error);
        this.isSubmitting = false;
        this.notificationService.error('更新菜谱失败，请稍后再试');
      }
    });
  }

  // 导航方法
  goBack(): void {
    if (this.recipeId) {
      this.router.navigate(['/recipes', this.recipeId]);
    } else {
      this.router.navigate(['/recipes']);
    }
  }

  goToList(): void {
    this.router.navigate(['/recipes']);
  }

  // 添加辅助方法触发主图片输入点击
  triggerMainImageInput(): void {
    document.getElementById('main-image-input')?.click();
  }

  // 添加辅助方法触发步骤图片输入点击
  triggerStepImageInput(index: number): void {
    document.getElementById(`step-image-input-${index}`)?.click();
  }
} 