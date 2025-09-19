import { useAuthStore } from "@/███ＳＴＯＲＥ████/auth_Store";
import { useChatStore } from "@/███ＳＴＯＲＥ████/chat_Store";
import { Link } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { formatMessageTime, getRandomAvatar } from "../auxiliares";

export const ChatItem = ({ chat_id }: { chat_id: string | number }) => {
  const { user } = useAuthStore();
  const { chats } = useChatStore();

  // find chat from store
  const chat = chats.find((c) => String(c.chat_id) === String(chat_id));
  if (!chat) return null;

  const avatar = getRandomAvatar(chat.chat_id);
  const displayName = chat.is_group
    ? chat.name || "Group Chat"
    : chat.participants.find((p) => String(p.id) !== String(user?.id))
        ?.username || "Unknown user";

  const last_message_prefix = chat.messages[0]
    ? String(chat.messages[0].sender_id) === String(user?.id)
      ? "You"
      : chat.messages[0].username
    : "";

  const lastMessageText = chat.messages[0]?.content ?? "No messages yet";
  const lastMessageTime = chat.messages[0]
    ? formatMessageTime(chat.messages[0]?.created_at)
    : "";

  //============================================================================================================
  //█▀█ █▀▀ ▀█▀ █░█ █▀█ █▄░█
  //█▀▄ ██▄ ░█░ █▄█ █▀▄ █░▀█
  //============================================================================================================
  return (
    <Link
      href={{
        pathname: "/chats/[chat_id]",
        params: {
          chat_id: String(chat.chat_id),
          displayName: displayName,
          avatar: avatar,
        },
      }}
      asChild
    >
      <TouchableOpacity className="flex-row items-center px-4 py-4 bg-white border-b border-gray-200">
        <Image
          source={{ uri: avatar }}
          className="w-14 h-14 rounded-full mr-4"
        />
        <View className="flex-1">
          <View className="flex-row justify-between items-center">
            <Text className="text-2xl font-semibold">{displayName}</Text>
            <Text className="text-gray-500 text-lg">{lastMessageTime}</Text>
          </View>

          <Text className="text-gray-600 mt-1 text-lg" numberOfLines={1}>
            <Text className="font-bold">{last_message_prefix}</Text>
            {last_message_prefix ? ": " : ""}
            {lastMessageText}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
};
