import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import {
  HomeComponent,
  LoginComponent,
  RecipeCreateComponent,
  RecipeDetailComponent,
  RecipeListComponent,
  RegisterComponent,
  CookingRecordCreateComponent,
  CookingRecordListComponent,
  RecipeEditComponent
} from './pages';
import { ProfileComponent } from './pages/profile/profile.component';

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