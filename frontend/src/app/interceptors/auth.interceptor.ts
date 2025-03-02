import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private tokenKey = 'auth_token';
  
  constructor(
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // 直接从localStorage获取token，而不是通过authService
    const token = localStorage.getItem(this.tokenKey);
    
    if (token) {
      // 使用标准的Bearer前缀
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401|| error.status === 403) {
          console.error('401/403错误：用户未授权，重定向到登录页面');
          // 自行处理登出逻辑，不再依赖AuthService
          localStorage.removeItem(this.tokenKey);
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
} 