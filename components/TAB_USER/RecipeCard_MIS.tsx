/* 
PARA LA PESTAÑA DE "MIS RECETAS"
*/

import { Recipe } from "@/props/props";
import { useRecipeStore } from "@/███ＳＴＯＲＥ████/recipe_Store";
import { Link } from "expo-router";
import {
  Heart,
  MessageCircle,
  Pencil,
  Send,
  Trash2,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const RecipeCard_MIS = ({
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
  const { deleteRecipe } = useRecipeStore();

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [tempTitle, setTempTitle] = useState(title); // temporary editing value

  const handleDelete = () => {
    deleteRecipe(id);
    setDeleteModalVisible(false);
  };

  console.log("recipe_images for", id, recipe_images);

  //============================================================================================================
  //█▀█ █▀▀ ▀█▀ █░█ █▀█ █▄░█
  //█▀▄ ██▄ ░█░ █▄█ █▀▄ █░▀█
  //============================================================================================================
  return (
    //NOTA: El id lo saca del objeto recipe (lo destructura en el Link) y lo pasa como parámetro a la ruta.
    <View className="w-[50%] p-1">
      <View
        className="bg-white rounded-lg shadow-lg overflow-hidden"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5, // for Android
        }}
      >
        <Link
          href={{
            pathname: "/recetas/[id]",
            params: { id },
          }}
          asChild
        >
          <TouchableOpacity>
            {/*█ █▀▄▀█ ▄▀█ █▀▀ █▀▀ █▄░█
               █ █░▀░█ █▀█ █▄█ ██▄ █░▀█*/}
            <Image
              source={
                recipe_images &&
                recipe_images.length > 0 &&
                recipe_images[0].url
                  ? { uri: recipe_images[0].url }
                  : require("@/assets/recipes/default.png")
              }
              className="w-full h-52 rounded-lg"
              resizeMode="cover"
            />
            {/*█▀ ▀█▀ ▄▀█ ▀█▀ █▀
               ▄█ ░█░ █▀█ ░█░ ▄█*/}
            <View className="flex-1 flex-col justify-between mt-2 h-28 px-2">
              <Text className="font-semibold text-xl">{title}</Text>

              <View className="flex-row justify-between w-full">
                <View className="flex-1 flex-row items-center justify-center">
                  <MessageCircle size={30} color="#6b7280" />
                  <Text className="font-bold text-gray-500">{comments}</Text>
                </View>

                <View className="flex-1 flex-row items-center justify-center ">
                  <Send size={30} color="#6b7280" />
                  <Text className="font-bold text-gray-500">{shares}</Text>
                </View>

                <View className="flex-1 flex-row items-center justify-center ">
                  <Heart size={30} color="#6b7280" />
                  <Text className="font-bold text-gray-500">{likes}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Link>

        {/*█▄▄ █░█ ▀█▀ ▀█▀ █▀█ █▄░█ █▀
           █▄█ █▄█ ░█░ ░█░ █▄█ █░▀█ ▄█*/}
        <View className="flex-1 mt-3 flex-row space-x-3">
          <TouchableOpacity
            onPress={() => setEditModalVisible(true)}
            className="w-[60%] flex-row items-center justify-center bg-blue-500  py-3 rounded-xl shadow active:bg-blue-600"
          >
            <Pencil size={20} color="white" />
            <Text className="text-white font-bold text-base ml-2">Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setDeleteModalVisible(true)}
            className=" w-[40%] flex-row items-center justify-center bg-red-500  py-3 rounded-xl shadow active:bg-red-600"
          >
            <Trash2 size={20} color="white" />
            <Text className="text-white font-bold text-base ">Delete</Text>
          </TouchableOpacity>
        </View>

        {/*█▀▄ █▀▀ █░░ █▀▀ ▀█▀ █▀▀   █▀▄▀█ █▀█ █▀▄ ▄▀█ █░░
           █▄▀ ██▄ █▄▄ ██▄ ░█░ ██▄   █░▀░█ █▄█ █▄▀ █▀█ █▄▄*/}
        <Modal
          transparent={true}
          visible={deleteModalVisible}
          animationType="fade"
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black bg-opacity-25">
            <View className="bg-white p-6 rounded-2xl w-11/12 shadow-lg">
              {/* Modal Title */}
              <Text className="text-gray-800 font-bold text-xl mb-4 text-center">
                Are you sure you want to delete {title}?
              </Text>

              {/* Action Buttons */}
              <View className="flex-row justify-between">
                {/* Delete Button */}
                <TouchableOpacity
                  className="flex-1 bg-red-600 py-3 mx-1 rounded-xl items-center shadow active:bg-red-700"
                  onPress={handleDelete}
                >
                  <Text className="text-white font-bold text-base">Delete</Text>
                </TouchableOpacity>

                {/* Cancel Button */}
                <TouchableOpacity
                  className="flex-1 bg-gray-200 py-3 mx-1 rounded-xl items-center shadow active:bg-gray-300"
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text className="text-gray-700 font-semibold text-base">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/*█▀▀ █▀▄ █ ▀█▀   █▀▄▀█ █▀█ █▀▄ ▄▀█ █░░
           ██▄ █▄▀ █ ░█░   █░▀░█ █▄█ █▄▀ █▀█ █▄▄*/}
        <Modal
          transparent={true}
          visible={editModalVisible}
          animationType="fade"
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black bg-opacity-25">
            <View className="bg-white p-6 rounded-2xl w-11/12 shadow-lg">
              {/* Modal Title */}
              <Text className="text-gray-800 font-bold text-xl mb-4 text-center">
                Edit Recipe
              </Text>

              {/* Input Label */}
              <Text className="text-gray-700 font-semibold text-base mb-2">
                Title
              </Text>

              {/* Text Input */}
              <TextInput
                value={tempTitle}
                onChangeText={setTempTitle}
                className="border border-gray-300 rounded-xl p-3 mb-5 text-base bg-gray-50 shadow-sm"
                placeholder="Enter recipe title"
                placeholderTextColor="#9ca3af"
              />

              {/* Action Buttons */}
              <View className="flex-row justify-between">
                {/* Save Button */}
                <TouchableOpacity
                  className="flex-1 bg-blue-600 py-3 mx-1 rounded-xl items-center shadow active:bg-blue-700"
                  onPress={() => {
                    setEditedTitle(tempTitle); // commit changes
                    setEditModalVisible(false);
                    // optionally: updateRecipe(id, { title: tempTitle });
                  }}
                >
                  <Text className="text-white font-bold text-base">Save</Text>
                </TouchableOpacity>

                {/* Cancel Button */}
                <TouchableOpacity
                  className="flex-1 bg-gray-200 py-3 mx-1 rounded-xl items-center shadow active:bg-gray-300"
                  onPress={() => {
                    setTempTitle(editedTitle); // reset changes
                    setEditModalVisible(false);
                  }}
                >
                  <Text className="text-gray-700 font-semibold text-base">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

export default RecipeCard_MIS;
