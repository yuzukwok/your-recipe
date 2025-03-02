import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          if (Array.isArray(params[key])) {
            params[key].forEach((value: any) => {
              httpParams = httpParams.append(key, value);
            });
          } else {
            httpParams = httpParams.set(key, params[key]);
          }
        }
      });
    }
    
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, { params: httpParams }).pipe(
      catchError(error => {
        console.error(`GET请求错误 ${this.apiUrl}/${endpoint}:`, error);
        return throwError(() => error);
      })
    );
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, data).pipe(
      catchError(error => {
        console.error(`POST请求错误 ${this.apiUrl}/${endpoint}:`, error);
        return throwError(() => error);
      })
    );
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, data).pipe(
      catchError(error => {
        console.error(`PUT请求错误 ${this.apiUrl}/${endpoint}:`, error);
        return throwError(() => error);
      })
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`).pipe(
      catchError(error => {
        console.error(`DELETE请求错误 ${this.apiUrl}/${endpoint}:`, error);
        return throwError(() => error);
      })
    );
  }

  upload<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, formData).pipe(
      catchError(error => {
        console.error(`上传请求错误 ${this.apiUrl}/${endpoint}:`, error);
        return throwError(() => error);
      })
    );
  }
} 