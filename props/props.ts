
import { RecipeImageKey } from "@/assets/recipeImages";

export type Recipe = {
  id: string;
  title: string;
  image: RecipeImageKey;
  likes: number;
  comments: number;
  shares: number;
  red_hearth: boolean;
  user_id: string;
  username: string;
  user_avatar: string
};

export type User = {
  id: string;
  username: string;
  email: string;
  created_at: string;
  role?: string; 
  avatar?: string;
}