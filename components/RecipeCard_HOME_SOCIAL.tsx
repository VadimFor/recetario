import { Recipe } from "@/props/props";
import { useRecipeStore } from "@/███ＳＴＯＲＥ████/recipe_Store";
import { Link } from "expo-router";
import { Bookmark, Eye, Heart, MessageCircle, Send } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import ImageCarousel from "./ImageCarousel";

const RecipeCard_HOME_SOCIAL = ({
  id,
  title,
  username,
  likes,
  comments,
  shares,
  red_hearth,
  user_avatar,
  recipe_images,
}: Recipe) => {
  const toggleLike = useRecipeStore((state) => state.toggleLike);

  console.log("username: ", username, "user_avatar: ", user_avatar);

  return (
    <View className="mb-6">
      {/* Top bar: avatar + title + username */}
      <View className="flex-row items-center px-4 py-2 border-t border-gray-300">
        <Image
          source={
            user_avatar
              ? { uri: user_avatar }
              : require("@/assets/images/default_avatar.png")
          }
          className="w-16 h-16 rounded-full mr-3"
          resizeMode="cover"
        />
        <View>
          <Text className="font-bold text-xl">{title}</Text>
          <Text className="text-gray-500 text-base">{username}</Text>
        </View>
      </View>

      {/* Main image <Image source={recipeImage} className="w-full h-80" resizeMode="cover" /> */}

      <ImageCarousel
        data={
          Array.isArray(recipe_images) && recipe_images.length > 0
            ? recipe_images.map((img) => img.url) // ✅ use DB images
            : [
                // fallback if no images
                require("@/assets/recipes/default.png"),
              ]
        }
      />

      {/* Action buttons with stats */}
      <View className="flex-row items-center justify-between px-4 mt-2">
        {/* Left: Comment + Share */}
        <View className="flex-row space-x-6">
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

          <View className="w-2"></View>

          {/* Share */}
          <View className="items-center">
            <TouchableOpacity className="relative">
              <Send size={36} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Center: View Details */}
        <Link
          href={{
            pathname: "/recetas/[id]",
            params: { id },
          }}
          asChild
        >
          <TouchableOpacity
            className="flex-row items-center justify-center bg-blue-400 px-4 rounded-full shadow-lg"
            style={{ height: 40, minWidth: 160 }}
          >
            <Eye size={20} color="white" />
            <Text className="text-white font-semibold ml-2">View details</Text>
          </TouchableOpacity>
        </Link>

        {/* Right: Bookmark + Like */}
        <View className="flex-row items-center space-x-4">
          {/* Bookmark (optional count inside) */}
          <TouchableOpacity className="relative">
            <View style={{ transform: [{ scaleX: 1.3 }] }}>
              <Bookmark size={36} strokeWidth={1.5} color="black" />
            </View>
          </TouchableOpacity>

          <View className="w-2"></View>

          {/* Like */}
          <View className="items-center">
            <TouchableOpacity
              onPress={() => toggleLike(id)}
              className="relative"
            >
              <Heart
                size={44}
                strokeWidth={1.5}
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
      </View>
    </View>
  );
};

export default RecipeCard_HOME_SOCIAL;
