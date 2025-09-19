/* 
PARA LA PESTAÑA DE "HOME" Y "FAVORITOS"
*/

import { Recipe } from "@/props/props";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
  View,
} from "react-native";

import { useRecipeStore } from "@/store/recipeStore";
import RecipeCard_FAV from "./RecipeCard_FAV";
import RecipeCard_HOME_SOCIAL from "./RecipeCard_HOME_SOCIAL";
import SearchBar from "./SearchBar";

interface RecipeListProps {
  recipes: Recipe[];
  loading?: boolean;
  error?: string;
  filter?: (recipe: Recipe) => boolean;
  title?: string;
}

type tabcheck = {
  //recipelist se usa en 2 tabs diferentes (home y favoritos), por lo que asi sé cual de ambos
  isFavTab?: boolean;
};

export default function RecipeList({
  filter,
  isFavTab = false,
}: RecipeListProps & tabcheck) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { recipes, loading, error } = useRecipeStore();

  //█▀ █▀▀ ▄▀█ █▀█ █▀▀ █░█   █▀▄ █▀▀ █▄▄ █▀█ █░█ █▄░█ █▀▀ █▀▀
  //▄█ ██▄ █▀█ █▀▄ █▄▄ █▀█   █▄▀ ██▄ █▄█ █▄█ █▄█ █░▀█ █▄▄ ██▄
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 150); //Si cambia el valor de use_searchTerm, se cancela este timeout y se va al return

    //Este return no se ejecutará si se ejecuta el timeout ya que al actualizar use_debouncedSearch el componente
    //se vuelve a cargar y no entrará más en este useEffect.
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  //█▀▀ █ █░░ ▀█▀ █▀█ ▄▀█ █▀█   █▀█ █▀▀ █▀▀ █▀▀ ▀█▀ ▄▀█ █▀   █▀▄ █▀▀ █░░   █▀ █▀▀ ▄▀█ █▀█ █▀▀ █░█
  //█▀░ █ █▄▄ ░█░ █▀▄ █▀█ █▀▄   █▀▄ ██▄ █▄▄ ██▄ ░█░ █▀█ ▄█   █▄▀ ██▄ █▄▄   ▄█ ██▄ █▀█ █▀▄ █▄▄ █▀█
  // Filter recipes based on search term. Si use_searchTerm is empty, it will show all recipes.
  // ejemplos-> ["hello".includes("") // true] ["".includes("") // true ]
  const filteredRecipes = recipes
    // FILTRO RECETAS SEGUN EL FILTRO CUSTOM (solo favoritos,etc)
    .filter((r) => (filter ? filter(r) : true)) //si existe filtro entonces se aplica, sino se pasa true (es decir, con true no filtra)
    // LUEGO, FILTRO RECETAS SEGUN EL SEARCH BAR
    .filter((r) =>
      r.title.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  //============================================================================================================
  //█▀█ █▀▀ ▀█▀ █░█ █▀█ █▄░█
  //█▀▄ ██▄ ░█░ █▄█ █▀▄ █░▀█
  //============================================================================================================
  return (
    <SafeAreaView className="bg-white flex-1 pt-4">
      {/*█▀ █▀▀ ▄▀█ █▀█ █▀▀ █░█ █▄▄ ▄▀█ █▀█
         ▄█ ██▄ █▀█ █▀▄ █▄▄ █▀█ █▄█ █▀█ █▀▄*/}
      <SearchBar
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Search recipes"
      />

      {loading ? ( // ＬＯＡＤＩＮＧ ＳＴＡＴＥ
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ marginTop: 10 }}>Loading recipes...</Text>
        </View>
      ) : error ? ( // ＥＲＲＯＲ ＳＴＡＴＥ
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text className="text-red-500 text-lg">{error}</Text>
        </View>
      ) : (
        /*█▀█ █▀▀ █▀▀ █ █▀█ █▀▀ █▀▀ ▄▀█ █▀█ █▀▄
          █▀▄ ██▄ █▄▄ █ █▀▀ ██▄ █▄▄ █▀█ █▀▄ █▄▀*/
        <FlatList
          data={filteredRecipes}
          renderItem={({ item }) =>
            isFavTab ? (
              <RecipeCard_FAV {...item} />
            ) : (
              <RecipeCard_HOME_SOCIAL {...item} />
            )
          }
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            //ＥＭＰＴＹ ＳＵＣＣＥＳＳ ＳＴＡＴＥ
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text className="text-gray-500 text-lg font-bold">
                No recipes found.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
