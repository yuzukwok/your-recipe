import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { RecommendationsComponent } from './recommendations.component';
import { PersonalizedComponent } from './components/personalized/personalized.component';
import { SeasonalComponent } from './components/seasonal/seasonal.component';
import { DietAnalysisComponent } from './components/diet-analysis/diet-analysis.component';
import { NutritionAlternativesComponent } from './components/nutrition-alternatives/nutrition-alternatives.component';
import { RecipeFusionComponent } from './components/recipe-fusion/recipe-fusion.component';
import { CommunityTrendingComponent } from './components/community-trending/community-trending.component';

const routes: Routes = [
  {
    path: '',
    component: RecommendationsComponent
  }
];

@NgModule({
  declarations: [
    RecommendationsComponent,
    PersonalizedComponent,
    SeasonalComponent,
    DietAnalysisComponent,
    NutritionAlternativesComponent,
    RecipeFusionComponent,
    CommunityTrendingComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class RecommendationsModule { } 