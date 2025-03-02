import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private apiUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  private userKey = 'current_user';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // 初始化时尝试从localStorage恢复用户信息
    this.loadUserFromStorage();
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    const url = `${this.apiUrl}/auth/login`;
    
    return this.http.post<any>(url, credentials).pipe(
      tap(response => {
        if (response && response.access_token) {
          // 保存token
          localStorage.setItem(this.tokenKey, response.access_token);
          // 获取用户信息
          this.fetchCurrentUser().subscribe();
        }
      }),
      catchError(error => {
        console.error('登录失败:', error);
        return throwError(() => error);
      })
    );
  }

  private fetchCurrentUser(): Observable<User> {
    const url = `${this.apiUrl}/users/me`;
    
    return this.http.get<User>(url).pipe(
      tap(user => {
        if (user) {
          // 存储用户信息
          this.storeUser(user);
        }
      }),
      catchError(error => {
        console.error('获取用户信息失败:', error);
        return throwError(() => error);
      })
    );
  }

  getCurrentUser(): User | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    
    // 尝试从storage获取
    const userJson = localStorage.getItem(this.userKey);
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        return user;
      } catch (e) {
        console.error('用户信息解析错误:', e);
      }
    }
    
    return null;
  }

  private loadUserFromStorage() {
    const user = this.getCurrentUser();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  private storeUser(user: User) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  logout(): void {
    // 清除本地存储的用户信息和token
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    
    // 更新当前用户状态
    this.currentUserSubject.next(null);
    
    // 导航到登录页
    this.router.navigate(['/login']);
  }

  register(userData: any): Observable<any> {
    const url = `${this.apiUrl}/auth/register`;
    
    return this.http.post<any>(url, userData).pipe(
      catchError(error => {
        console.error('注册失败:', error);
        return throwError(() => error);
      })
    );
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
} 