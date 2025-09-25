import { Recipe } from "@/props/props";
import { useRecipeStore } from "@/███ＳＴＯＲＥ████/recipe_Store";
import { Link } from "expo-router";
import { Bookmark, Heart, MessageCircle, Send } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const RecipeCard_FAV = ({
  id,
  title,
  user_id,
  username,
  image,
  likes,
  comments,
  shares,
  red_hearth,
  recipe_images,
}: Recipe) => {
  const toggleLike = useRecipeStore((state) => state.toggleLike);

  //============================================================================================================
  //█▀█ █▀▀ ▀█▀ █░█ █▀█ █▄░█
  //█▀▄ ██▄ ░█░ █▄█ █▀▄ █░▀█
  //============================================================================================================
  return (
    //NOTA: El id lo saca del objeto recipe (lo destructura en el Link) y lo pasa como parámetro a la ruta.

    <Link
      href={{
        pathname: "/recetas/[id]",
        params: { id },
      }}
      asChild
    >
      <View className="w-[95%] mx-auto">
        <TouchableOpacity
          className="flex-row mb-2 items-start px-3 border border-gray-300 "
          style={
            red_hearth
              ? {
                  shadowColor: "red",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0,
                  shadowRadius: 3,
                  elevation: 0, // Android shadow
                  borderRadius: 2,
                }
              : undefined
          }
        >
          <Image
            source={
              recipe_images && recipe_images.length > 0 && recipe_images[0].url
                ? { uri: recipe_images[0].url }
                : require("@/assets/recipes/default.png")
            }
            className="w-[90px] h-[90px] rounded-md mr-4 mt-1 mb-1"
            resizeMode="cover"
          />
          <View className="flex-1">
            <Text className="font-semibold text-xl">{title}</Text>
            <Text className="text-gray-400 text-xl ">By {username}</Text>

            <View className="flex-row items-center justify-between  ">
              {/* Comment */}
              <View className="items-center">
                <TouchableOpacity className="relative">
                  <View style={{ transform: [{ scaleX: 1.3 }] }}>
                    <MessageCircle size={36} strokeWidth={1.5} color="black" />
                  </View>
                  <Text className="absolute inset-0 text-xs font-bold text-center top-1/2 -translate-y-1/2 text-black">
                    {comments}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Share */}
              <View className="items-center">
                <TouchableOpacity className="relative">
                  <Send size={36} color="black" />
                </TouchableOpacity>
              </View>

              {/* Bookmark*/}
              <TouchableOpacity className="relative">
                <View style={{ transform: [{ scaleX: 1 }] }}>
                  <Bookmark size={36} strokeWidth={1.5} color="black" />
                </View>
              </TouchableOpacity>

              <View className="w-2"></View>

              <TouchableOpacity
                onPress={() => toggleLike(id)}
                className="relative"
              >
                <Heart
                  size={54}
                  strokeWidth={1}
                  color="black"
                  fill={red_hearth ? "red" : "transparent"}
                />
                <Text
                  className={`absolute inset-0 text-xs font-bold text-center top-1/2 -translate-y-1/2 ${
                    red_hearth ? "text-white" : "text-black"
                  }`}
                >
                  {likes}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </Link>
  );
};

export default RecipeCard_FAV;
