import { Stack } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import "../style/global.css";

export default function RootLayout() {
  return (
    <PaperProvider>
      {/* Para poder poner el menú desplegable en los chats (los 3 puntitos) */}
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="recetas/[id]"
          options={{
            title: "Detalles de la receta",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="chats/[chat_id]"
          options={{
            title: "",
            headerShown: true,
          }}
        />
      </Stack>
    </PaperProvider>
  );
}
