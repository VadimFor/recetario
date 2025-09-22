
import { RecipeImageKey } from "@/assets/recipeImages";


export type RecipeImage = {
  image_id: number;
  url: RecipeImageKey;
  created_at: string;
};

export type Recipe = {
  id: string;
  title: string;
  likes: number;
  comments: number;
  shares: number;
  red_hearth: boolean;
  user_id: string;
  username: string;
  user_avatar: string
  recipe_images: RecipeImage[]; 
};

export type User = {
  id: string;
  username: string;
  email: string;
  created_at: string;
  role?: string; 
  avatar?: string;
}