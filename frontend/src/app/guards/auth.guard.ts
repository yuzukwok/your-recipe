import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const isLoggedIn = this.authService.isLoggedIn();
    
    if (!isLoggedIn) {
      console.log('用户未登录，重定向到登录页面');
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
    
    return true;
  }
} 