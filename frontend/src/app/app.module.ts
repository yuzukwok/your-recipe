import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServiceWorkerModule } from '@angular/service-worker';

import { environment } from '../environments/environment';

// 路由模块
import { AppRoutingModule } from './app-routing.module';

// 组件
import { AppComponent } from './app.component';
import { HeaderComponent, FooterComponent, RecipeCardComponent } from './components';
import { HomeComponent, LoginComponent, RegisterComponent, RecipeCreateComponent, RecipeListComponent, RecipeEditComponent, CookingRecordCreateComponent } from './pages';
import { ProfileComponent } from './pages/profile/profile.component';

// 拦截器
import { AuthInterceptor } from './interceptors/auth.interceptor';
// 路由守卫
import { AuthGuard } from './guards/auth.guard';

import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    RecipeCardComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    RecipeCreateComponent,
    RecipeListComponent,
    RecipeEditComponent,
    CookingRecordCreateComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    }),
    SharedModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { } 