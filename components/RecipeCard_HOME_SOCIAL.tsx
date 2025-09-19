import { recipeImages } from "@/assets/recipeImages";
import { Recipe } from "@/props/props";
import { useRecipeStore } from "@/store/recipeStore";
import { Link } from "expo-router";
import { Bookmark, Eye, Heart, MessageCircle, Send } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import ImageCarousel from "./ImageCarousel";

const RecipeCard_HOME_SOCIAL = ({
  id,
  title,
  username,
  image,
  likes,
  comments,
  shares,
  red_hearth,
  user_avatar,
}: Recipe) => {
  const toggleLike = useRecipeStore((state) => state.toggleLike);

  const recipeImage =
    recipeImages[image] ?? require("../assets/recipes/default.png");

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
          className="w-10 h-10 rounded-full mr-3"
          resizeMode="cover"
        />
        <View>
          <Text className="font-bold text-xl">{title}</Text>
          <Text className="text-gray-500 text-base">{username}</Text>
        </View>
      </View>

      {/* Main image <Image source={recipeImage} className="w-full h-80" resizeMode="cover" /> */}

      <ImageCarousel
        data={[
          "https://ichef.bbci.co.uk/food/ic/food_16x9_1600/recipes/quick_flatbreads_43123_16x9.jpg",
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRLAD_W5wYq0cTGT5XUQJwTar5jBfrm5Fc9g&s",
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH5cse1c-610fUADLMs1R8PTs2QBNiEKv1OA&s",
        ]}
      />

      {/* Action buttons with stats */}
      <View className="flex-row items-center justify-between pl-2 ">
        <View className="flex-row space-x-6">
          {/* Comment */}
          <View className="items-center mr-4">
            <TouchableOpacity>
              <MessageCircle size={28} color="black" />
            </TouchableOpacity>
            <Text className="text-sm">{comments}</Text>
          </View>

          {/* Share */}
          <View className="items-center">
            <TouchableOpacity>
              <Send size={28} color="black" />
            </TouchableOpacity>
            <Text className="text-sm">{shares}</Text>
          </View>
        </View>

        {/* Modern "View Details" button */}
        <Link
          href={{
            pathname: "/recetas/[id]",
            params: { id },
          }}
          asChild
        >
          <TouchableOpacity
            className="flex-row items-center justify-center bg-blue-400 px-2 rounded-full shadow-lg mr-2 "
            style={{ height: 40, width: 200 }} // sets height explicitly
          >
            <Eye size={20} color="white" className="mr-3" />
            <Text className="text-white font-semibold "> View details</Text>
          </TouchableOpacity>
        </Link>

        {/* Bookmark */}
        <TouchableOpacity>
          <Bookmark size={28} color="black" />
        </TouchableOpacity>

        {/* Like */}
        <View className="items-center mr-2">
          <TouchableOpacity onPress={() => toggleLike(id)} className="relative">
            {/* Heart Icon */}
            <Heart
              size={44}
              strokeWidth={1}
              color={red_hearth ? "black" : "black"}
              fill={red_hearth ? "red" : "transparent"}
            />

            {/* Likes Count Inside Heart */}
            <Text
              className={`absolute pt-1 inset-0 text-xs font-bold text-center top-1/2 -translate-y-1/2 ${
                red_hearth ? "text-white" : "text-black"
              }`}
            >
              {likes}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RecipeCard_HOME_SOCIAL;
