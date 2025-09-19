import Login from "@/components/TAB_USER/Login";
import MisRecetas from "@/components/TAB_USER/MisRecetas";
import Register from "@/components/TAB_USER/Register";
import { useAuthStore } from "@/store/authStore";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";

import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Perfil = () => {
  const [activeButton, setActiveButton] = useState("login"); // 'login' or 'register'
  const { user, logout, changeAvatar } = useAuthStore();

  if (user?.id) {
    return (
      <View className="flex-1">
        {/* Header */}
        <View className="pt-12 bg-blue-600 h-60 justify-center items-center relative">
          {/* Logout button at top-right */}
          <Pressable
            onPress={() => logout()}
            className="absolute top-12 right-4 bg-red-600 px-4 py-2 rounded-full shadow-lg"
          >
            <Text className="text-white font-semibold">Logout</Text>
          </Pressable>

          <View className="flex-row items-center">
            <View className="items-center mr-4">
              <View className="relative">
                <Image
                  key={user.avatar}
                  source={
                    user?.avatar
                      ? { uri: user.avatar }
                      : require("@/assets/images/default_avatar.png")
                  }
                  className="w-32 h-32 rounded-full border-4 border-white"
                />

                {/* Change Avatar button inside picture */}
                <TouchableOpacity
                  onPress={() => changeAvatar()}
                  className="absolute bottom-0 right-0 bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="camera-alt" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
            <View>
              <Text className="text-2xl font-semibold text-white">
                {user.username}
              </Text>
              <Text className="text-xl font-semibold text-white">
                {user.email}
              </Text>
              <Text className="text-base font-semibold text-white">
                Member since: {new Date(user.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <MisRecetas />
      </View>
    );
  } else {
    // Not logged in: show Login/Register
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ImageBackground
          source={require("@/assets/images/login-graphic.png")}
          className="absolute inset-0 opacity-80"
          resizeMode="cover"
        />

        <View className="flex-1 flex-col justify-between">
          {/* Logo */}
          <View className="flex-1 justify-center items-center">
            <Image
              source={require("@/assets/images/logo.png")}
              className="w-56 h-56"
              resizeMode="contain"
            />
          </View>

          {/* Bottom section */}
          <View className="w-full bg-white rounded-t-[30px] overflow-hidden">
            {/* Buttons */}
            <View className="flex-row">
              <Pressable
                onPress={() => setActiveButton("login")}
                className={`flex-1 py-4 ${
                  activeButton === "login" ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <Text
                  className={`text-center text-lg font-semibold ${
                    activeButton === "login" ? "text-white" : "text-black"
                  }`}
                >
                  Login
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setActiveButton("register")}
                className={`flex-1 py-4 ${
                  activeButton === "register" ? "bg-green-600" : "bg-gray-200"
                }`}
              >
                <Text
                  className={`text-center text-lg font-semibold ${
                    activeButton === "register" ? "text-white" : "text-black"
                  }`}
                >
                  Register
                </Text>
              </Pressable>
            </View>

            {/* Forms */}
            <View className="p-2">
              {activeButton === "login" ? <Login /> : <Register />}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }
};

export default Perfil;
