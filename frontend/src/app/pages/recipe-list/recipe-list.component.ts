import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Recipe } from '../../models';
import { RecipeService } from '../../services';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent implements OnInit {
  recipes: Recipe[] = [];
  filteredRecipes: Recipe[] = [];
  isLoading = true;
  error: string | null = null;
  
  // 搜索和筛选参数
  searchTerm = '';
  selectedTags: string[] = [];
  availableTags: string[] = [];
  
  // 分页相关
  currentPage = 1;
  itemsPerPage = 12;
  totalItems = 0;

  constructor(
    private recipeService: RecipeService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadRecipes();
    this.loadAllTags();
  }

  // 加载所有菜谱以获取标签
  loadAllTags(): void {
    this.recipeService.getRecipes().subscribe({
      next: (recipes) => {
        // 提取所有可用标签
        this.extractAvailableTags(recipes);
      },
      error: (err) => {
        console.error('获取标签失败', err);
      }
    });
  }

  // 根据筛选条件加载菜谱
  loadRecipes(): void {
    this.isLoading = true;
    this.error = null;
    
    this.recipeService.getRecipes().subscribe({
      next: (recipes) => {
        this.recipes = recipes;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = '获取菜谱失败，请稍后再试';
        this.isLoading = false;
        console.error('获取菜谱失败', err);
      }
    });
  }

  // 应用搜索和标签筛选
  applyFilters(): void {
    this.filteredRecipes = this.recipes.filter(recipe => {
      // 搜索词筛选
      const matchesSearch = !this.searchTerm || 
                           recipe.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           (recipe.description && recipe.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
                           
      // 标签筛选
      const matchesTags = this.selectedTags.length === 0 || 
                         (recipe.tags && Array.isArray(recipe.tags) && this.selectedTags.every(tag => recipe.tags!.includes(tag)));
                         
      return matchesSearch && matchesTags;
    });
    
    this.totalItems = this.filteredRecipes.length;
  }

  extractAvailableTags(recipes: Recipe[]): void {
    const tagsSet = new Set<string>();
    
    recipes.forEach(recipe => {
      if (recipe.tags && recipe.tags.length > 0) {
        recipe.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    
    this.availableTags = Array.from(tagsSet).sort();
  }

  onSearch(): void {
    // 检查搜索词是否包含标签（用逗号或空格分隔）
    this.processSearchTermForTags();
    
    this.applyFilters();
    this.currentPage = 1;
  }

  /**
   * 处理语音搜索输入
   */
  onVoiceSearch(term: string): void {
    this.searchTerm = term;
    
    // 确保变更检测，更新视图
    this.cdr.detectChanges();
    
    // 检查语音输入是否包含标签（用逗号或空格分隔）
    this.processSearchTermForTags();
    
    // 语音搜索后自动执行搜索，无需用户再点击搜索按钮
    this.applyFilters();
    this.currentPage = 1;
  }

  /**
   * 处理搜索词中的标签
   * 支持通过逗号或空格分隔多个标签
   */
  private processSearchTermForTags(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      return;
    }

    // 同时支持逗号和空格作为分隔符
    // 先用逗号分隔，然后对每个部分再用空格分隔
    const parts = this.searchTerm.split(',');
    let potentialTags: string[] = [];
    
    parts.forEach(part => {
      // 处理每个逗号分隔的部分
      const trimmedPart = part.trim();
      if (trimmedPart) {
        // 如果包含空格，则进一步分割
        if (trimmedPart.includes(' ')) {
          const spaceParts = trimmedPart.split(' ').filter(p => p.trim() !== '');
          potentialTags.push(...spaceParts);
        } else {
          potentialTags.push(trimmedPart);
        }
      }
    });
    
    // 如果只有一个可能的标签，当作普通搜索词处理
    if (potentialTags.length <= 1) {
      return;
    }
    
    // 处理找到的潜在标签
    let tagsFound = false;
    const newSelectedTags: string[] = [];
    
    potentialTags.forEach(tag => {
      // 检查是否匹配现有标签
      const matchingTags = this.availableTags.filter(
        availableTag => availableTag.toLowerCase() === tag.toLowerCase()
      );
      
      if (matchingTags.length > 0) {
        tagsFound = true;
        // 使用精确的标签名称（保持原始大小写）
        if (!this.selectedTags.includes(matchingTags[0])) {
          newSelectedTags.push(matchingTags[0]);
        }
      }
    });
    
    // 如果找到标签，更新选中标签并清空搜索词
    if (tagsFound) {
      // 将新标签添加到已选标签中（避免重复）
      this.selectedTags = [...this.selectedTags, ...newSelectedTags.filter(tag => !this.selectedTags.includes(tag))];
      
      // 清空搜索框
      this.searchTerm = '';
    }
  }

  onTagSelect(tag: string): void {
    if (this.selectedTags.includes(tag)) {
      this.selectedTags = this.selectedTags.filter(t => t !== tag);
    } else {
      this.selectedTags.push(tag);
    }
    
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedTags = [];
    this.currentPage = 1;
    this.applyFilters();
  }

  get paginatedRecipes(): Recipe[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRecipes.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
} 