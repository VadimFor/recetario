import { useAuthStore } from "@/███ＳＴＯＲＥ████/auth_Store"; // added import
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Pressable, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const index = () => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  // Define tamaños responsive basados en pantalla
  const iconSize = width < 350 ? 24 : width < 450 ? 28 : 32;
  const borderRadiusValue = width < 350 ? 12 : width < 450 ? 16 : 20;

  // Altura base, ajustada con safe area bottom y porcentaje relativo
  const baseHeight = 50;
  const tabBarHeight = baseHeight + insets.bottom + height * 0.02;

  // Padding bottom para que quede bien separado del safe area
  const paddingBottom = 5 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#6200ee",
        tabBarInactiveTintColor: "#999",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontWeight: "bold", // Make font bold
        },
        tabBarStyle: {
          backgroundColor: "white",
          height: tabBarHeight,
          paddingBottom: paddingBottom,
          borderTopLeftRadius: borderRadiusValue,
          borderTopRightRadius: borderRadiusValue,
          overflow: "hidden",
          borderTopWidth: 0,
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarButton: ({ onPress, children, accessibilityLabel }) => (
          <Pressable
            onPress={onPress}
            android_ripple={null}
            accessibilityLabel={accessibilityLabel}
            className="flex-1 justify-center items-center"
          >
            {children}
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="home"
              color={color}
              size={iconSize + 5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Favoritos"
        options={{
          title: "Favoritos",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="cards-heart"
              color={color}
              size={iconSize}
            />
          ),
        }}
      />
      {/*
      <Tabs.Screen
        name="Misrecetas"
        options={{
          title: "Mis recetas",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="animation"
              color={color}
              size={iconSize}
            />
          ),
        }}
      />*/}
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chat" color={color} size={iconSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="Perfil"
        options={{
          title: user?.id ? "Perfil" : "Login",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="account"
              color={color}
              size={iconSize}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default index;
