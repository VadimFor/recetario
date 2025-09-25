import RecipeList from "@/components/RecipeList";
import { useAuthStore } from "@/███ＳＴＯＲＥ████/auth_Store";
import { useRecipeStore } from "@/███ＳＴＯＲＥ████/recipe_Store";
import * as NavigationBar from "expo-navigation-bar";
import React, { useEffect } from "react";
import { Text, View } from "react-native";

export default function Index() {
  const { user, isLoading } = useAuthStore();
  const { fetchAllRecipes, fetchUserLikedRecipes, fetchUserBookmarkedRecipes } =
    useRecipeStore();

  //█░█ █▀ █▀▀ █▀▀ █▀▀ █▀▀ █▀▀ █▀▀ ▀█▀
  //█▄█ ▄█ ██▄ ██▄ █▀░ █▀░ ██▄ █▄▄ ░█░
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      NavigationBar.setVisibilityAsync("hidden");

      if (user?.id && !isLoading) {
        try {
          // await fetchAuthenticatedUser("1");
        } catch (error) {
          console.log("Error during fetchAuthenticatedUser in Home:", error);
        }
      }

      if (!cancelled) {
        try {
          await fetchAllRecipes();
          // await fetchUserLikedRecipes(String(user.id));
        } catch (error) {
          console.log(
            "Error during fetchAllRecipes or fetchUserLikedRecipes in Home: ",
            error
          );
        }
      }
    };
    init();

    return () => {
      cancelled = true;
    };
  }, []); // <-- vacío, solo se ejecuta al montar

  useEffect(() => {
    if (!user?.id) return;
    fetchUserLikedRecipes(String(user.id));
    fetchUserBookmarkedRecipes(String(user.id));
    console.log("fetch liked recipes llamado en home.tsx");
  }, [user?.id]);

  //============================================================================================================
  //█▀█ █▀▀ ▀█▀ █░█ █▀█ █▄░█
  //█▀▄ ██▄ ░█░ █▄█ █▀▄ █░▀█
  //============================================================================================================
  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-green-600 pt-10 px-5">
        <Text className="text-white text-3xl font-bold">Recetas</Text>
      </View>
      <RecipeList recipes={[]} />
    </View>
  );
}
