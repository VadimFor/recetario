import { recipeImages } from "@/assets/recipeImages";
import Stat from "@/components/Stat";
import { Recipe } from "@/props/props";
import { useRecipeStore } from "@/store/recipeStore";
import { Link } from "expo-router";
import { Heart, MessageCircle, Send } from "lucide-react-native";
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
}: Recipe) => {
  const toggleLike = useRecipeStore((state) => state.toggleLike);

  const recipeImage =
    recipeImages[image] ?? require("../assets/recipes/default.png");

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
            source={recipeImage}
            className="w-[90px] h-[90px] rounded-md mr-4 mt-1 mb-1"
            resizeMode="cover"
          />
          <View className="flex-1">
            <Text className="font-semibold text-xl">{title}</Text>
            <Text className="text-gray-400 text-xl mb-2">By {username}</Text>
            <View className="flex-row justify-start">
              <Stat
                icon={<MessageCircle size={30} color="#6b7280" />}
                value={comments}
              />
              <Stat icon={<Send size={30} color="#6b7280" />} value={shares} />
              <Stat
                icon={
                  <TouchableOpacity onPress={() => toggleLike(id)}>
                    <Heart
                      size={30}
                      color={red_hearth ? "red" : "#d97706"}
                      fill={red_hearth ? "red" : "none"}
                    />
                  </TouchableOpacity>
                }
                value={likes}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </Link>
  );
};

export default RecipeCard_FAV;
