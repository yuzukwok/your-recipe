export interface CookingRecord {
  id?: number;
  recipe_id: number;
  user_id?: number;
  rating?: number;
  notes?: string;
  images?: string[];
  actual_time?: number; // 实际烹饪时间（分钟）
  created_at?: string;
  recipe_title?: string;
  user_username?: string;
}

export interface CookingRecordCreate {
  recipe_id: number;
  rating?: number;
  notes?: string;
  images?: string[];
  actual_time?: number; // 实际烹饪时间（分钟）
}

export interface CookingRecordUpdate {
  rating?: number;
  notes?: string;
  images?: string[];
  actual_time?: number; // 实际烹饪时间（分钟）
} 