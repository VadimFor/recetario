import RecipeList from "@/components/RecipeList";
import { useAuthStore } from "@/███ＳＴＯＲＥ████/auth_Store";
import { useRecipeStore } from "@/███ＳＴＯＲＥ████/recipe_Store";
import * as NavigationBar from "expo-navigation-bar";
import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const Favoritos = () => {
  const { user } = useAuthStore();
  const { fetchAllRecipes, fetchUserLikedRecipes } = useRecipeStore();

  //█░█ █▀ █▀▀ █▀▀ █▀▀ █▀▀ █▀▀ █▀▀ ▀█▀
  //█▄█ ▄█ ██▄ ██▄ █▀░ █▀░ ██▄ █▄▄ ░█░
  useEffect(() => {
    let cancelled = false; //LOADING GUARD: Para que no se cargue doble

    const init = async () => {
      NavigationBar.setVisibilityAsync("hidden");
      if (!cancelled && user?.id) {
        await fetchAllRecipes();
        await fetchUserLikedRecipes(String(user.id));
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  //============================================================================================================
  //█▀█ █▀▀ ▀█▀ █░█ █▀█ █▄░█
  //█▀▄ ██▄ ░█░ █▄█ █▀▄ █░▀█
  //============================================================================================================
  if (!user?.id) {
    //█▄░█ █▀█ ▀█▀   █░░ █▀█ █▀▀ █▀▀ █▀▀ █▀▄   █ █▄░█
    //█░▀█ █▄█ ░█░   █▄▄ █▄█ █▄█ █▄█ ██▄ █▄▀   █ █░▀█
    return (
      <View className="flex-1 justify-center items-center p-5 bg-white">
        <Text className="text-2xl font-bold mb-2.5 text-gray-800 text-center">
          Debes iniciar sesión para ver tus recetas favoritas
        </Text>
        <TouchableOpacity
          onPress={() => {
            console.log("Ir a pantalla de login");
          }}
          className="mt-4 bg-green-500 py-3 px-6 rounded-lg"
        >
          <Text className="text-white text-lg">Iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }
  //█░░ █▀█ █▀▀ █▀▀ █▀▀ █▀▄   █ █▄░█
  //█▄▄ █▄█ █▄█ █▄█ ██▄ █▄▀   █ █░▀█
  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-red-500 pt-10 px-5">
        <Text className="text-white text-3xl font-bold">Favoritos</Text>
      </View>
      <RecipeList
        filter={(recipe) => recipe.red_hearth} // ✅ Only show liked recipes
        isFavTab={true}
        recipes={[]}
      />
    </View>
  );
};

export default Favoritos;
