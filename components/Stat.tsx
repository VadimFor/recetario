import React from "react";
import { Text, View } from "react-native";

const Stat = ({ icon, value }: { icon: React.ReactNode; value: number }) => (
  <View className="flex-1 flex-row items-center justify-center space-x-1">
    {icon}
    <Text className="font-bold text-gray-500">{value}</Text>
  </View>
);

export default Stat;
