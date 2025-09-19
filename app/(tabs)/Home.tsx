import RecipeList from "@/components/RecipeList";
import { useAuthStore } from "@/store/authStore";
import { useRecipeStore } from "@/store/recipeStore";
import * as NavigationBar from "expo-navigation-bar";
import React, { useEffect } from "react";
import { Text, View } from "react-native";

export default function Index() {
  const { user, isUserAuthenticated, isLoading } = useAuthStore();
  const { fetchAllRecipes, fetchUserLikedRecipes } = useRecipeStore();

  //█░█ █▀ █▀▀ █▀▀ █▀▀ █▀▀ █▀▀ █▀▀ ▀█▀
  //█▄█ ▄█ ██▄ ██▄ █▀░ █▀░ ██▄ █▄▄ ░█░
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      NavigationBar.setVisibilityAsync("hidden");

      if (!isUserAuthenticated && !isLoading) {
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
      <RecipeList />
    </View>
  );
}
