import { useAuthStore } from "@/███ＳＴＯＲＥ████/auth_Store";
import { API_addFriend, API_create_individual_Chat, API_deleteChat, API_deleteChatMessages, API_fetchChats, API_fetchOlderMessages, API_getFriends, API_markChatAsRead, API_removeFriend, API_sendMessage } from "@/ＡＰＩ_ＣＡＬＬＳ";
import { create } from "zustand";

export type MessageProp = {
  message_id: string;
  sender_id: string;
  username: string;
  content: string;
  created_at: string;
}

//▀█▀ █▄█ █▀█ █▀▀ ▀   █▀▀ █░█ ▄▀█ ▀█▀ █▀█ █▀█ █▀█ █▀█ █▀
//░█░ ░█░ █▀▀ ██▄ ▄   █▄▄ █▀█ █▀█ ░█░ █▀▀ █▀▄ █▄█ █▀▀ ▄█
export type ChatProps = {
  chat_id: string | number;
  is_group: boolean;
  name: string | null;
  participants: { id: string; username: string; email: string }[];
  created_at: string;
  messages: MessageProp[];
  unread_count: number; // ✅ (only for the current user, in front-end)
  all_messages_deleted_at: string |null;
};

//▀█▀ █▄█ █▀█ █▀▀ ▀   █▀▀ █░█ ▄▀█ ▀█▀ █▀ ▀█▀ █▀█ █▀█ █▀▀
//░█░ ░█░ █▀▀ ██▄ ▄   █▄▄ █▀█ █▀█ ░█░ ▄█ ░█░ █▄█ █▀▄ ██▄
type ChatStore = {
  chats: ChatProps[];
  friends: { id: string; username: string; email: string }[];
  loading: boolean;
  error: string | null;

  activeChatId: string | null; // <-- para el chat abierto actualmente
  setActiveChatId: (chatId: string | null) => void;


  // 🆕ＣＨＡＴＳ
  fetchChats: (userId: string) => Promise<ChatProps[]>; 
  createChat: (other_UserId: string, other_username: string, other_email: string) => Promise<ChatProps>; 
  deleteChat: (chatId: string) => Promise<boolean>;        // elimina el chat completo
  markChatAsRead: (chatId: string, userId: string) => Promise<void>;

  // 🆕ＭＥＳＳＡＧＥＳ
  fetchOlderMessages: (
    chatId: string,
    before_this_date: string,
    limit?: number
  ) => Promise<any[]>;
  sendMessage: (chatId: string, content: string) => Promise<MessageProp>;
  deleteChatMessages: (chatId: string) => Promise<boolean>; // elimina solo los mensajes del chat

  // 🆕ＦＲＩＥＮＤＳ
  getFriends: (userId: string) => Promise<any[]>;
  addFriend: (friendId: string) => Promise<boolean>;
  removeFriend: (friendId: string) => Promise<boolean>;

  // 🆕 ＳＴＡＴＥ－ＯＮＬＹ ＡＣＴＩＯＮＳ
  addMessageToStore: (chatId: string,newMessage: MessageProp,newChatIfNotExists?: ChatProps) => void;
  clear_chats: () => void;
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//░██████╗████████╗░█████╗░██████╗░███████╗  ███╗░░░███╗███████╗████████╗██╗░░██╗░█████╗░██████╗░░██████╗/
//██╔════╝╚══██╔══╝██╔══██╗██╔══██╗██╔════╝  ████╗░████║██╔════╝╚══██╔══╝██║░░██║██╔══██╗██╔══██╗██╔════╝/
//╚█████╗░░░░██║░░░██║░░██║██████╔╝█████╗░░  ██╔████╔██║█████╗░░░░░██║░░░███████║██║░░██║██║░░██║╚█████╗░/
//░╚═══██╗░░░██║░░░██║░░██║██╔══██╗██╔══╝░░  ██║╚██╔╝██║██╔══╝░░░░░██║░░░██╔══██║██║░░██║██║░░██║░╚═══██╗/
//██████╔╝░░░██║░░░╚█████╔╝██║░░██║███████╗  ██║░╚═╝░██║███████╗░░░██║░░░██║░░██║╚█████╔╝██████╔╝██████╔╝/
//╚═════╝░░░░╚═╝░░░░╚════╝░╚═╝░░╚═╝╚══════╝  ╚═╝░░░░░╚═╝╚══════╝░░░╚═╝░░░╚═╝░░╚═╝░╚════╝░╚═════╝░╚═════╝░/
//////////////////////////////////////////////////////////////////////////////////////////////////////////
export const useChatStore = create<ChatStore>((set,get) => ({
  chats: [],
  loading: false,
  error: null,
  friends: [],
  activeChatId: null, 

  //Para trackear la pestaña de chat abierta actualmente
  setActiveChatId: (chatId: string | null) => set({ activeChatId: chatId }),
  clear_chats: () => {
    set({chats:[], friends: [], activeChatId: null})
  },

  //=================================
  //░█████╗░██╗░░██╗░█████╗░████████╗
  //██╔══██╗██║░░██║██╔══██╗╚══██╔══╝
  //██║░░╚═╝███████║███████║░░░██║░░░
  //██║░░██╗██╔══██║██╔══██║░░░██║░░░
  //╚█████╔╝██║░░██║██║░░██║░░░██║░░░
  //░╚════╝░╚═╝░░╚═╝╚═╝░░╚═╝░░░╚═╝░░░
  //█▀▀ █▀▀ ▀█▀   █▀▀ █░█ ▄▀█ ▀█▀ █▀
  //█▄█ ██▄ ░█░   █▄▄ █▀█ █▀█ ░█░ ▄█
  fetchChats: async () => {
    const { user } = useAuthStore.getState();
    if (!user?.id) return [];

    try {
      set({ loading: true, error: null });

      const data = await API_fetchChats(String(user.id));

      // Map the data to match ChatProps structure
      const mappedChats: ChatProps[] = data.map((chat: any) => ({
        chat_id: chat.chat_id,
        is_group: chat.is_group,
        name: chat.name,
        created_at: chat.created_at,
        participants: chat.participants.map((p: any) => ({
          id: String(p.id),
          username: p.username,
          email: p.email,
        })),
        messages: (chat.last_messages || []).map((msg: any) => ({
          message_id: String(msg.id),
          sender_id: String(msg.sender_id),
          username:
            chat.participants.find((p: any) => String(p.id) === String(msg.sender_id))
              ?.username || "Unknown",
          content: msg.content,
          created_at: msg.created_at,
        })),
        unread_count: Number(chat.unread_count) || 0,
        all_messages_deleted_at: chat.all_messages_deleted_at,

      }));

      set({ chats: mappedChats, loading: false });
      return mappedChats;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error fetching chats",
        loading: false,
      });
      return [];
    }
  },

  //█▀▄ █▀▀ █░░ █▀▀ ▀█▀ █▀▀   █▀▀ █░█ ▄▀█ ▀█▀
  //█▄▀ ██▄ █▄▄ ██▄ ░█░ ██▄   █▄▄ █▀█ █▀█ ░█░
  deleteChat: async (chatId: string) => {
  try {
    const { chats } = get();

    // Llamada al API para borrar el chat
    await API_deleteChat(chatId);

    // Actualizar el estado local eliminando el chat
    set({
      chats: chats.filter((chat) => String(chat.chat_id) !== String(chatId)),
    });

    console.info(`(chatStore.deleteChat) Chat ${chatId} deleted locally`);
    return true;
  } catch (err) {
    console.error("(chatStore.deleteChat) Error:", err);
    return false;
    }
  },

  //█▀▀ █▀█ █▀▀ ▄▀█ ▀█▀ █▀▀  █▀▀ █░█ ▄▀█ ▀█▀
  //█▄▄ █▀▄ ██▄ █▀█ ░█░ ██▄  █▄▄ █▀█ █▀█ ░█░
  createChat: async (other_UserId: string, other_username: string, other_email: string) => {
    const { user } = useAuthStore.getState();
    if (!user?.id) throw new Error("[store.createChat]no user id to create chat");

    try {
      set({ loading: true, error: null });

      // Llamada API
      const result = await API_create_individual_Chat(String(user.id), other_UserId);

      // Nuevo chat
      const new_Chat: ChatProps = {
        chat_id: String(result.chat_id),
        is_group: false,
        name: null,
        participants: [
          { id: String(user.id), username: user.username, email: user.email },
          { id: other_UserId, username: other_username, email: other_email },
        ],
        messages: [],
        created_at: new Date().toISOString(),
        unread_count: 0,
        all_messages_deleted_at: null,
      };

      //console.error("[store] new chat id: ", new_Chat.chat_id);

      // Insertar solo si no existe
      set((state) => {
        const exists = state.chats.some((chat) => String(chat.chat_id) === String(new_Chat.chat_id));
        return exists
          ? { loading: false } // ya está, no duplicar
          : { chats: [...state.chats, new_Chat], loading: false };
      });

      return new_Chat;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to create chat",
        loading: false,
      });
      throw err;
    }
  },
 
  //█▀▄▀█ ▄▀█ █▀█ █▄▀   █▀▀ █░█ ▄▀█ ▀█▀   ▄▀█ █▀   █▀█ █▀▀ ▄▀█ █▀▄
  //█░▀░█ █▀█ █▀▄ █░█   █▄▄ █▀█ █▀█ ░█░   █▀█ ▄█   █▀▄ ██▄ █▀█ █▄▀
  markChatAsRead: async (chatId: string, userId: string) => {
    try {
      await API_markChatAsRead(chatId, userId);

      // ✅ Update local state in the store
      set((state) => ({
        chats: state.chats.map((chat) =>
          String(chat.chat_id) === String(chatId)
            ? { ...chat, unread_count: 0 }
            : chat
        ),
      }));
    } catch (error) {
      console.error("(chatStore.markChatAsRead) Error:", error);
    }
  },


  //░█████╗░██╗░░██╗░█████╗░████████╗  ███╗░░░███╗███████╗░██████╗░██████╗░█████╗░░██████╗░███████╗░██████╗
  //██╔══██╗██║░░██║██╔══██╗╚══██╔══╝  ████╗░████║██╔════╝██╔════╝██╔════╝██╔══██╗██╔════╝░██╔════╝██╔════╝
  //██║░░╚═╝███████║███████║░░░██║░░░  ██╔████╔██║█████╗░░╚█████╗░╚█████╗░███████║██║░░██╗░█████╗░░╚█████╗░
  //██║░░██╗██╔══██║██╔══██║░░░██║░░░  ██║╚██╔╝██║██╔══╝░░░╚═══██╗░╚═══██╗██╔══██║██║░░╚██╗██╔══╝░░░╚═══██╗
  //╚█████╔╝██║░░██║██║░░██║░░░██║░░░  ██║░╚═╝░██║███████╗██████╔╝██████╔╝██║░░██║╚██████╔╝███████╗██████╔╝
  //░╚════╝░╚═╝░░╚═╝╚═╝░░╚═╝░░░╚═╝░░░  ╚═╝░░░░░╚═╝╚══════╝╚═════╝░╚═════╝░╚═╝░░╚═╝░╚═════╝░╚══════╝╚═════╝░

  //█▀▀ █▀▀ ▀█▀   █▀█ █░░ █▀▄ █▀▀ █▀█   █▀▄▀█ █▀▀ █▀ █▀ ▄▀█ █▀▀ █▀▀ █▀
  //█▄█ ██▄ ░█░   █▄█ █▄▄ █▄▀ ██▄ █▀▄   █░▀░█ ██▄ ▄█ ▄█ █▀█ █▄█ ██▄ ▄█
  fetchOlderMessages: async (chatId, before_this_date, limit = 20) => {
    try {
      const { chats } = get();
      const olderMessages = await API_fetchOlderMessages(chatId, before_this_date, String(limit));

      // Append older messages to the right chat
      const updatedChats = chats.map((chat) => {
        if (String(chat.chat_id) === String(chatId)) {
          return {
            ...chat,
            messages: [...chat.messages, ...olderMessages],
          };
        }
        return chat;
      });

      set({ chats: updatedChats });

      return olderMessages; // ✅ return the fetched messages
    } catch (err) {
      console.error("(fetchOlderMessages) Error:", err);
      set({ error: err instanceof Error ? err.message : "Failed to fetch older messages" });
      return []; // return empty array on error
    }
  },

  //█▀ █▀▀ █▄░█ █▀▄   █▀▄▀█ █▀▀ █▀ █▀ ▄▀█ █▀▀ █▀▀
  //▄█ ██▄ █░▀█ █▄▀   █░▀░█ ██▄ ▄█ ▄█ █▀█ █▄█ ██▄
  sendMessage: async (chatId: string, content: string) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user?.id) throw new Error("(chatstore) No user to create new message");

      //ＣＲＥＡＴＥ ＭＥＳＳＡＧＥ ＩＮ ＴＨＥ ＤＢ
      const new_message = await API_sendMessage(
        chatId,
        String(user.id),
        content
      );

      // Shape it to MessageProp
      const new_message_typed: MessageProp = {
        message_id: String(new_message.message_id),
        sender_id: String(user.id),
        username: user.username,
        content,
        created_at: new_message.created_at,
      };

      // ✅ Use the unified store action
      useChatStore.getState().addMessageToStore(chatId, new_message_typed);

      console.log(
        "(chat_store,sendMessage) Message created and added:",
        new_message_typed
      );

      return new_message_typed;
    } catch (err) {
      // Check for the 404-specific error
      if (err instanceof Error && err.message === "Chat not found") {
        set({ error: "This chat was deleted. You cannot send messages." });  
        set((state) => ({ // Optionally, remove the chat from local state
          chats: state.chats.filter((chat) => String(chat.chat_id) !== String(chatId)),
        }));
        throw new Error("CHAT_DELETED"); 
      }

      console.error("(chat_store,sendMessage) Error:", err);
      set({ error: err instanceof Error ? err.message : "Failed to send message" });
      throw err;
    }
  },

  //▄▀█ █▀▄ █▀▄   █▀▄▀█ █▀▀ █▀ █▀ ▄▀█ █▀▀ █▀▀
  //█▀█ █▄▀ █▄▀   █░▀░█ ██▄ ▄█ ▄█ █▀█ █▄█ ██▄
  addMessageToStore: (chatId, newMessage, newChatIfNotExists) =>
    
    set((state) => {
      let chats = [...state.chats];
      const { user } = useAuthStore.getState();

      //ＣＲＥＡＴＥ ＣＨＡＴ ＩＦ ＮＯＴ ＦＯＵＮＤ （ＯＮＬＹ ＩＮ ＴＨＥ ＳＴＯＲＥ， ＮＯＴ ＤＢ）
      let chat = chats.find((c) => String(c.chat_id) === String(chatId));
      if (!chat && newChatIfNotExists) {

        //Obtengo el id del otro participante
        const other_participant_id = newChatIfNotExists.participants.find(
          (p) => String(p.id) !== String(user?.id)
        )?.id;

        //Si ya había chats con los mismos participantes de antes pero con diferente chatID, siginifica
        //que los chats de antes fueron borrados por el otro usuario y se ha creado otro chat con un nuevo chat_id
        //por lo que elimino los chats anteriores que contenia a ambos usuarios y me quedo con el chat nuevo.
        chats = [
          newChatIfNotExists,
          ...chats.filter(
            (c) =>
              c.is_group ||
              !(
                c.participants.some((p) => String(p.id) === String(user?.id)) &&
                c.participants.some((p) => String(p.id) === String(other_participant_id))
              )
          ),
        ];
        chat = newChatIfNotExists;
        //useChatStore.getState().setActiveChatId(String(newChatIfNotExists.chat_id));
        
      }

      const updatedChats = chats.map((c) => {
        if (String(c.chat_id) === String(chatId)) {
          const Message_already_exists = c.messages.some(
            (msg) => String(msg.message_id) === String(newMessage.message_id)
          );

          if (Message_already_exists) {
            console.warn("⚠️(chat_store,addMessageToStore) Message exists, message_id: ", newMessage.message_id , " | chat_id: ", chat?.chat_id, " | user_id: ", user?.id, " | sender_id: ", newMessage.sender_id);
            console.warn("El otro usuario posiblemente haya borrado los mensajes, por lo que se borran en este.");
            //return c;
          }

          console.log("✅(chat_store,addMessageToStore) Message added, message_id: ", newMessage.message_id , " | chat_id: ", chat?.chat_id, " | user_id: ", user?.id, " | sender_id: ", newMessage.sender_id);

          const AmITheSender = String(newMessage.sender_id) === String(user?.id);
          const isChatOpen = String(state.activeChatId) === String(chatId);

          return {
            ...c,
            messages: Message_already_exists ? [newMessage] : [newMessage, ...c.messages],
            unread_count: !AmITheSender && !isChatOpen ? c.unread_count + 1 : c.unread_count,
          };
        }
        return c;
    });

    return { chats: updatedChats };
  }),


  //█▀▄ █▀▀ █░░ █▀▀ ▀█▀ █▀▀   █▀▀ █░█ ▄▀█ ▀█▀   █▀▄▀█ █▀▀ █▀ █▀ ▄▀█ █▀▀ █▀▀ █▀
  //█▄▀ ██▄ █▄▄ ██▄ ░█░ ██▄   █▄▄ █▀█ █▀█ ░█░   █░▀░█ ██▄ ▄█ ▄█ █▀█ █▄█ ██▄ ▄█
  deleteChatMessages: async (chatId: string) => {
    try {
      const { chats } = get();

      const deletedDate = new Date().toISOString();

      // Llamada al API para borrar mensajes
      await API_deleteChatMessages(chatId, deletedDate);

      // Actualizar el estado local, dejando el chat pero vaciando los mensajes
      set({
        chats: chats.map((chat) =>
          String(chat.chat_id) === String(chatId)
            ? { 
              ...chat, 
              messages: [], 
              unread_count: 0,
              all_messages_deleted_at: deletedDate,
            }
            : chat
        ),
      });

      console.info(`(chatStore.cleanChatMessages) Messages in chat ${chatId} cleared locally`);
      return true;
    } catch (err) {
      console.error("(chatStore.cleanChatMessages) Error:", err);
      return false;
    }
  },
  
  //░█████╗░██╗░░██╗░█████╗░████████╗  ███████╗██████╗░██╗███████╗███╗░░██╗██████╗░░██████╗
  //██╔══██╗██║░░██║██╔══██╗╚══██╔══╝  ██╔════╝██╔══██╗██║██╔════╝████╗░██║██╔══██╗██╔════╝
  //██║░░╚═╝███████║███████║░░░██║░░░  █████╗░░██████╔╝██║█████╗░░██╔██╗██║██║░░██║╚█████╗░
  //██║░░██╗██╔══██║██╔══██║░░░██║░░░  ██╔══╝░░██╔══██╗██║██╔══╝░░██║╚████║██║░░██║░╚═══██╗
  //╚█████╔╝██║░░██║██║░░██║░░░██║░░░  ██║░░░░░██║░░██║██║███████╗██║░╚███║██████╔╝██████╔╝
  //░╚════╝░╚═╝░░╚═╝╚═╝░░╚═╝░░░╚═╝░░░  ╚═╝░░░░░╚═╝░░╚═╝╚═╝╚══════╝╚═╝░░╚══╝╚═════╝░╚═════╝░
  
  //█▀▀ █▀▀ ▀█▀   █▀▄▀█ █▄█   █▀▀ █▀█ █ █▀▀ █▄░█ █▀▄ █▀
  //█▄█ ██▄ ░█░   █░▀░█ ░█░   █▀░ █▀▄ █ ██▄ █░▀█ █▄▀ ▄█
  getFriends: async (userId: string) => {
    try {
      const data = await API_getFriends(userId);
      set({ friends: data });
      return data;
    } catch (err) {
      console.error("(chatStore.getFriends) Error:", err);
      return [];
    }
  },

  //▄▀█ █▀▄ █▀▄   █▀▀ █▀█ █ █▀▀ █▄░█ █▀▄
  //█▀█ █▄▀ █▄▀   █▀░ █▀▄ █ ██▄ █░▀█ █▄▀
  addFriend: async (friendId: string) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user?.id) return false;

      await API_addFriend(String(user.id), friendId);

      // update local friends state
      set((state) => ({
        friends: [...state.friends, { id: friendId, username: `User ${friendId}`, email: "" }]
      }));

      console.info(`(chatStore.addFriend) Friend ${friendId} added for user ${user.id}`);
      return true;
    } catch (err) {
      console.error("(chatStore.addFriend) Error:", err);
      return false;
    }
  },

  //█▀█ █▀▀ █▀▄▀█ █▀█ █░█ █▀▀   █▀▀ █▀█ █ █▀▀ █▄░█ █▀▄
  //█▀▄ ██▄ █░▀░█ █▄█ ▀▄▀ ██▄   █▀░ █▀▄ █ ██▄ █░▀█ █▄▀
  removeFriend: async (friendId: string) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user?.id) return false;

      // Call API to remove friend
      await API_removeFriend(String(user.id), friendId);

      // Update local friends state
      set((state) => ({
        friends: state.friends.filter((f) => String(f.id) !== String(friendId)),
      }));

      console.info(`(chatStore.removeFriend) Friend ${friendId} removed for user ${user.id}`);
      return true;
    } catch (err) {
      console.error("(chatStore.removeFriend) Error:", err);
      return false;
    }
  },

}));  


