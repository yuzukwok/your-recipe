import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Recipe, RecipeCreate, RecipeUpdate } from '../models';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private endpoint = 'recipes/';

  constructor(private apiService: ApiService) { }

  getRecipes(params?: any): Observable<Recipe[]> {
    return this.apiService.get<Recipe[]>(this.endpoint, params);
  }

  getRecipe(id: number): Observable<Recipe> {
    return this.apiService.get<Recipe>(`${this.endpoint}/${id}`);
  }

  createRecipe(recipe: RecipeCreate): Observable<Recipe> {
    // console.log('RecipeService.createRecipe() 被调用，数据:', recipe);
    return this.apiService.post<Recipe>(this.endpoint, recipe)
      .pipe(
        tap(
          (result) => {/* console.log('创建菜谱成功，服务器返回:', result) */},
          (error) => console.error('创建菜谱失败，错误:', error)
        )
      );
  }

  updateRecipe(id: number, recipe: RecipeUpdate): Observable<Recipe> {
    return this.apiService.put<Recipe>(`${this.endpoint}/${id}`, recipe);
  }

  deleteRecipe(id: number): Observable<Recipe> {
    return this.apiService.delete<Recipe>(`${this.endpoint}/${id}`);
  }

  getUserRecipes(userId: number, params?: any): Observable<Recipe[]> {
    return this.apiService.get<Recipe[]>(`${this.endpoint}/user/${userId}`, params);
  }

  getPopularRecipes(limit: number = 10): Observable<Recipe[]> {
    return this.apiService.get<Recipe[]>(`${this.endpoint}/popular`, { limit });
  }

  searchRecipes(title?: string, tags?: string[]): Observable<Recipe[]> {
    const params: any = {};
    if (title) params.title = title;
    if (tags) params.tags = tags;
    return this.apiService.get<Recipe[]>(this.endpoint, params);
  }
  
  // 获取所有标签（按使用频率排序）
  getAllTags(): Observable<string[]> {
    return this.apiService.get<{tag: string, count: number}[]>(`${this.endpoint}/tags`).pipe(
      map(tagsWithCount => tagsWithCount.map(item => item.tag))
    );
  }
} 