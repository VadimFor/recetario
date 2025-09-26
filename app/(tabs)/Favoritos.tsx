import RecipeList from "@/components/RecipeList";
import { useAuthStore } from "@/███ＳＴＯＲＥ████/auth_Store";
import { useRecipeStore } from "@/███ＳＴＯＲＥ████/recipe_Store";
import * as NavigationBar from "expo-navigation-bar";
import { Bookmark, Heart } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import PagerView from "react-native-pager-view";

const Favoritos = () => {
  const { user } = useAuthStore();
  const { fetchAllRecipes, fetchUserLikedRecipes } = useRecipeStore();

  const [page, setPage] = useState(0); // 0 = Liked, 1 = Bookmarked
  const pagerRef = useRef<PagerView>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      NavigationBar.setVisibilityAsync("hidden");
      if (!cancelled && user?.id) {
        //await fetchAllRecipes();
        //await fetchUserLikedRecipes(String(user.id));
        //await fetchUserBookmarkedRecipes(String(user.id));
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (!user?.id) {
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

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-red-500 pt-10 px-5 pb-4">
        <Text className="text-white text-3xl font-bold">Favoritos</Text>
      </View>
      {/* Buttons Bar */}
      <View className="relative flex-row bg-white shadow-sm">
        <TouchableOpacity
          onPress={() => pagerRef.current?.setPage(0)}
          className="w-1/2 py-3 flex-row justify-center items-center"
        >
          <Heart
            size={20}
            color={page === 0 ? "black" : "gray"}
            fill={page === 0 ? "red" : "none"}
          />
          <Text
            className={`ml-2 text-xl ${page === 0 ? "text-red-500" : "text-gray-700"}`}
          >
            Liked
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => pagerRef.current?.setPage(1)}
          className="w-1/2 py-3 flex-row justify-center items-center"
        >
          <Bookmark
            size={20}
            color={page === 1 ? "black" : "gray"}
            fill={page === 1 ? "blue" : "none"}
          />
          <Text
            className={`ml-2 text-xl ${page === 1 ? "text-red-500" : "text-gray-700"}`}
          >
            Bookmarked
          </Text>
        </TouchableOpacity>

        {/* Underline */}
        <View
          className="absolute bottom-0 h-0.5 bg-red-500"
          style={{
            width: "50%",
            left: `${page * 50}%`,
          }}
        />
      </View>

      {/* Pager View */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        {/* Page 1: Liked Recipes */}
        <View key="1" className="flex-1">
          <RecipeList
            filter={(recipe) => recipe.red_hearth}
            isFavTab={true}
            recipes={[]}
          />
        </View>

        {/* Page 2: Bookmarked Recipes */}
        <View key="2" className="flex-1">
          <RecipeList
            filter={(recipe) => recipe.bookmarked}
            isFavTab={true}
            recipes={[]}
          />
        </View>
      </PagerView>
    </View>
  );
};

export default Favoritos;
