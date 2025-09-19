import { LOCALHOST_IP } from "@/API_CALLS";
import { useAuthStore } from "@/store/authStore";
import { ChatProps, MessageProp, useChatStore } from "@/store/chatStore";

let socket: WebSocket | null = null;


//se crea un thread nuevo con un bucle infinito que mantiene la conexion abierta al servidor.
export const ws_connectWebSocket = (userId: string) => {

  lastUserId = userId; // store so we know who to reconnect as

  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    console.log("⚡ WebSocket already connected or connecting.");
    return;
  }

  socket = new WebSocket(`ws://${LOCALHOST_IP}:3002`);

  //█▀▀ █▀█ █▄░█ █▄░█ █▀▀ █▀▀ ▀█▀   ▀█▀ █▀█   █▀ █▀▀ █▀█ █░█ █▀▀ █▀█
  //█▄▄ █▄█ █░▀█ █░▀█ ██▄ █▄▄ ░█░   ░█░ █▄█   ▄█ ██▄ █▀▄ ▀▄▀ ██▄ █▀▄
  socket.onopen = () => {
    socket?.send(JSON.stringify({ type: "connect", userId }));
    console.log(`✅ User with id ${userId} connected to WebSocket.`);

    reconnectAttempts = 0; // reset on success

    const { chats } = useChatStore.getState();
    const chatIds = chats.map((c) => String(c.chat_id));
    if (chatIds.length > 0) {
      ws_subscribeToChats(chatIds);
      console.log("🔄 Re-subscribed to chats after reconnect:", chatIds);
    }
  };

  //█▀▄▀█ █▀▀ █▀ █▀ ▄▀█ █▀▀ █▀▀ █▀   █▀▀ █▀█ █▀█ █▀▄▀█   █▀ █▀▀ █▀█ █░█ █▀▀ █▀█
  //█░▀░█ ██▄ ▄█ ▄█ █▀█ █▄█ ██▄ ▄█   █▀░ █▀▄ █▄█ █░▀░█   ▄█ ██▄ █▀▄ ▀▄▀ ██▄ █▀▄
  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.warn(`📩 WebSocket [in client with user_id: ${userId}] received: `, message);

      if (message.type === "message" && String(message.new_message.sender_id) !== String(userId)) {
        useChatStore.getState().addMessageToStore(
          message.chatId,
          message.new_message,
          message.new_Chat
        );
      }
    } catch (err) {
      console.error("Failed to parse WS message:", err);
    }
  };

  //█▀█ █▄░█   █▀▀ █░░ █▀█ █▀ █▀▀   █▀▀ █▀█ █▀█ █▀▄▀█   █▀ █▀▀ █▀█ █░█ █▀▀ █▀█
  //█▄█ █░▀█   █▄▄ █▄▄ █▄█ ▄█ ██▄   █▀░ █▀▄ █▄█ █░▀░█   ▄█ ██▄ █▀▄ ▀▄▀ ██▄ █▀▄
  socket.onclose = (event) => {
    console.log(
      "❌ WebSocket disconnected",
      "code:", event.code,
      "| reason:", event.reason || "(no reason provided) ",
      "| wasClean:", event.wasClean
    );
    socket = null;

    const { user } = useAuthStore.getState();
    if (user?.id){
      scheduleReconnect();
    }
  };
  
  //█▀█ █▄░█   █▀▀ █▀█ █▀█ █▀█ █▀█   █▀▀ █▀█ █▀█ █▀▄▀█   █▀ █▀▀ █▀█ █░█ █▀▀ █▀█
  //█▄█ █░▀█   ██▄ █▀▄ █▀▄ █▄█ █▀▄   █▀░ █▀▄ █▄█ █░▀░█   ▄█ ██▄ █▀▄ ▀▄▀ ██▄ █▀▄
  socket.onerror = (err) => {
    console.error("⚠️ WebSocket error:", err);
  };
};

//█▀ █▀▀ █▄░█ █▀▄   █▀▄▀█ █▀▀ █▀ █▀ ▄▀█ █▀▀ █▀▀   ▀█▀ █▀█   █▀ █▀▀ █▀█ █░█ █▀▀ █▀█
//▄█ ██▄ █░▀█ █▄▀   █░▀░█ ██▄ ▄█ ▄█ █▀█ █▄█ ██▄   ░█░ █▄█   ▄█ ██▄ █▀▄ ▀▄▀ ██▄ █▀▄
export const ws_sendMessage = (chatId: string, new_message : MessageProp, new_Chat? : ChatProps) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        type: "message",
        chatId,
        new_message,
        new_Chat,
      })
    );
  }
};

//█▀ █▀▀ █▄░█ █▀▄   █▀▀ █░░ █▀█ █▀ █▀▀   ▀█▀ █▀█   █▀ █▀▀ █▀█ █░█ █▀▀ █▀█
//▄█ ██▄ █░▀█ █▄▀   █▄▄ █▄▄ █▄█ ▄█ ██▄   ░█░ █▄█   ▄█ ██▄ █▀▄ ▀▄▀ ██▄ █▀▄
export const ws_disconnectWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

export const ws_subscribeToChats = (chatIds: string[]) => {
  if (chatIds.length > 0) { // ✅ only proceed if there are chat IDs
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "subscribe", chatIds }));
      console.log("✅ Subscribed to chats:", chatIds);
    } else {
      console.warn("⚠️ Cannot subscribe, socket not open yet");
    }
  } else {
    console.log("ℹ️ No chats to subscribe to yet");
  }
};

//█▀ █░█ █▀ █▀▀ █▀█ █ █▄▄ █▀▀   ▀█▀ █▀█   █▄░█ █▀▀ █░█░█   █▀▀ █░█ ▄▀█ ▀█▀
//▄█ █▄█ ▄█ █▄▄ █▀▄ █ █▄█ ██▄   ░█░ █▄█   █░▀█ ██▄ ▀▄▀▄▀   █▄▄ █▀█ █▀█ ░█░
export const ws_subscribeToNewChat = (chatId: string, other_user_Id:string) => {
  console.log("SUSCRIBE TO NEW CHATS CALLED FOR chatid: ", chatId);
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "subscribe", chatIds: [chatId], newchat: true, other_user_Id: other_user_Id })); // subscribe to the new chat
    console.log(`Subscribed to new chat ${chatId}`);
  } else {
    console.warn("Cannot subscribe, socket not open yet");
  }
};

//█▀█ █▀▀ █▀▀ █▀█ █▄░█ █▄░█ █▀▀ █▀▀ ▀█▀
//█▀▄ ██▄ █▄▄ █▄█ █░▀█ █░▀█ ██▄ █▄▄ ░█░
let reconnectAttempts = 0;
let reconnectTimeout: number | NodeJS.Timeout | null = null;
let lastUserId: string | null = null;
function scheduleReconnect() {
  if (reconnectTimeout) return; // already scheduled

  const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000); // max 30s
  console.log(`🔄 Attempting reconnect in ${delay / 1000}s...`);

  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    reconnectAttempts++;
    if (lastUserId) {
      ws_connectWebSocket(lastUserId);
    }
  }, delay);
}