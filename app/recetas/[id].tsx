import arrow_left from "@/assets/icons/left-arrow.png";
import { recipeImages } from "@/assets/recipeImages";
import Stat from "@/components/Stat";
import { useRecipeStore } from "@/store/recipeStore";
import { router, useLocalSearchParams } from "expo-router";
import { Heart, MessageCircle, Send } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const options = {
  title: "Recipe Details",
  headerShown: true,
};

const RecetaDetails = () => {
  const id = useLocalSearchParams().id;
  const { recipes, toggleLike } = useRecipeStore();

  //Busco la receta actualizada en el store
  const recipe = recipes.find((r) => String(r.id) === id);
  //----

  //Busco la imagen
  const recipeImage = recipe
    ? recipeImages[recipe.image as keyof typeof recipeImages]
    : null;
  //----

  //Obtengo las dimensiones de la pantalla
  const screenHeight = Dimensions.get("window").height;
  const insets = useSafeAreaInsets();
  //----

  if (!recipe) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Recipe not found</Text>
      </View>
    );
  }

  return (
    <View
      className="bg-primary flex-1"
      style={{ width: "100%", height: screenHeight * 0.5 }}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View>
          {recipeImage && (
            <Image
              source={recipeImage}
              style={{ width: "100%", height: screenHeight * 0.5 }}
              resizeMode="stretch"
            />
          )}
        </View>

        <View className="flex-col items-center justify-center mt-5 px-5">
          <Text className="text-black text-2xl font-bold">{recipe.title}</Text>
          <Text className="text-gray-400 text-xl mb-2">
            By {recipe.username}
          </Text>
        </View>

        <View className="bg-slate-300 rounded-xl shadow-md p-5 mx-5 mt-6">
          <Text className="text-black text-xl font-semibold mb-4 text-center">
            Ingredientes
          </Text>
          <View className="space-y-3 items-center">
            {[
              "2 cups of flour",
              "1 cup of sugar",
              "1/2 cup of butter",
              "3 eggs",
              "1 tsp of baking powder",
            ].map((item, idx) => (
              <View key={idx} className="flex-row items-center">
                <View className="w-2 h-2 bg-yellow-500 rounded-full mr-3 font-bold" />
                <Text className="text-gray-700 text-base leading-relaxed text-center font-bold">
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="flex-col items-center justify-center mt-5 px-5">
          <Text className="text-black text-xl font-bold">Instrucciones</Text>
          <Text className="text-lg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua...
          </Text>
        </View>
      </ScrollView>

      {/* Fixed container at bottom */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "white",
          paddingBottom: insets.bottom,
          paddingTop: 3,
          zIndex: 50,
        }}
      >
        {/* Stats bar */}
        <View
          className="flex-row justify-start px-5"
          style={{
            paddingVertical: 12,
            borderTopWidth: 1,
            borderColor: "#444",
          }}
        >
          <Stat
            icon={<MessageCircle size={30} color="#6b7280" />}
            value={Number(recipe.comments)}
          />
          <Stat
            icon={<Send size={30} color="#6b7280" />}
            value={Number(recipe.shares)}
          />
          <Stat
            icon={
              <TouchableOpacity onPress={() => toggleLike(recipe.id)}>
                <Heart
                  size={30}
                  color={recipe.red_hearth ? "red" : "#d97706"}
                  fill={recipe.red_hearth ? "red" : "none"}
                />
              </TouchableOpacity>
            }
            value={recipe.likes}
          />
        </View>

        {/* Go back button */}
        <TouchableOpacity
          onPress={router.back}
          className="mx-5 rounded-lg py-3.5 flex flex-row items-center justify-center bg-slate-300"
          style={{ marginBottom: 10 }}
        >
          <Image
            source={arrow_left}
            className="size-5 mr-1 mt-0.5 rotate-290"
            tintColor="black"
          />
          <Text className="text-black font-semibold text-base">Go back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RecetaDetails;
