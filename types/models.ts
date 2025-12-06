// types/models.ts
export type UUID = string;

export interface UserProfile {
  user_id: UUID;
  name: string | null;
  email: string;
  bio?: string | null;
  profile_pic?: string | null;
  join_date?: string | null;
  role?: 'user' | 'admin';
}

export interface RecipeStep {
  step_number: number;
  instruction: string;
  media_url?: string | null;
  duration_seconds?: number | null;
  tip?: string | null;
}

export interface Recipe {
  recipe_id: number;
  user_id: UUID;
  title: string;
  ingredients: string; // you can store JSON string or plain text
  instructions: string; // full text or JSON
  category?: string | null;
  image_url?: string | null;
  ai_generated?: boolean;
  created_at?: string | null;
  like_count?: number;
  total_views?: number;
}

export interface Like {
  like_id: number;
  user_id: UUID;
  recipe_id: number;
  created_at?: string | null;
}

export interface Save {
  save_id: number;
  user_id: UUID;
  recipe_id: number;
  created_at?: string | null;
}

export interface AIRequest {
  request_id: number;
  user_id?: UUID | null;
  input_ingredients: string;
  ai_response?: string;
  created_at?: string | null;
}

export interface View {
  id: number;
  recipe_id: number;
  user_id?: UUID | null;
  viewed_at?: string | null;
}

export interface UserStats {
  user_id: UUID;
  total_recipes?: number;
  total_likes_received?: number;
  profile_views?: number;
  rank_score?: number;
}
