import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Recipe, Recommendation } from '../models';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private endpoint = 'recommendations';

  constructor(private apiService: ApiService) { }

  getRecommendations(limit: number = 5): Observable<Recommendation[]> {
    return this.apiService.get<Recommendation[]>(this.endpoint, { limit });
  }

  getSeasonalRecommendations(season?: string, limit: number = 5): Observable<Recipe[]> {
    const params: any = { limit };
    if (season) params.season = season;
    return this.apiService.get<Recipe[]>(`${this.endpoint}/seasonal`, params);
  }
} 