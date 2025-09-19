import ErrorPopup from "@/components/ErrorPopup";
import SearchBar from "@/components/SearchBar";
import RecipeCard_MIS from "@/components/TAB_USER/RecipeCard_MIS";
import { useAuthStore } from "@/███ＳＴＯＲＥ████/auth_Store";
import { useRecipeStore } from "@/███ＳＴＯＲＥ████/recipe_Store";
import * as NavigationBar from "expo-navigation-bar";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const MisRecetas = ({ showAddButton = true }) => {
  const { user, isUserAuthenticated, isLoading } = useAuthStore();
  const { user_recipes, loading, error, fetchUserRecipes, createRecipe } =
    useRecipeStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showError, setShowError] = useState(true);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const { height } = Dimensions.get("window");

  // Fetch user recipes
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      NavigationBar.setVisibilityAsync("hidden");
      if (isUserAuthenticated && !isLoading && user?.id !== undefined) {
        await fetchUserRecipes(String(user.id));
        if (cancelled) return;
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [isLoading, user?.id]);

  // Error popup
  useEffect(() => {
    if (error) setShowError(true);
  }, [error]);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchTerm), 150);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const filteredRecipes = user_recipes.filter((r) =>
    r.title.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleCreate = () => {
    createRecipe(newTitle);
    setNewTitle("");
    setCreateModalVisible(false);
  };

  return (
    <View className="flex-1 bg-gray-100">
      <SafeAreaView className="bg-white flex-1 pt-1">
        <SearchBar
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search recipes"
        />

        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={{ marginTop: 10 }}>Loading recipes...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredRecipes}
            renderItem={({ item }) => <RecipeCard_MIS {...item} />}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text className="text-gray-500 text-lg font-bold">
                  No recipes found.
                </Text>
              </View>
            }
            numColumns={2}
            className="mt-2 pb-32 ml-2 mr-3"
            columnWrapperStyle={{
              justifyContent: "flex-start",
              gap: 1,
              marginBottom: 20,
            }}
          />
        )}

        {error && showError && (
          <ErrorPopup message={error} onHide={() => setShowError(false)} />
        )}

        {showAddButton && (
          <View className="bottom-1 left-1/2 transform -translate-x-1/2 justify-center items-center">
            <TouchableOpacity
              className="bg-green-500 py-3 rounded-full justify-center items-center shadow-lg"
              onPress={() => setCreateModalVisible(true)}
              activeOpacity={0.8}
              style={{ width: "50%" }}
            >
              <Text className="text-white font-bold text-lg">+ Add recipe</Text>
            </TouchableOpacity>
          </View>
        )}

        <Modal
          transparent={true}
          visible={createModalVisible}
          animationType="fade"
          onRequestClose={() => setCreateModalVisible(false)}
        >
          <View
            className="h-120 flex-1 justify-center items-center bg-transparent bg-opacity-25"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <View className="bg-white p-6 rounded-2xl w-11/12 shadow-lg">
              <Text className="text-gray-800 font-bold text-xl mb-4 text-center">
                Create New Recipe
              </Text>

              <Text className="text-gray-700 font-semibold text-base mb-2">
                Title
              </Text>
              <TextInput
                value={newTitle}
                onChangeText={setNewTitle}
                className="border border-gray-300 rounded-xl p-3 mb-5 text-base bg-gray-50 shadow-sm"
                placeholder="Enter recipe title"
                placeholderTextColor="#9ca3af"
              />

              <View className="flex-row justify-between">
                <TouchableOpacity
                  className="flex-1 bg-green-600 py-3 mx-1 rounded-xl items-center shadow active:bg-green-700"
                  onPress={handleCreate}
                >
                  <Text className="text-white font-bold text-base">Create</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-gray-200 py-3 mx-1 rounded-xl items-center shadow active:bg-gray-300"
                  onPress={() => setCreateModalVisible(false)}
                >
                  <Text className="text-gray-700 font-semibold text-base">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

export default MisRecetas;
