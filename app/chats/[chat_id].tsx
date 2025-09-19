import {
  ws_sendMessage,
  ws_subscribeToNewChat,
} from "@/SERVER/websocket_client";
import { useAuthStore } from "@/store/authStore";
import { ChatProps, MessageProp, useChatStore } from "@/store/chatStore";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { ArrowLeft, MoreVertical, Send } from "lucide-react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Divider, Menu, Provider } from "react-native-paper";

import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ChatDetails = () => {
  const { chat_id, displayName, other_user_id, user_email, avatar } =
    useLocalSearchParams<{
      chat_id: string;
      displayName: string;
      other_user_id: string;
      user_email: string;
      avatar: string;
    }>();

  const [chatDeleted, setChatDeleted] = useState(false);
  const [chatDeleted_countdown, chatDeleted_setCountdown] = useState(8); // seconds

  const { user } = useAuthStore();
  const { chats, fetchOlderMessages, createChat, markChatAsRead, sendMessage } =
    useChatStore();
  const [message_content, setMessage] = useState("");
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true); // assume true at start
  const [creatingChat, setCreatingChat] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const navigation = useNavigation();

  const currentChat = chats.find((c) => String(c.chat_id) === String(chat_id));
  const setActiveChatId = useChatStore((s) => s.setActiveChatId);

  useEffect(() => {
    //Este useEffect solo es para cuando el otro usuario borra el chat y escribe en el nuevo chat
    //y que me rediriga al nuevo chat.
    if (!user?.id || !other_user_id) return;

    const foundChat = chats.find(
      (c) =>
        !c.is_group &&
        c.participants.some((p) => String(p.id) === String(user.id)) &&
        c.participants.some((p) => String(p.id) === String(other_user_id))
    );

    if (
      foundChat &&
      (chat_id === "TEMP_CHAT" || String(chat_id) !== String(foundChat.chat_id))
    ) {
      navigation.setParams({ chat_id: foundChat.chat_id } as any);
    }
  }, [chats]);

  useEffect(() => {
    if (!chat_id || !user?.id) return;

    if ((currentChat?.unread_count ?? 0) > 0) {
      markChatAsRead(String(chat_id), String(user.id));
    }
    setActiveChatId(chat_id); // set when page mounts

    return () => setActiveChatId(null); // clear when page unmounts
  }, [chat_id]);

  const isTemporaryChat = !currentChat;

  console.warn("Chat details page updated in user: ", user?.id);

  const participantNames = isTemporaryChat
    ? ""
    : currentChat.participants
        .map((p) => (String(p.id) === String(user?.id) ? "Me" : p.username))
        .join(", ");

  //█░█ █▀▀ ▄▀█ █▀▄ █▀▀ █▀█
  //█▀█ ██▄ █▀█ █▄▀ ██▄ █▀▄
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View className="flex-row items-center ml-[-8]">
          <Image
            source={{ uri: avatar }}
            className="w-11 h-11 rounded-full mr-2"
          />
          {currentChat?.is_group ? (
            <View className="flex-1 flex-col">
              <Text className="text-lg font-semibold">{displayName}</Text>
              <Text className="text-sm text-gray-500" numberOfLines={1}>
                {participantNames}
              </Text>
            </View>
          ) : (
            <View>
              <Text className="text-lg font-bold">{displayName}</Text>
              <Text className="text-xl text-black-400 mt-0.5">
                Chat id: {chat_id}
              </Text>
            </View>
          )}
        </View>
      ),
      headerTitleAlign: "left",
      headerRight: () => (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              style={{ paddingRight: 10 }}
            >
              <MoreVertical size={26} color="black" />
            </TouchableOpacity>
          }
        >
          {/*
          █▀▄▀█ █▀▀ █▄░█ █░█ ▀   █▀▄ █▀▀ █░░ █▀▀ ▀█▀ █▀▀   █▀▀ █░█ ▄▀█ ▀█▀
          █░▀░█ ██▄ █░▀█ █▄█ ▄   █▄▀ ██▄ █▄▄ ██▄ ░█░ ██▄   █▄▄ █▀█ █▀█ ░█░ */}
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              if (!chat_id) return;

              Alert.alert(
                "Delete Chat",
                "Are you sure you want to delete this chat? This cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                      try {
                        const success = await useChatStore
                          .getState()
                          .deleteChat(String(chat_id));
                        if (success) navigation.goBack();
                      } catch (err) {
                        console.error(
                          "[ChatDetails] Error deleting chat:",
                          err
                        );
                      }
                    },
                  },
                ]
              );
            }}
            title="Delete chat"
          />
          <Divider />
          {/*
          █▀▄▀█ █▀▀ █▄░█ █░█ ▀   █▀▄ █▀▀ █░░ █▀▀ ▀█▀ █▀▀   █▀▄▀█ █▀▀ █▀ █▀ ▄▀█ █▀▀ █▀▀ █▀
          █░▀░█ ██▄ █░▀█ █▄█ ▄   █▄▀ ██▄ █▄▄ ██▄ ░█░ ██▄   █░▀░█ ██▄ ▄█ ▄█ █▀█ █▄█ ██▄ ▄█ */}
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              if (!chat_id) return;

              Alert.alert(
                "Clear Messages",
                "Are you sure you want to clear all messages in this chat?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Yes",
                    style: "destructive",
                    onPress: async () => {
                      try {
                        const success = await useChatStore
                          .getState()
                          .deleteChatMessages(String(chat_id));
                        if (success)
                          console.log(
                            "[ChatDetails] Messages cleared successfully"
                          );
                      } catch (err) {
                        console.error(
                          "[ChatDetails] Error clearing messages:",
                          err
                        );
                      }
                    },
                  },
                ]
              );
            }}
            title="Clear messages"
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              console.log("Block user pressed");
            }}
            title="Block user"
          />
        </Menu>
      ),
    });
  }, [
    navigation,
    displayName,
    avatar,
    participantNames,
    currentChat?.is_group,
    menuVisible,
  ]);

  //█░█ ▄▀█ █▄░█ █▀▄ █░░ █▀▀   █▀ █▀▀ █▄░█ █▀▄
  //█▀█ █▀█ █░▀█ █▄▀ █▄▄ ██▄   ▄█ ██▄ █░▀█ █▄▀
  const handleSend = async () => {
    if (!message_content.trim() || !user) return;

    if (creatingChat) {
      console.warn("Chat is being created. Please wait...");
      return;
    }

    try {
      if (isTemporaryChat) {
        setCreatingChat(true);

        const new_Chat: ChatProps = await createChat(
          other_user_id,
          displayName,
          user_email
        );
        console.log("[handleSend] New chat created:", new_Chat);

        if (new_Chat) {
          navigation.setParams({ chat_id: new_Chat.chat_id } as any);

          const new_message: MessageProp = await sendMessage(
            String(new_Chat.chat_id),
            message_content
          );
          if (new_message) {
            //console.log("new chat id: ", newChat.chat_id);
            ws_subscribeToNewChat(
              String(new_Chat.chat_id),
              String(other_user_id)
            );
            ws_sendMessage(String(new_Chat.chat_id), new_message, new_Chat);
          }
        } else {
          console.error("(handleSend)Failed to create chat");
        }

        setCreatingChat(false);
      } else {
        const new_message: MessageProp = await sendMessage(
          chat_id,
          message_content
        );
        if (new_message) {
          console.log("[handleSend] Message sent in chat ID:", chat_id);
          ws_sendMessage(chat_id, new_message);
        }
      }
    } catch (err) {
      console.error("Failed to send message:", err);

      // Check if chat was deleted and navigate away
      if (err instanceof Error && err.message === "CHAT_DELETED") {
        console.warn("Chat deleted by the other user.");
        setChatDeleted(true);

        // Start countdown
        let seconds = 3;
        chatDeleted_setCountdown(seconds);
        const interval = setInterval(() => {
          seconds -= 1;
          chatDeleted_setCountdown(seconds);
          if (seconds <= 0) {
            clearInterval(interval);
            navigation.goBack();
          }
        }, 1000);
        return;
      }
    } finally {
      setCreatingChat(false);
      setMessage("");
    }
  };

  //█▀▀ █▀▀ ▀█▀ █▀▀ █░█   █▀█ █░░ █▀▄ █▀▀ █▀█
  //█▀░ ██▄ ░█░ █▄▄ █▀█   █▄█ █▄▄ █▄▀ ██▄ █▀▄
  const fetchOlder = async () => {
    if (!currentChat) return;

    if (loadingOlderMessages) return;
    if (!hasMoreMessages) return;
    if (currentChat.messages.length < 20) return;

    try {
      setLoadingOlderMessages(true);

      const oldestMessage =
        currentChat.messages[currentChat.messages.length - 1];

      // ✅ Normalize date to ISO string for Postgres
      const beforeDate = new Date(oldestMessage.created_at).toISOString();

      const fetched = await fetchOlderMessages(chat_id, beforeDate, 20);

      if (!fetched || fetched.length < 20) {
        setHasMoreMessages(false);
      }
    } finally {
      setLoadingOlderMessages(false);
    }
  };
  /*█▀█ █▀▀ ▀█▀ █░█ █▀█ █▄░█
    █▀▄ ██▄ ░█░ █▄█ █▀▄ █░▀█*/
  return (
    <Provider>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        {/*
        █▀▄▀█ █▀▀ █▀ █▀ ▄▀█ █▀▀ █▀▀ █▀   █░░ █ █▀ ▀█▀
        █░▀░█ ██▄ ▄█ ▄█ █▀█ █▄█ ██▄ ▄█   █▄▄ █ ▄█ ░█░*/}

        {chatDeleted && (
          <View className="absolute inset-0 flex-1 justify-center items-center bg-white/80 z-50">
            <View className="bg-red-100 border border-red-400 rounded-lg p-5 mx-6 shadow-lg">
              <Text className="text-red-700 text-center font-semibold text-lg">
                This chat was recently deleted by {displayName}.
              </Text>
              <Text className="text-red-600 text-center mt-2 text-base">
                Leaving in {chatDeleted_countdown}...
              </Text>
            </View>
          </View>
        )}

        <FlatList
          data={currentChat?.messages}
          keyExtractor={(item) => `${chat_id}_${item.message_id}`}
          renderItem={({ item }) => {
            const isMe = item.username === user?.username;
            return (
              <View
                className={`m-2 px-4 py-3 rounded-2xl max-w-[80%] shadow-sm ${
                  isMe ? "bg-green-600 self-end" : "bg-gray-200 self-start"
                }`}
              >
                {!isMe && (
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    {item.username}
                  </Text>
                )}
                <Text
                  className={`text-lg leading-6 ${
                    isMe ? "text-white" : "text-gray-900"
                  }`}
                >
                  {item.content}
                </Text>
                <Text
                  className={`text-xs mt-2 self-end ${
                    isMe ? "text-green-100" : "text-gray-500"
                  }`}
                >
                  {new Date(item.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            );
          }}
          contentContainerStyle={{ paddingVertical: 10 }}
          inverted
          onEndReached={fetchOlder}
          onEndReachedThreshold={0.05}
          ListHeaderComponent={
            currentChat?.all_messages_deleted_at ? (
              <View className="items-center my-2">
                <Text className="text-xs text-gray-500 italic">
                  Messages cleared on{" "}
                  {new Date(currentChat.all_messages_deleted_at).toLocaleString(
                    [],
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-10">
              <Text className="text-gray-400 text-lg">
                No messages. Start the conversation!
              </Text>
            </View>
          }
          ListFooterComponent={
            loadingOlderMessages ? (
              <Text className="text-center text-gray-400 py-2">Loading...</Text>
            ) : !hasMoreMessages ? (
              <Text className="text-center text-gray-400 py-1">
                {/*No older messages*/}
              </Text>
            ) : null
          }
        />

        {/* █▄▄ ▄▀█ █▀▀ █▄▀   █▄▄ █░█ ▀█▀ ▀█▀ █▀█ █▄░█
            █▄█ █▀█ █▄▄ █░█   █▄█ █▄█ ░█░ ░█░ █▄█ █░▀█ */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute bottom-20 left-4 bg-black/80 p-3 rounded-full shadow-lg"
        >
          <ArrowLeft size={22} color="white" />
        </TouchableOpacity>

        {/* █ █▄░█ █▀█ █░█ ▀█▀
            █ █░▀█ █▀▀ █▄█ ░█░ */}
        <View className="flex-row items-center px-3 py-2 bg-white border-t border-gray-200">
          <TextInput
            value={message_content}
            onChangeText={setMessage}
            placeholder="Type a message"
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-base"
          />
          <TouchableOpacity
            onPress={handleSend}
            className="ml-2 bg-yellow-600 p-3 rounded-full"
          >
            <Send size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Provider>
  );
};

export default ChatDetails;
