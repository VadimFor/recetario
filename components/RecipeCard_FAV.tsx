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
  likes,
  comments,
  shares,
  red_hearth,
  recipe_images,
}: Recipe) => {
  const toggleLike = useRecipeStore((state) => state.toggleLike);
  const id_ = String(id);

  return (
    <View className="w-[95%] mx-auto">
      <Link
        href={{
          pathname: "/recetas/[id]",
          params: { id: id_ }, // ✅ param must be "id"
        }}
        asChild
      >
        <TouchableOpacity
          className="flex-row mb-2 items-start px-3 border border-gray-300"
          style={
            red_hearth
              ? {
                  shadowColor: "red",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0,
                  shadowRadius: 3,
                  elevation: 0,
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
            <Text className="text-gray-400 text-xl">By {username}</Text>

            <View className="flex-row items-center justify-between">
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

              {/* Bookmark */}
              <TouchableOpacity className="relative">
                <View style={{ transform: [{ scaleX: 1 }] }}>
                  <Bookmark size={36} strokeWidth={1.5} color="black" />
                </View>
              </TouchableOpacity>

              <View className="w-2"></View>

              {/* Like button */}
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
      </Link>
    </View>
  );
};

export default RecipeCard_FAV;
