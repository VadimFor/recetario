//npm install zustand
//npx expo install @react-native-async-storage/async-storage
//---------------------------------------------------------------
import { User } from "@/props/props";
import { ws_connectWebSocket, ws_disconnectWebSocket } from "@/███ＳＥＲＶＥＲ███/websocket_client";
import { API_changeAvatar, API_login, API_registerUser } from "@/ＡＰＩ_ＣＡＬＬＳ";
import * as ImagePicker from "expo-image-picker";
import { create } from "zustand";
import { useChatStore } from "./chat_Store";
import { useRecipeStore } from "./recipe_Store";

interface AuthState {
  user: User | null;
  isLoading: boolean;

  login: (emailOrUsername : string, password: string) => Promise<void>;
  registerUser: (email : string, username:string, password: string) => Promise<User | null>;
  logout: () => void;
  changeAvatar: () => Promise<void>;

}

export const useAuthStore = create<AuthState>((set,get) => ({
  user: null,
  isLoading: false,

  //█▀▀ █░█ ▄▀█ █▄░█ █▀▀ █▀▀   ▄▀█ █░█ ▄▀█ ▀█▀ ▄▀█ █▀█
  //█▄▄ █▀█ █▀█ █░▀█ █▄█ ██▄   █▀█ ▀▄▀ █▀█ ░█░ █▀█ █▀▄
  changeAvatar: async () => {
    const user = get().user;
    if (!user?.id) return;
    const { recipes } = useRecipeStore.getState();


    // Pick image
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access media is required!");
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 1,
    });
      
    if (result.canceled) return;

    const pickedImageUri = result.assets[0].uri;

    try {
      const avatar_url = await API_changeAvatar(pickedImageUri, user.id);
      console.log("Uploaded avatar URL:", avatar_url);
      const cacheBustedUrl = `${avatar_url}?t=${Date.now()}`;

      set({ user: { ...user, avatar:cacheBustedUrl,} });

      // 2. Update all recipes of this user in recipe store
      useRecipeStore.setState({
        recipes: recipes.map((r) =>
          r.user_id === user.id
            ? { ...r, user_avatar: cacheBustedUrl }
            : r
        ),
      });

    } catch (error) {
      console.error("Avatar upload failed:", error);
      alert("Failed to upload avatar.");
    }
  },

  //█░░ █▀█ █▀▀ █▀█ █░█ ▀█▀
  //█▄▄ █▄█ █▄█ █▄█ █▄█ ░█░
  logout: () => {
    console.log("[AuthStore] Logout.");
    const {clear_user_recipes} = useRecipeStore.getState();
    const {clear_chats} = useChatStore.getState();
    clear_user_recipes();
    ws_disconnectWebSocket();
    clear_chats();
    set({user:null});

  },

  //█░░ █▀█ █▀▀ █ █▄░█
  //█▄▄ █▄█ █▄█ █ █░▀█
  login: async (emailOrUsername: string, password: string) => {
    const { user } = get();

    // Prevent double login
    if (user?.id) {
      console.warn("[AuthStore] User already authenticated. Log out first.");
      return;
    }

    set({ isLoading: true });

    try {
      let db_user: User = await API_login(emailOrUsername, password);

      if (db_user) {

        db_user = { ...db_user, avatar: `${db_user.avatar}?t=${Date.now()}` }; // bust cache

        set({ user: db_user});

        // reconnect websocket with new user
        ws_disconnectWebSocket();
        ws_connectWebSocket(String(db_user.id));

        console.log("[AuthStore] User fetched successfully:", db_user);
      } else {
        throw new Error("No user returned from API");
      }
    } catch (error) {
      console.error("[AuthStore] Error fetching user:", error);
      set({ user: null });
      ws_disconnectWebSocket();
    } finally {
      set({ isLoading: false });
    }
  },

  //█▀█ █▀▀ █▀▀ █ █▀ ▀█▀ █▀▀ █▀█
  //█▀▄ ██▄ █▄█ █ ▄█ ░█░ ██▄ █▀▄
  registerUser: async (email: string, username:string, password: string, ) => {
    const { user } = get();

    // Prevent register when logged
    if (user?.id) {
      console.warn("[AuthStore] User already authenticated. Log out first to register.");
      return null;
    }

    set({ isLoading: true });

    try {
      const reg_user: User = await API_registerUser(email,username, password );

      if (reg_user) {
        set({ user: reg_user});

        // reconnect websocket with new user
        ws_disconnectWebSocket();
        ws_connectWebSocket(String(reg_user.id));

        console.log("[AuthStore] User registered successfully:", reg_user);

        return reg_user;
      } else {
        throw new Error("[AuthStore] No user returned from API");
      }
    } catch (error) {
      console.error("[AuthStore] Error registering user:", error);
      set({ user: null });
      ws_disconnectWebSocket();

      return null;
    } finally {
      set({ isLoading: false });
    }
  },
}));