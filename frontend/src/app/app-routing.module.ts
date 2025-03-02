import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import {
  HomeComponent,
  LoginComponent,
  RecipeCreateComponent,
  RecipeListComponent,
  RegisterComponent,
  CookingRecordCreateComponent,
  RecipeEditComponent,
  ProfileComponent,
} from './pages';

// 导入独立组件
import { RecipeDetailComponent } from './pages/recipe-detail/recipe-detail.component';
import { CookingRecordListComponent } from './pages/cooking-record-list/cooking-record-list.component';
import { CookingRecordDetailComponent } from './pages/cooking-record-detail/cooking-record-detail.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { 
    path: 'recipes',
    children: [
      { path: '', component: RecipeListComponent },
      { path: 'create', component: RecipeCreateComponent, canActivate: [AuthGuard] },
      { path: ':id', component: RecipeDetailComponent },
      { path: ':id/edit', component: RecipeEditComponent, canActivate: [AuthGuard] },
    ] 
  },
  { 
    path: 'cooking-records',
    children: [
      { path: '', component: CookingRecordListComponent },
      { path: 'create', component: CookingRecordCreateComponent, canActivate: [AuthGuard] },
      { path: ':id', component: CookingRecordDetailComponent },
    ] 
  },
  {
    path: 'recommendations',
    loadChildren: () => import('./pages/recommendations/recommendations.module').then(m => m.RecommendationsModule)
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 