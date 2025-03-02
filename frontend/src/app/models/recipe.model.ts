export interface Ingredient {
  name: string;
  amount: string;
  unit?: string;
}

export interface Step {
  order: number;
  description: string;
  image?: string;
  image_id?: string;
}

export interface Recipe {
  id?: number;
  title: string;
  description?: string;
  difficulty?: number;
  cooking_time?: number;
  servings?: number;
  main_image_id?: string;
  main_image_url?: string;
  image_url?: string;
  ingredients?: Ingredient[];
  steps?: Step[];
  tags?: string[];
  user_id?: number;
  user_username?: string;
  created_at?: string;
  updated_at?: string;
  likes_count?: number;
}

export interface RecipeCreate {
  title: string;
  description?: string;
  difficulty?: number;
  cooking_time?: number;
  servings?: number;
  ingredients?: Ingredient[];
  steps?: Step[];
  tags?: string[];
}

export interface RecipeUpdate {
  title?: string;
  description?: string;
  difficulty?: number;
  cooking_time?: number;
  servings?: number;
  ingredients?: Ingredient[];
  steps?: Step[];
  tags?: string[];
} 