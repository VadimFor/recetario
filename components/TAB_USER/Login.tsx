import { useAuthStore } from "@/███ＳＴＯＲＥ████/auth_Store";
import * as Sentry from "@sentry/react-native";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

///////////////////////////////////////////////////////////////////////////////////////////
const Login = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ usernameOrEmail: "isa", password: "isa" });
  const { user, login } = useAuthStore();

  const submit_login = async () => {
    const { usernameOrEmail, password } = form;

    if (!usernameOrEmail || !password)
      return Alert.alert("Error", "Please fill out all fields.");

    if (usernameOrEmail.includes("@")) {
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(usernameOrEmail.trim()))
        return Alert.alert("Error", "Invalid email format");
    }

    setIsSubmitting(true);

    try {
      await login(form.usernameOrEmail.trim(), form.password.trim());

      if (user?.id) {
        console.log(user);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
      Sentry.captureEvent(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="gap-6 bg-white p-6 shadow">
      {/* 
      █░█ █▀ █▀▀ █▀█ █▄░█ ▄▀█ █▀▄▀█ █▀▀
      █▄█ ▄█ ██▄ █▀▄ █░▀█ █▀█ █░▀░█ ██▄*/}
      <View>
        <Text className="text-gray-700 font-semibold mb-1">
          Email or username
        </Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base"
          placeholder="Enter your username or your email"
          value={form.usernameOrEmail}
          onChangeText={(text) =>
            setForm((prev) => ({ ...prev, usernameOrEmail: text }))
          }
          autoCapitalize="none"
        />
      </View>

      {/* 
      █▀█ ▄▀█ █▀ █▀ █░█░█ █▀█ █▀█ █▀▄
      █▀▀ █▀█ ▄█ ▄█ ▀▄▀▄▀ █▄█ █▀▄ █▄▀*/}
      <View>
        <Text className="text-gray-700 font-semibold mb-1">Password</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base"
          placeholder="Enter your password"
          value={form.password}
          onChangeText={(text) =>
            setForm((prev) => ({ ...prev, password: text }))
          }
          secureTextEntry
        />
      </View>

      {/* 
      █▀ █░█ █▄▄ █▀▄▀█ █ ▀█▀
      ▄█ █▄█ █▄█ █░▀░█ █ ░█░*/}
      <Pressable
        onPress={submit_login}
        disabled={isSubmitting}
        className={`rounded-xl py-4 items-center ${
          isSubmitting ? "bg-gray-300" : "bg-blue-600"
        }`}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-lg font-semibold">Sign In</Text>
        )}
      </Pressable>

      {/* 
      █▀▀ █▀█ █▀█ ▀█▀ █▀▀ █▀█
      █▀░ █▄█ █▄█ ░█░ ██▄ █▀▄*/}
      <View className="flex justify-center mt-5 flex-row gap-2">
        <Text className="text-gray-500">Forgot your password?</Text>
        <Link href="/(tabs)/Perfil" className="text-blue-600 font-semibold">
          Recover
        </Link>
      </View>
    </View>
  );
};

export default Login;
