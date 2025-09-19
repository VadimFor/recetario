import { recipeImages } from "@/assets/recipeImages";
import Stat from "@/components/Stat";
import { Recipe } from "@/props/props";
import { useRecipeStore } from "@/store/recipeStore";
import { Link } from "expo-router";
import { Heart, MessageCircle, Send } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const RecipeCard_HOME = ({
  id,
  title,
  username,
  image,
  likes,
  comments,
  shares,
  red_hearth,
}: Recipe) => {
  const toggleLike = useRecipeStore((state) => state.toggleLike);

  const recipeImage =
    recipeImages[image] ?? require("../assets/recipes/default.png");

  return (
    <Link
      href={{
        pathname: "/recetas/[id]",
        params: { id },
      }}
      asChild
    >
      <TouchableOpacity className="mb-6 px-4">
        {/* Imagen grande con overlay */}
        <View className="relative">
          <Image
            source={recipeImage}
            className="w-full h-56 rounded-2xl"
            resizeMode="cover"
          />

          {/* Heart stat in top-right corner */}
          <TouchableOpacity
            onPress={() => toggleLike(id)}
            className="absolute top-3 right-3 bg-black/40 p-2 rounded-full"
          >
            <Heart
              size={35}
              color={red_hearth ? "red" : "white"}
              fill={red_hearth ? "red" : "transparent"}
            />
          </TouchableOpacity>

          {/* Overlay con título */}
          <View className="absolute bottom-0 left-0 right-0 p-4 bg-black/40 rounded-b-2xl">
            <Text className="text-white font-bold text-xl">{title}</Text>
            <Text className="text-gray-200 text-sm">By {username}</Text>
          </View>
        </View>

        {/* Stats debajo de la tarjeta */}
        <View className="flex-row justify-between items-center mt-3 px-2">
          <Stat
            icon={<MessageCircle size={26} color="#6b7280" />}
            value={comments}
          />
          <Stat icon={<Heart size={26} color="#6b7280" />} value={likes} />
          <Stat icon={<Send size={26} color="#6b7280" />} value={shares} />
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default RecipeCard_HOME;
