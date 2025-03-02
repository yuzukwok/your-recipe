import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CookingRecord, CookingRecordCreate, CookingRecordUpdate } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CookingRecordService {
  private endpoint = 'cooking-records/';

  constructor(private apiService: ApiService) { }

  getCookingRecords(params?: any): Observable<CookingRecord[]> {
    return this.apiService.get<CookingRecord[]>(this.endpoint, params);
  }

  getCookingRecord(id: number): Observable<CookingRecord> {
    return this.apiService.get<CookingRecord>(`${this.endpoint}/${id}`);
  }

  createCookingRecord(record: CookingRecordCreate): Observable<CookingRecord> {
    return this.apiService.post<CookingRecord>(this.endpoint, record);
  }

  updateCookingRecord(id: number, record: CookingRecordUpdate): Observable<CookingRecord> {
    return this.apiService.put<CookingRecord>(`${this.endpoint}/${id}`, record);
  }

  deleteCookingRecord(id: number): Observable<CookingRecord> {
    return this.apiService.delete<CookingRecord>(`${this.endpoint}/${id}`);
  }

  getRecipeCookingRecords(recipeId: number, params?: any): Observable<CookingRecord[]> {
    return this.apiService.get<CookingRecord[]>(`${this.endpoint}/recipe/${recipeId}`, params);
  }
} 