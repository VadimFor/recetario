import React from "react";
import { Image, TextInput, TouchableOpacity, View } from "react-native";
import close_icon from "../assets/icons/close.png"; // add a close/clear icon image
import search_icon from "../assets/icons/search.png";

interface Props {
  //solo para decir los types
  placeholder: string;
  onPress?: () => void;
  onChangeText: (text: string) => void;
  value?: string; // Optional, in case you want to control the input value
}

const SearchBar = ({ placeholder, onPress, onChangeText, value }: Props) => {
  //============================================================================================================
  //█▀█ █▀▀ ▀█▀ █░█ █▀█ █▄░█
  //█▀▄ ██▄ ░█░ █▄█ █▀▄ █░▀█
  //============================================================================================================
  return (
    <View className="flex-row items-center bg-gray-300 rounded-3xl px-7 pb-1 mx-4 mb-1">
      <Image
        source={search_icon}
        className="size-5"
        resizeMode="contain"
        tintColor="#9ca3af"
      />
      <TextInput
        onPress={onPress}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#9ca3af"
        className="flex-1 ml-2 text-black font-bold"
      />
      {/* ICONO DE LIMPIAR */}
      {value?.length ? (
        <TouchableOpacity onPress={() => onChangeText("")} className="p-1">
          <Image
            source={close_icon}
            className="size-5"
            resizeMode="contain"
            tintColor="#9ca3af"
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default SearchBar;
