import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { FilePipe } from './file.pipe';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ThreeHeroEffectComponent } from './three-hero-effect/three-hero-effect.component';
import { FoodSpinnerComponent } from './food-spinner/food-spinner.component';
import { RecipeJourneyComponent } from './recipe-journey/recipe-journey.component';
import { VoiceSearchComponent } from './voice-search/voice-search.component';

@NgModule({
  declarations: [
    FilePipe,
    ConfirmDialogComponent,
    ThreeHeroEffectComponent,
    FoodSpinnerComponent,
    RecipeJourneyComponent,
    VoiceSearchComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule
  ],
  exports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    FilePipe,
    ConfirmDialogComponent,
    ThreeHeroEffectComponent,
    FoodSpinnerComponent,
    RecipeJourneyComponent,
    VoiceSearchComponent
  ]
})
export class SharedModule { } 