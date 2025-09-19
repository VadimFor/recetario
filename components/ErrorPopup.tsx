import React, { useEffect, useState } from "react";
import { Animated, Text } from "react-native";

type Props = {
  message: string;
  onHide?: () => void;
};

const ErrorPopup = ({ message, onHide }: Props) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto-hide after 3 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onHide?.();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  //============================================================================================================
  //█▀█ █▀▀ ▀█▀ █░█ █▀█ █▄░█
  //█▀▄ ██▄ ░█░ █▄█ █▀▄ █░▀█
  //============================================================================================================
  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        position: "absolute",
        top: 50,
        alignSelf: "center",
        backgroundColor: "#f87171", // red-400
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
        {message}
      </Text>
    </Animated.View>
  );
};

export default ErrorPopup;
