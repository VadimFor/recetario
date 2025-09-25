import { WebSocketServer } from "ws";


//█▀▀ █░░ █▀█ █▄▄ ▄▀█ █░░   █░█ ▄▀█ █▀█ █ ▄▀█ █▄▄ █░░ █▀▀ █▀
//█▄█ █▄▄ █▄█ █▄█ █▀█ █▄▄   ▀▄▀ █▀█ █▀▄ █ █▀█ █▄█ █▄▄ ██▄ ▄█
// {chat_id : cliente1,cliente2,cliente3}
//este map contendrá el chat id y los clientes conectados a ese chat id
const GLOBAL_chat_and_Subscribers = new Map(); //{ {chatId_1 : clientSocket1, clientSocket2, ...}, {chatId_2 : clientSocket2}, ... }
const GLOBAL_userid_of_Sockets = new Map(); // { userId : clientSocket }

export const PORT = 3002;

// Create WebSocket server on port 3001
const webSocketServer = new WebSocketServer({ port: PORT });

// IMPORTANTE==================================================================================
//Cuando un cliente se conecta al servidor websocket esta función lo maneja personalmente.
//Por eso podemos tener variables "locales" como subscribedChatIds, ya que cada cliente tendrá su propia copia de esa variable.
//=============================================================================================
webSocketServer.on("connection", (clientSocket) => {
  console.log("New client connected");

  //█▀▀ █░░ █ █▀▀ █▄░█ ▀█▀   █░█ ▄▀█ █▀█ █ ▄▀█ █▄▄ █░░ █▀▀ █▀
  //█▄▄ █▄▄ █ ██▄ █░▀█ ░█░   ▀▄▀ █▀█ █▀▄ █ █▀█ █▄█ █▄▄ ██▄ ▄█
  const CLIENT_subscribedChatIds = new Set();
  let CLIENT_suscribed_user_id = null;

  //█▀▄▀█ █▀▀ █▀ █▀ ▄▀█ █▀▀ █▀▀ █▀   █▀▀ █▀█ █▀█ █▀▄▀█   █▀▀ █░░ █ █▀▀ █▄░█ ▀█▀
  //█░▀░█ ██▄ ▄█ ▄█ █▀█ █▄█ ██▄ ▄█   █▀░ █▀▄ █▄█ █░▀░█   █▄▄ █▄▄ █ ██▄ █░▀█ ░█░
  clientSocket.on("message", (rawData) => {
    let message;
    try {
      message = JSON.parse(rawData.toString());
    } catch {
      console.error("Invalid JSON:", rawData.toString());
      return;
    }
    console.log("type: ", message.type, " | message: " , message );

    //█▀ █░█ █▄▄ █▀ █▀▀ █▀█ █ █▄▄ █▀▀
    //▄█ █▄█ █▄█ ▄█ █▄▄ █▀▄ █ █▄█ ██▄
    if (message.type === "subscribe" && Array.isArray(message.chatIds)) {

      if(message.newchat){
        console.log("NEW CHAT MESSAGE /n ========================================");
      }
      
      if (!CLIENT_suscribed_user_id) { //SOLO SE ENTRA AQUI AL INICIAR LA APP EL CLIENTE
        CLIENT_suscribed_user_id = message.userId;
        GLOBAL_userid_of_Sockets.set(message.userId, clientSocket); // map userId → socket
      }
      
      message.chatIds.forEach((chatId) => { //RECORRO EL ARRAY DE CHAT IDS PASADO POR ARGS
        if (!GLOBAL_chat_and_Subscribers.has(chatId)) GLOBAL_chat_and_Subscribers.set(chatId, new Set()); //AÑADO EL NUEVO CHAT
        GLOBAL_chat_and_Subscribers.get(chatId).add(clientSocket); //LE AÑADO EL CLIENTE QUE HA CREADO EL CHAT CON SU PRIMER MENSAJE
        CLIENT_subscribedChatIds.add(chatId);//EL CLIENTE SE AÑADE EL CHAT COMO UNO DE LOS QUE ESTÁ SUSCRITO
      });
      console.error(`Client with id ${CLIENT_suscribed_user_id} subscribed to new chats:`, Array.from(message.chatIds));
    
      //Si el mensaje tiene newchat=true, significa que este cliente ha creado un nuevo chat con otro usuario
      //Por lo tanto, debo suscribir forzosamente al otro usuario a este chat
      if (message.newchat) {
        //█▀ █░█ █▀ █▀▀ █▀█ █ █▀█ █▀▀ █ █▀█ █▄░█   █▀▀ █▀█ █▀█ ▀█ █▀█ █▀ ▄▀█
        //▄█ █▄█ ▄█ █▄▄ █▀▄ █ █▀▀ █▄▄ █ █▄█ █░▀█   █▀░ █▄█ █▀▄ █▄ █▄█ ▄█ █▀█

        SubscribeUserToChat(message.other_user_Id, message.chatIds[0]);
        //Nota: solo se suscribe si el otro usuario está conectado al websocket
        console.log(`Client with id ${message.other_user_Id} FORCEFULLY subscribed to new chat:`, message.chatIds[0] );   
      }
    }
    //█▀▀ █▀█ █▄░█ █▄░█ █▀▀ █▀▀ ▀█▀
    //█▄▄ █▄█ █░▀█ █░▀█ ██▄ █▄▄ ░█░
    else if (message.type === "connect"  && message.userId){
      CLIENT_suscribed_user_id = message.userId;
      GLOBAL_userid_of_Sockets.set(message.userId, clientSocket); // map userId → socket
      console.log(`Client with id ${CLIENT_suscribed_user_id} connected to WebSocket server`);
    }
    //█▀▄▀█ █▀▀ █▀ █▀ ▄▀█ █▀▀ █▀▀
    //█░▀░█ ██▄ ▄█ ▄█ █▀█ █▄█ ██▄
    else if (message.type === "message" && message.chatId) {

      //Obtengo todos los demás clientes suscritos al canal en el que quiero mandar el mensaje.
      const subscribers = Array.from(GLOBAL_chat_and_Subscribers.get(message.chatId) || [])
        .filter(s => s !== clientSocket);

      if (subscribers.length > 0) {
        subscribers.forEach((subscriberSocket) => {
          if (subscriberSocket.readyState === subscriberSocket.OPEN) {
            //█▀ █▀▀ █▄░█ █▀▄   ▀█▀ █▀█   █▀▀ █░░ █ █▀▀ █▄░█ ▀█▀
            //▄█ ██▄ █░▀█ █▄▀   ░█░ █▄█   █▄▄ █▄▄ █ ██▄ █░▀█ ░█░
            subscriberSocket.send(JSON.stringify({
              type: "message",   
              chatId: message.chatId,
              new_message: message.new_message,
              new_Chat: message.new_Chat,
            }));
          }
        });
        console.log("message info: ", message.new_message  ," sent to ", subscribers.length , " suscribers.");

      }else{
          console.log("Message recived from sender_id: ", message.new_message.sender_id, " but no other suscribed users to send it to." );
      }
    } else {
      console.error("Unknown message type or missing fields:", message);
      return;}
  });
  //█▀▀ █░░ █▀█ █▀ █▀▀   █▀▀ █░░ █ █▀▀ █▄░█ ▀█▀   █▀▀ █▀█ █▄░█ █▄░█ █▀▀ █▀▀ ▀█▀ █ █▀█ █▄░█
  //█▄▄ █▄▄ █▄█ ▄█ ██▄   █▄▄ █▄▄ █ ██▄ █░▀█ ░█░   █▄▄ █▄█ █░▀█ █░▀█ ██▄ █▄▄ ░█░ █ █▄█ █░▀█
  clientSocket.on("close", () => {
    console.log("Client disconnected");
    // Remove client from all subscribed chats
    CLIENT_subscribedChatIds.forEach((chatId) => {
      GLOBAL_chat_and_Subscribers.get(chatId)?.delete(clientSocket);
    });
    if (CLIENT_suscribed_user_id) {
      GLOBAL_userid_of_Sockets.delete(CLIENT_suscribed_user_id);
    }
  });

  clientSocket.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

function SubscribeUserToChat(userId, chatId) {

  //Si el usuario no está conectado al websocket, no hago nada
  const socket = GLOBAL_userid_of_Sockets.get(userId);
  if (!socket || socket.readyState !== socket.OPEN) return;

  //Si el chatId no existe en el map, lo creo
  if (!GLOBAL_chat_and_Subscribers.has(chatId)) {
    GLOBAL_chat_and_Subscribers.set(chatId, new Set());
  }
  //Obtengo los suscriptores actuales de ese chat
  const subscribers = GLOBAL_chat_and_Subscribers.get(chatId);

  //Si el socket del usuario no está ya suscrito a ese chat, lo suscribo
  if (!subscribers.has(socket)) {
    subscribers.add(socket);
    //console.log(`Subscribed user ${userId} to chat ${chatId}`);
  }

  // Optionally tell the client so it can update UI (no necesario pq se actualiza el store que luego actualiza la UI automáticamente)
  //socket.send(
  //  JSON.stringify({
  //    type: "subscribed",
  //    chatId,
  // 
  //})
}

console.log(`WebSocket server running on ws://localhost:${PORT}`);