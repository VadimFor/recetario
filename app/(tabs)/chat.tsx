import { ChatItem } from "@/components/Chat_tab/Chats/ChatItem";
import { UserItem } from "@/components/Chat_tab/Users/UserItem";
import SearchBar from "@/components/SearchBar";
import { ws_subscribeToChats } from "@/███ＳＥＲＶＥＲ███/websocket_client";
import { useAuthStore } from "@/███ＳＴＯＲＥ████/auth_Store";
import { useChatStore } from "@/███ＳＴＯＲＥ████/chat_Store";
import { MessageCircle, Users } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";

const ChatTab = () => {
  const { loading, fetchChats, getFriends } = useChatStore();
  const chats = useChatStore((state) => state.chats);
  const { user } = useAuthStore();

  const [page, setPage] = useState(0); // 0 = Chats, 1 = Users
  const pagerRef = useRef<PagerView>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    getFriends(String(user.id))
      .then((data) => setFriends(data))
      .catch((err) => console.error("Failed to fetch friends:", err));
  }, [user]);

  const chat_participants = chats
    .flatMap((c) => c.participants)
    .filter((p) => String(p.id) !== String(user?.id));
  const chat_participants_unique = Array.from(
    new Map(chat_participants.map((u) => [String(u.id), u])).values()
  );
  const filteredUsers = chat_participants_unique
    .filter(
      (u, idx, self) =>
        idx === self.findIndex((x) => String(x.id) === String(u.id))
    )
    .filter((u) =>
      u.username.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 200);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    if (!user?.id) return;
    fetchChats(String(user.id)).then((fetchedChats) => {
      const chatIds = fetchedChats.map((c) => String(c.chat_id));
      ws_subscribeToChats(chatIds);
    });
  }, [user]);

  const handleFriendChange = (userId: string, added: boolean) => {
    setFriends((prev) => {
      if (added) {
        const userToAdd = chat_participants_unique.find(
          (u) => String(u.id) === userId
        );
        if (userToAdd && !prev.some((f) => String(f.id) === userId)) {
          return [...prev, userToAdd];
        }
      } else {
        return prev.filter((f) => String(f.id) !== userId);
      }
      return prev;
    });
  };

  if (!user?.id) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-white">
        <Text className="text-2xl font-bold mb-2.5 text-gray-800 text-center">
          Debes iniciar sesión para ver tus chats
        </Text>
        <TouchableOpacity
          onPress={() => {
            console.log("Ir a pantalla de login");
          }}
          className="mt-4 bg-green-500 py-3 px-6 rounded-lg"
        >
          <Text className="text-white text-lg">Iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-yellow-600 pt-10 px-5 pb-4">
        <Text className="text-white text-3xl font-bold">Chat</Text>
      </View>

      {/* Buttons Bar */}
      <View className="relative flex-row bg-white shadow-sm">
        <TouchableOpacity
          onPress={() => pagerRef.current?.setPage(0)}
          className="w-1/2 py-3 flex-row justify-center items-center"
        >
          <MessageCircle
            size={20}
            color={page === 0 ? "black" : "gray"}
            fill={page === 0 ? "#ca8a04" : "none"}
          />
          <Text
            className={`ml-2 text-xl font-bold ${
              page === 0 ? "text-yellow-600" : "text-gray-500"
            }`}
          >
            Chats
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => pagerRef.current?.setPage(1)}
          className="w-1/2 py-3 flex-row justify-center items-center"
        >
          <Users
            size={20}
            color={page === 1 ? "black" : "gray"}
            fill={page === 1 ? "#ca8a04" : "none"}
          />
          <Text
            className={`ml-2 text-xl font-bold ${
              page === 1 ? "text-yellow-600" : "text-gray-500"
            }`}
          >
            Users
          </Text>
        </TouchableOpacity>

        {/* Underline */}
        <View
          className="absolute bottom-0 h-0.5 bg-yellow-600"
          style={{
            width: "50%",
            left: `${page * 50}%`,
          }}
        />
      </View>

      {/* Pager View */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        {/* Page 1: Chats */}
        <View key="1" className="flex-1">
          <FlatList
            data={[...chats]
              .filter((chat) => chat.messages && chat.messages.length > 0)
              .sort((a, b) => {
                const aTime = a.messages[0]?.created_at
                  ? new Date(a.messages[0].created_at).getTime()
                  : 0;
                const bTime = b.messages[0]?.created_at
                  ? new Date(b.messages[0].created_at).getTime()
                  : 0;
                return bTime - aTime;
              })}
            keyExtractor={(item) => String(item.chat_id)}
            renderItem={({ item }) => (
              <>
                <ChatItem chat_id={item.chat_id} />
                {item.unread_count > 0 && (
                  <View className="absolute right-3 top-12 bg-slate-500 rounded-full w-7 h-7 items-center justify-center">
                    <Text className="text-white text-base font-bold">
                      {item.unread_count}
                    </Text>
                  </View>
                )}
              </>
            )}
            ListEmptyComponent={
              <View className="p-6 items-center">
                <Text className="text-gray-500 text-base">No chats found.</Text>
              </View>
            }
          />
        </View>

        {/* Page 2: Users */}
        <View key="2" className="flex-1 ">
          <View className="pt-4"></View>
          <SearchBar
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search users"
          />
          <ScrollView className="flex-1">
            {debouncedSearch.trim().length > 0 && (
              <FlatList
                data={filteredUsers}
                keyExtractor={(user) => String(user.id)}
                scrollEnabled={false}
                ListHeaderComponent={
                  <Text className="px-5 pt-4 pb-2 text-lg font-bold text-gray-700">
                    Search Results
                  </Text>
                }
                renderItem={({ item }) => (
                  <UserItem
                    item_user={item}
                    isFriend={friends.some(
                      (friend) => String(friend.id) === String(item.id)
                    )}
                    onFriendChange={handleFriendChange}
                  />
                )}
                ListEmptyComponent={
                  <View className="p-6 items-center">
                    <Text className="text-gray-500 text-base">
                      No users found.
                    </Text>
                  </View>
                }
              />
            )}

            <FlatList
              data={friends}
              keyExtractor={(friend) => String(friend.id)}
              scrollEnabled={false}
              ListHeaderComponent={
                <Text className="px-5 pt-6 pb-2 text-lg font-bold text-gray-700">
                  Friends
                </Text>
              }
              renderItem={({ item }) => (
                <UserItem
                  item_user={item}
                  isFriend={true}
                  onFriendChange={handleFriendChange}
                />
              )}
              ListEmptyComponent={
                <View className="p-6 items-center">
                  <Text className="text-gray-500 text-base">
                    No friends yet.
                  </Text>
                </View>
              }
            />
          </ScrollView>
        </View>
      </PagerView>
    </View>
  );
};

export default ChatTab;
