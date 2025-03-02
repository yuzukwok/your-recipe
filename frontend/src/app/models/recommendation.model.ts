export interface Recommendation {
  id?: number;
  title: string;
  description?: string;
  difficulty?: number;
  cooking_time?: number;
  tags?: string[];
  recommendation_reason?: string;
} 