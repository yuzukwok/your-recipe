import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isSubmitting = false;
  error: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // 如果用户已登录，重定向到首页
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  // 自定义验证器：确保密码和确认密码匹配
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    const userData = {
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };

    this.authService.register(userData).subscribe({
      next: () => {
        this.isSubmitting = false;
        // 注册成功后，使用相同的凭据自动登录
        this.authService.login({
          username: userData.username,
          password: userData.password
        }).subscribe({
          next: () => {
            this.router.navigate(['/']);
          },
          error: (err) => {
            console.error('自动登录失败', err);
            this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
          }
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('注册失败', err);
        if (err.status === 409) {
          this.error = '用户名或邮箱已被使用，请尝试其他用户名或邮箱';
        } else {
          this.error = '注册失败，请稍后再试';
        }
      }
    });
  }
} 