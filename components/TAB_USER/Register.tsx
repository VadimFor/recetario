import { User } from "@/props/props";
import { useAuthStore } from "@/███ＳＴＯＲＥ████/auth_Store";
import * as Sentry from "@sentry/react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

const SignUp = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { registerUser } = useAuthStore();

  const register = async () => {
    const { username, email, password, confirmPassword } = form;

    if (!username || !email || !password || !confirmPassword)
      return Alert.alert("Error", "Please fill out all fields.");

    if (password !== confirmPassword)
      return Alert.alert("Error", "Passwords do not match.");

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email.trim()))
      return Alert.alert("Error", "Invalid email format");

    setIsSubmitting(true);

    try {
      const reg_user: User | null = await registerUser(
        form.email.trim(),
        form.username.trim(),
        form.password.trim()
      );
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
        <Text className="text-gray-700 font-semibold mb-1">Username</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base"
          placeholder="Enter your username"
          value={form.username}
          onChangeText={(text) =>
            setForm((prev) => ({ ...prev, username: text }))
          }
          autoCapitalize="none"
        />
      </View>
      {/* 
      █▀▀ █▀▄▀█ ▄▀█ █ █░░
      ██▄ █░▀░█ █▀█ █ █▄▄*/}
      <View>
        <Text className="text-gray-700 font-semibold mb-1">Email</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base"
          placeholder="Enter your email"
          value={form.email}
          onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
          keyboardType="email-address"
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
      █▀█ ▄▀█ █▀ █▀ █░█░█ █▀█ █▀█ █▀▄   █▀▀ █▀█ █▄░█ █▀▀ █ █▀█ █▀▄▀█
      █▀▀ █▀█ ▄█ ▄█ ▀▄▀▄▀ █▄█ █▀▄ █▄▀   █▄▄ █▄█ █░▀█ █▀░ █ █▀▄ █░▀░█*/}
      <View>
        <Text className="text-gray-700 font-semibold mb-1">
          Confirm Password
        </Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base"
          placeholder="Confirm your password"
          value={form.confirmPassword}
          onChangeText={(text) =>
            setForm((prev) => ({ ...prev, confirmPassword: text }))
          }
          secureTextEntry
        />
      </View>
      {/* 
      █▀ █░█ █▄▄ █▀▄▀█ █ ▀█▀
      ▄█ █▄█ █▄█ █░▀░█ █ ░█░*/}
      <Pressable
        onPress={register}
        disabled={isSubmitting}
        className={`rounded-xl py-4 items-center ${
          isSubmitting ? "bg-gray-300" : "bg-green-600"
        }`}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-lg font-semibold">Sign Up</Text>
        )}
      </Pressable>
      {/* 
      █▀▀ █▀█ █▀█ ▀█▀ █▀▀ █▀█
      █▀░ █▄█ █▄█ ░█░ ██▄ █▀▄*/}
      <View className="flex justify-center mt-5 flex-row gap-2"></View>
    </View>
  );
};

export default SignUp;
