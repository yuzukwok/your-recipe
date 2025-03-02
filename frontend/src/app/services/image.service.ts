import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Image, ImageUploadResponse } from '../models';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private endpoint = 'images';

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) { }

  uploadImage(file: File, analyze: boolean = false): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('analyze', analyze.toString());
    
    // 使用apiService的upload方法，该方法会通过拦截器添加token
    return this.apiService.upload<ImageUploadResponse>(`${this.endpoint}/upload`, formData);
  }

  getImage(id: string): Observable<Image> {
    return this.apiService.get<Image>(`${this.endpoint}/${id}`);
  }

  getImageUrl(id: string, expires: number = 3600): Observable<{ url: string }> {
    return this.apiService.get<{ url: string }>(`${this.endpoint}/${id}/url`, { expires });
  }

  getImageDirectUrl(id: string): string {
    // 返回后端API直接下载图片的URL，添加token确保身份验证
    const token = this.authService.getToken();
    return `${environment.apiUrl}/${this.endpoint}/${id}/download${token ? `?token=${token}` : ''}`;
  }

  deleteImage(id: string): Observable<Image> {
    return this.apiService.delete<Image>(`${this.endpoint}/${id}`);
  }

  analyzeImage(id: string): Observable<any> {
    return this.apiService.post<any>(`${this.endpoint}/${id}/analyze`, {});
  }

  identifyIngredients(id: string): Observable<any> {
    return this.apiService.post<any>(`${this.endpoint}/${id}/identify-ingredients`, {});
  }

  uploadAndIdentifyIngredients(file: File): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    // 使用apiService的upload方法，该方法会通过拦截器添加token
    return this.apiService.upload<ImageUploadResponse>(`${this.endpoint}/upload-and-identify`, formData);
  }
}