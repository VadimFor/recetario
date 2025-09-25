import ErrorPopup from "@/components/ErrorPopup";
import SearchBar from "@/components/SearchBar";
import RecipeCard_MIS from "@/components/TAB_USER/RecipeCard_MIS";
import { useAuthStore } from "@/███ＳＴＯＲＥ████/auth_Store";
import { useRecipeStore } from "@/███ＳＴＯＲＥ████/recipe_Store";
import * as NavigationBar from "expo-navigation-bar";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const MisRecetas = ({ showAddButton = true }) => {
  const { user, isLoading } = useAuthStore();
  const {
    user_recipes,
    loading,
    error,
    fetchUserRecipes,
    createRecipe,
    pickImagesFromGallery,
    addRecipePictures,
  } = useRecipeStore();
  const [images, setImages] = useState<string[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showError, setShowError] = useState(true);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  // Fetch user recipes
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      NavigationBar.setVisibilityAsync("hidden");
      if (user?.id && !isLoading && user?.id !== undefined) {
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

  const handlePickImages = async () => {
    const uris = await pickImagesFromGallery();
    if (uris.length > 0) {
      setImages((prev) => [...prev, ...uris]);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;

    try {
      // Create recipe (store will handle API_createRecipe and add to user_recipes)
      const newRecipe = await createRecipe(newTitle);

      if (newRecipe && images.length > 0) {
        addRecipePictures(newRecipe.id, images);
      }
    } catch (err) {
      console.error("Error creating recipe:", err);
    }

    setNewTitle("");
    setImages([]);
    setCreateModalVisible(false);
  };

  return (
    <View className="flex-1 bg-gray-100">
      <SafeAreaView className="bg-white flex-1">
        <View className="mt-2">
          <SearchBar
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search recipes"
          />
        </View>

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
            className="pb-32 ml-2 mr-3"
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

        {/*
        █▀▄▀█ █▀█ █▀▄ ▄▀█ █░░   ▄▀█ █▀▄ █▀▄   █▀█ █▀▀ █▀▀ █ █▀█ █▀▀
        █░▀░█ █▄█ █▄▀ █▀█ █▄▄   █▀█ █▄▀ █▄▀   █▀▄ ██▄ █▄▄ █ █▀▀ ██▄*/}
        <Modal visible={createModalVisible} animationType="fade" transparent>
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white w-11/12 rounded-3xl p-6 shadow-xl">
              {/* ＭＯＤＡＬ ＨＥＡＤＥＲ ＴＩＴＬＥ */}
              <View className="flex-row justify-between items-center mb-5">
                <View className="w-10" />
                <Text className="text-xl font-bold text-slate-800">
                  New recipe
                </Text>
                <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                  <Text className="text-slate-400 text-lg">✕</Text>
                </TouchableOpacity>
              </View>

              {/* ＴＩＴＬＥ ＩＮＰＵＴ */}
              <Text className="text-slate-600 font-medium mb-2">Title</Text>
              <TextInput
                value={newTitle}
                onChangeText={setNewTitle}
                className="border border-slate-300 rounded-2xl p-4 mb-5 text-base bg-slate-50"
                placeholder="Enter recipe title"
                placeholderTextColor="#9ca3af"
              />

              {/* ＡＤＤ ＩＭＡＧＥ ＢＵＴＴＯＮ */}
              <TouchableOpacity
                onPress={handlePickImages}
                className="bg-indigo-600 py-3 rounded-2xl items-center mb-5 shadow active:scale-95"
              >
                <Text className="text-white font-semibold text-base">
                  + Add Images
                </Text>
              </TouchableOpacity>

              {/* ＩＭＡＧＥ ＰＲＥＶＩＥＷ */}
              {images.length > 0 && (
                <View className="mb-6">
                  <Text className="text-slate-600 font-medium mb-3">
                    Selected Images
                  </Text>
                  <View className="flex-row flex-wrap">
                    {images.map((uri, idx) => (
                      <View key={idx} className="relative mr-2 mb-2">
                        <Image
                          source={{ uri }}
                          className="w-24 h-24 rounded-2xl"
                        />
                        {/* remove button on image */}
                        <TouchableOpacity
                          onPress={() =>
                            setImages((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                          className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full items-center justify-center shadow"
                        >
                          <Text className="text-white text-xs">✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* ＣＲＥＡＴＥ ＆ ＣＡＮＣＥＬ ＢＵＴＴＯＮＳ */}
              <View className="flex-row justify-between">
                <TouchableOpacity
                  className="flex-1 bg-emerald-600 py-3 mx-1 rounded-2xl items-center shadow active:scale-95"
                  onPress={handleCreate}
                >
                  <Text className="text-white font-semibold text-base">
                    Create
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-slate-200 py-3 mx-1 rounded-2xl items-center shadow active:scale-95"
                  onPress={() => setCreateModalVisible(false)}
                >
                  <Text className="text-slate-700 font-medium text-base">
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
