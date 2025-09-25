import { Recipe, RecipeImage } from "@/props/props";
import { useAuthStore } from "@/███ＳＴＯＲＥ████/auth_Store";
import { API_addRecipePictures, API_createRecipe, API_deleteRecipe, API_editRecipe, API_fetchLikedRecipes, API_fetchRecipes, API_fetchUserRecipes, API_likeRecipe, API_unlikeRecipe } from "@/ＡＰＩ_ＣＡＬＬＳ";
import * as ImagePicker from "expo-image-picker";
import { create } from "zustand";

type RecipeStore = {
  //TAB HOME
  recipes: Recipe[];
  user_recipes: Recipe[];
  loading: boolean;
  error: string | null;
  fetchAllRecipes: () => Promise<void>;
  fetchUserLikedRecipes: (userId: string) => Promise<void>;
  toggleLike: (recipeId: string) => Promise<void>;
  fetchUserRecipes: (userId: string) => Promise<void>;
  createRecipe: (title: string, image?: string) => Promise<Recipe | null>;
  deleteRecipe: (id: string) => Promise<void>;
  editRecipe: (recipeId: string, newTitle: string) => Promise<void>;
  clear_user_recipes: () => void;
  addRecipePictures: (recipeId: string, imageUris: string[]) => void;
  pickImagesFromGallery: () => Promise<string[]>
};

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipes: [],
  user_recipes: [],
  loading: false,
  error: null,

  //█▀█ █ █▀▀ █▄▀   █▀▀ ▄▀█ █░░ █░░ █▀▀ █▀█ █▄█   █ █▀▄▀█ ▄▀█ █▀▀ █▀▀
  //█▀▀ █ █▄▄ █░█   █▄█ █▀█ █▄▄ █▄▄ ██▄ █▀▄ ░█░   █ █░▀░█ █▀█ █▄█ ██▄
  pickImagesFromGallery: async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access media is required!");
      return [];
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: true, // ✅ allow multiple images
    });

    if (result.canceled) return [];

    return result.assets.map((asset) => asset.uri);
  },

  //▄▀█ █▀▄ █▀▄   █▀█ █▀▀ █▀▀ █ █▀█ █▀▀   █▀█ █ █▀▀ ▀█▀ █░█ █▀█ █▀▀ █▀
  //█▀█ █▄▀ █▄▀   █▀▄ ██▄ █▄▄ █ █▀▀ ██▄   █▀▀ █ █▄▄ ░█░ █▄█ █▀▄ ██▄ ▄█
  addRecipePictures: async (recipeId: string, imageUris: string[]) => {
    const { user } = useAuthStore.getState();
    if (!user?.id) return;
    const { recipes, user_recipes } = get();

    if (!imageUris.length) return;

    try {
      // ✅ API now accepts an array of URIs and returns an array of URLs
      const uploadedUrls: RecipeImage[] = await API_addRecipePictures(
        imageUris,
        user.id,
        recipeId
      );

      //console.log("Uploaded recipe pictures:", uploadedUrls[0].url);

      // ✅ Update state with all new images
      set({
        recipes: recipes.map((recipe) =>
          recipe.id === recipeId
            ? {
                ...recipe,
                recipe_images: [...recipe.recipe_images, ...uploadedUrls],
              }
            : recipe
        ),
      });
      set({
        user_recipes: user_recipes.map((recipe) =>
          recipe.id === recipeId
            ? {
                ...recipe,
                recipe_images: [...recipe.recipe_images, ...uploadedUrls],
              }
            : recipe
        ),
      });
    } catch (error) {
      console.error("Recipe picture upload failed:", error);
      alert("Failed to upload recipe pictures.");
    }
  },

  //█▀▀ █░░ █▀▀ ▄▀█ █▀█
  //█▄▄ █▄▄ ██▄ █▀█ █▀▄
  clear_user_recipes: () => {
    const { recipes } = get();
    set({
      user_recipes: [],
      recipes: recipes.map((r) => ({ ...r, red_hearth: false })),
    });
  },

  //█▀█ █▀▀ █▀▀ █▀▀ ▀█▀ ▄▀█ █▀
  //█▀▄ ██▄ █▄▄ ██▄ ░█░ █▀█ ▄█
  fetchAllRecipes: async () => {
    try {
      set({ loading: true, error: null });
      const all_recipes = await API_fetchRecipes();

      set({ recipes: all_recipes, loading: false });
      
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Error fetching recipes", loading: false });
    }
  },

  //█▀█ █▀▀ █▀▀ █▀▀ ▀█▀ ▄▀█ █▀   █▀▀ ▄▀█ █░█ █▀█ █▀█ █ ▀█▀ ▄▀█ █▀
  //█▀▄ ██▄ █▄▄ ██▄ ░█░ █▀█ ▄█   █▀░ █▀█ ▀▄▀ █▄█ █▀▄ █ ░█░ █▀█ ▄█
  fetchUserLikedRecipes: async (userId: string) => {
    try {
      const liked_recipes = await API_fetchLikedRecipes(userId);
      const likedIds = new Set(liked_recipes.map((r: { recipe_id: string }) => r.recipe_id));

    set({
      recipes: get().recipes.map(r => {
        const wasLiked = r.red_hearth; // estado anterior
        const isLikedNow = likedIds.has(r.id);

        //PARA DEBUG
        //if (!wasLiked && isLikedNow) {
        //  console.log(`Receta marcada como favorita (carga inicial): ${r.id} - ${r.title}`);
        //}

        return {
          ...r,
          red_hearth: isLikedNow,
        };
      })
    });
    } catch (err) {
      console.error("Error fetching liked recipes", err);
    }
  },

  //▀█▀ █▀█ █▀▀ █▀▀ █░░ █▀▀   █░░ █ █▄▀ █▀▀
  //░█░ █▄█ █▄█ █▄█ █▄▄ ██▄   █▄▄ █ █░█ ██▄
  toggleLike: async (recipeId: string) => {
    const { recipes } = get();
    const { user } = useAuthStore.getState();
    if (!user?.id) return;

    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const newLiked = !recipe.red_hearth;

    // Update UI optimistically
    set({
      recipes: recipes.map(r =>
        r.id === recipeId
          ? { ...r, red_hearth: newLiked, likes: r.likes + (newLiked ? 1 : -1) }
          : r
      )
    });

    try {
      if (newLiked) {
        await API_likeRecipe(String(user.id), recipeId);
      } else {
        await API_unlikeRecipe(String(user.id), recipeId);
      }
    } catch (err) {
      console.error("Error setting like status", err);
      // rollback
      set({
        recipes: recipes.map(r =>
          r.id === recipeId
            ? { ...r, red_hearth: !newLiked, likes: r.likes + (!newLiked ? 1 : -1) }
            : r
        )
      });
    }
  },

  //█▀█ █▀▀ █▀▀ █▀▀ ▀█▀ ▄▀█ █▀   █▀▄ █▀▀   █░█ █▀ █░█ ▄▀█ █▀█ █ █▀█
  //█▀▄ ██▄ █▄▄ ██▄ ░█░ █▀█ ▄█   █▄▀ ██▄   █▄█ ▄█ █▄█ █▀█ █▀▄ █ █▄█
  fetchUserRecipes: async (userId: string) => {
      try {
      set({ loading: true, error: null });
      const recipes =  await API_fetchUserRecipes(userId);
      set({ user_recipes: recipes, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Error fetching logged user recipes", loading: false });
  }},

  //█▀▀ █▀█ █▀▀ ▄▀█ █▀█   █▀█ █▀▀ █▀▀ █▀▀ ▀█▀ ▄▀█
  //█▄▄ █▀▄ ██▄ █▀█ █▀▄   █▀▄ ██▄ █▄▄ ██▄ ░█░ █▀█
  createRecipe: async (title: string) => {
    const { user } = useAuthStore.getState();
    if (!user?.id) {
      console.error("User not authenticated, cannot create recipe");
      return null;
    }
    try {
      set({ loading: true, error: null });

      const newRecipe : Recipe = await API_createRecipe(title, String(user.id));

      // Re-fetch all recipes to stay consistent
      await get().fetchAllRecipes();
      await get().fetchUserRecipes(String(user.id));
      await get().fetchUserLikedRecipes(String(user.id));

      console.info(`Recipe "${title}" created successfully!`);

      return newRecipe;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error creating recipe",
        loading: false,
      });
      return null;
    }
  },
  
  //█▀▄ █▀▀ █░░ █▀▀ ▀█▀ █▀▀   █▀█ █▀▀ █▀▀ █▀▀ ▀█▀ ▄▀█
  //█▄▀ ██▄ █▄▄ ██▄ ░█░ ██▄   █▀▄ ██▄ █▄▄ ██▄ ░█░ █▀█
  deleteRecipe: async (recipeId: string) => {
    const { user } = useAuthStore.getState();
    if (!user?.id) {
      console.error("User not authenticated, cannot delete recipe");
      return;
    }
    try {
      set({ loading: true, error: null });
      await API_deleteRecipe(recipeId, String(user.id));

      // Re-fetch para actualizar UI
      await get().fetchAllRecipes();
      await get().fetchUserRecipes(String(user.id));
      await get().fetchUserLikedRecipes(String(user.id));

      console.info(`Recipe ${recipeId} deleted successfully!`);
    } catch (err:any) {
      const msg = "Error deleting recipe.";
      console.info(msg); 
      set({ error: msg, loading:false }); // let UI handle it (your popup)
    }
  },
  
  //█▀▀ █▀▄ █ ▀█▀ ▄▀█ █▀█   █▀█ █▀▀ █▀▀ █▀▀ ▀█▀ ▄▀█ 
  //██▄ █▄▀ █ ░█░ █▀█ █▀▄   █▀▄ ██▄ █▄▄ ██▄ ░█░ █▀█
  editRecipe: async (recipeId: string, newTitle: string) => {
    const { user } = useAuthStore.getState();
    if (!user?.id) {
      console.error("User not authenticated, cannot edit recipe");
      return;
    }
    try {
      set({ loading: true, error: null });

      await API_editRecipe(recipeId, String(user.id), newTitle);

      // Re-fetch para mantener consistencia en todas las tabs
      await get().fetchAllRecipes();
      await get().fetchUserRecipes(String(user.id));
      await get().fetchUserLikedRecipes(String(user.id));

      console.info(`Recipe ${recipeId} updated successfully"!`);
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : "Error updating recipe";
      console.error(msg);
      set({ error: msg, loading: false });
    }
  },

}));