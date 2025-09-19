import { ConfirmModal } from "@/components/MODALS/ConfirmModal";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { Link } from "expo-router";
import { UserPlus } from "lucide-react-native";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { getRandomAvatar } from "../auxiliares";

export const UserItem = ({
  item_user,
  isFriend,
  onFriendChange,
}: {
  item_user: any;
  isFriend: boolean;
  onFriendChange?: (userId: string, added: boolean) => void;
}) => {
  const { chats, addFriend, removeFriend } = useChatStore();
  const { user } = useAuthStore();
  const [modalVisible, setModalVisible] = useState(false);

  const existingChat = chats.find(
    (c) =>
      !c.is_group &&
      c.participants.some((p) => String(p.id) === String(item_user.id))
  );
  const chatId = existingChat ? String(existingChat.chat_id) : `TEMP_CHAT`;
  const avatar = getRandomAvatar(item_user.id);

  const handleAddFriend = async () => {
    if (!user?.id) return;
    await addFriend(String(item_user.id));
    onFriendChange?.(String(item_user.id), true);
  };

  const handleRemoveFriend = async () => {
    if (!user?.id) return;
    await removeFriend(String(item_user.id));
    onFriendChange?.(String(item_user.id), false);
  };

  return (
    <View className="flex-row items-center px-5 py-4 border-b border-gray-400 bg-white">
      <Link
        href={{
          pathname: "/chats/[chat_id]",
          params: {
            chat_id: chatId,
            displayName: item_user.username,
            other_user_id: item_user.id,
            user_email: item_user.email,
            avatar,
          },
        }}
        asChild
      >
        <TouchableOpacity className="flex-row items-center flex-1">
          <Image
            source={{ uri: avatar }}
            className="w-16 h-16 rounded-full mr-5"
          />
          <Text className="text-xl font-semibold">{item_user.username}</Text>
        </TouchableOpacity>
      </Link>

      {!isFriend ? (
        <TouchableOpacity
          onPress={handleAddFriend}
          className="flex-row items-center px-4 py-2 rounded-full bg-blue-600 ml-3"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 6,
          }}
        >
          <UserPlus size={18} color="white" />
          <Text className="text-white font-medium ml-2 text-sm">Add</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="flex-row items-center px-4 py-2 rounded-full bg-red-500 ml-3"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 6,
          }}
        >
          <UserPlus size={18} color="white" />
          <Text className="text-white font-medium ml-2 text-sm">Remove</Text>
        </TouchableOpacity>
      )}

      <ConfirmModal
        visible={modalVisible}
        message={`Do you want to remove ${item_user.username}?`}
        onConfirm={async () => {
          await handleRemoveFriend();
          setModalVisible(false);
        }}
        onCancel={() => setModalVisible(false)}
        confirmText="Remove"
        cancelText="Cancel"
        autoCloseTimeout={4000} // closes after 4 seconds
      />
    </View>
  );
};
