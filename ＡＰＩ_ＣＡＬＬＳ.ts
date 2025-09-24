import * as FileSystem from "expo-file-system/legacy"; // legacy import to avoid deprecation


export const LOCALHOST_IP = "192.168.1.100";
const BACKEND_PORT= "3001";

const API_BASE_IP = `${LOCALHOST_IP}:${BACKEND_PORT}`;

/*======================================================
██████╗░███████╗░█████╗░███████╗████████╗░█████╗░░██████╗
██╔══██╗██╔════╝██╔══██╗██╔════╝╚══██╔══╝██╔══██╗██╔════╝
██████╔╝█████╗░░██║░░╚═╝█████╗░░░░░██║░░░███████║╚█████╗░
██╔══██╗██╔══╝░░██║░░██╗██╔══╝░░░░░██║░░░██╔══██║░╚═══██╗
██║░░██║███████╗╚█████╔╝███████╗░░░██║░░░██║░░██║██████╔╝
╚═╝░░╚═╝╚══════╝░╚════╝░╚══════╝░░░╚═╝░░░╚═╝░░╚═╝╚═════╝░*/
//█▀▀ █▀▀ ▀█▀   ▄▀█ █░░ █░░   █▀█ █▀▀ █▀▀ █ █▀█ █▀▀ █▀
//█▄█ ██▄ ░█░   █▀█ █▄▄ █▄▄   █▀▄ ██▄ █▄▄ █ █▀▀ ██▄ ▄█
export const API_fetchRecipes = async () => {
  try {
    const response = await fetch(`http://${API_BASE_IP}/recipes`);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    console.info("¡(fetchRecipes)Fetched recipes successfully!");
    return data;
  } catch (error) {
    console.error("(fetchRecipes)Failed to fetch recipes:", error);
    throw error;
  }
};

//█▀▀ █▀▀ ▀█▀   █░█ █▀ █▀▀ █▀█   █▀█ █▀▀ █▀▀ █ █▀█ █▀▀ █▀
//█▄█ ██▄ ░█░   █▄█ ▄█ ██▄ █▀▄   █▀▄ ██▄ █▄▄ █ █▀▀ ██▄ ▄█
export const API_fetchUserRecipes = async  (userId: string)  => {
  try {
    const response = await fetch(`http://${API_BASE_IP}/recipes/${userId}`);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    console.info("¡(fetchRecipes)Fetched user recipes successfully!");
    return data;
  } catch (error) {
    console.error("(fetchRecipes)Failed to fetch user recipes:", error);
    throw error;
  }
};
//█▀▀ █▀█ █▀▀ ▄▀█ ▀█▀ █▀▀   █▀█ █▀▀ █▀▀ █ █▀█ █▀▀
//█▄▄ █▀▄ ██▄ █▀█ ░█░ ██▄   █▀▄ ██▄ █▄▄ █ █▀▀ ██▄
export const API_createRecipe = async (title: string, user_id: string) => {
  try {
    const response = await fetch(`http://${API_BASE_IP}/create_recipe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, user_id}),
    });

    if (!response.ok) throw new Error();

    const data = await response.json();
    console.info(`(createRecipe)Recipe "${title}" created successfully!`);
    return data;
  } catch (error) {
    throw error; //lo paso arriba (store de recetas) para que lo trate
  }
};

//█▀▄ █▀▀ █░░ █▀▀ ▀█▀ █▀▀   █▀█ █▀▀ █▀▀ █ █▀█ █▀▀
//█▄▀ ██▄ █▄▄ ██▄ ░█░ ██▄   █▀▄ ██▄ █▄▄ █ █▀▀ ██▄
export const API_deleteRecipe = async (recipeId: string, userId: string) => {
  try {
    const response = await fetch(`http://${API_BASE_IP}/delete_recipe`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipe_id: recipeId, user_id: userId }),
    });

  
    if (!response.ok) throw new Error();

    const data = await response.json();
    console.info(`(deleteRecipe)Recipe ${recipeId} deleted successfully!`);
    return data;
  } catch (error) {
    throw error; //lo paso arriba (store de recetas) para que lo trate
  }
}

//█▀▀ █▀▄ █ ▀█▀ ▄▀█ █▀█   █▀█ █▀▀ █▀▀ █▀▀ ▀█▀ ▄▀█ 
//██▄ █▄▀ █ ░█░ █▀█ █▀▄   █▀▄ ██▄ █▄▄ ██▄ ░█░ █▀█
export const API_editRecipe = async (recipeId: string, userId: string, newTitle: string) => {
  const response = await fetch(`http://${API_BASE_IP}/edit_recipe`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipe_id: recipeId, user_id: userId, title: newTitle }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
};

//▄▀█ █▀▄ █▀▄   █▀█ █▀▀ █▀▀ █ █▀█ █▀▀   █▀█ █ █▀▀ ▀█▀ █░█ █▀█ █▀▀ █▀
//█▀█ █▄▀ █▄▀   █▀▄ ██▄ █▄▄ █ █▀▀ ██▄   █▀▀ █ █▄▄ ░█░ █▄█ █▀▄ ██▄ ▄█
export const API_addRecipePictures = async (imageUris: string[],  userId: string, recipeId: string) => {
  try {
    // Convertimos cada URI de imagen en base64 para enviarla al backend
    const base64s = await Promise.all(
      imageUris.map((uri) => FileSystem.readAsStringAsync(uri, { encoding: "base64" }))
    );

    // Enviamos la colección de imágenes al backend
    const response = await fetch(`http://${API_BASE_IP}/upload-recipe-pictures`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64s, userId, recipeId }),
    });

    if (!response.ok) throw new Error("Upload recipe picture failed");
    // Devolvemos el listado de imágenes que el backend confirmó como guardadas
    const { images } = await response.json();
    return images;
  } catch (error) {
    console.error("(uploadImageToSupabase) Error: ", error);
    throw error;
  }
};

/*==============================================================================================================================
██████╗░███████╗░█████╗░███████╗████████╗░█████╗░░██████╗  ███████╗░█████╗░██╗░░░██╗░█████╗░██████╗░██╗████████╗░█████╗░░██████╗
██╔══██╗██╔════╝██╔══██╗██╔════╝╚══██╔══╝██╔══██╗██╔════╝  ██╔════╝██╔══██╗██║░░░██║██╔══██╗██╔══██╗██║╚══██╔══╝██╔══██╗██╔════╝
██████╔╝█████╗░░██║░░╚═╝█████╗░░░░░██║░░░███████║╚█████╗░  █████╗░░███████║╚██╗░██╔╝██║░░██║██████╔╝██║░░░██║░░░███████║╚█████╗░
██╔══██╗██╔══╝░░██║░░██╗██╔══╝░░░░░██║░░░██╔══██║░╚═══██╗  ██╔══╝░░██╔══██║░╚████╔╝░██║░░██║██╔══██╗██║░░░██║░░░██╔══██║░╚═══██╗
██║░░██║███████╗╚█████╔╝███████╗░░░██║░░░██║░░██║██████╔╝  ██║░░░░░██║░░██║░░╚██╔╝░░╚█████╔╝██║░░██║██║░░░██║░░░██║░░██║██████╔╝
╚═╝░░╚═╝╚══════╝░╚════╝░╚══════╝░░░╚═╝░░░╚═╝░░╚═╝╚═════╝░  ╚═╝░░░░░╚═╝░░╚═╝░░░╚═╝░░░░╚════╝░╚═╝░░╚═╝╚═╝░░░╚═╝░░░╚═╝░░╚═╝╚═════╝░*/
//█▀▀ █▀▀ ▀█▀   █░░ █ █▄▀ █▀▀ █▀▄   █▀█ █▀▀ █▀▀ █ █▀█ █▀▀ █▀
//█▄█ ██▄ ░█░   █▄▄ █ █░█ ██▄ █▄▀   █▀▄ ██▄ █▄▄ █ █▀▀ ██▄ ▄█
export const API_fetchLikedRecipes = async (userId: string) => {
  try {
    const response = await fetch(`http://${API_BASE_IP}/users/${userId}/liked`);
    if (!response.ok) throw new Error("Failed to fetch liked recipes");
    const data = await response.json();
    console.info("(fetchLikedRecipes)Fetched liked recipes successfully!");
    return data;
  } catch (error) {
    console.error("(fetchLikedRecipes)Error:", error);
    throw error;
  }
};

//█   █ █▄▀ █▀▀   █▀█ █▀▀ █▀▀ █ █▀█ █▀▀
//█▄▄ █ █░█ ██▄   █▀▄ ██▄ █▄▄ █ █▀▀ ██▄
export const API_likeRecipe = async (userId: string, recipeId: string) => {
  try {
    const response = await fetch(`http://${API_BASE_IP}/recipes/${recipeId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!response.ok) throw new Error("Failed to like recipe");
    const data = await response.json();
    console.info(`(likeRecipe)Recipe ${recipeId} liked successfully!`);
    return data;
  } catch (error) {
    console.error("(likeRecipe)Error:", error);
    throw error;
  }
};

//█░█ █▄░█ █░░ █ █▄▀ █▀▀   █▀█ █▀▀ █▀▀ █ █▀█ █▀▀
//█▄█ █░▀█ █▄▄ █ █░█ ██▄   █▀▄ ██▄ █▄▄ █ █▀▀ ██▄
export const API_unlikeRecipe = async (userId: string, recipeId: string) => {
  try {
    const response = await fetch(`http://${API_BASE_IP}/recipes/${recipeId}/unlike`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!response.ok) throw new Error("Failed to unlike recipe");
    const data = await response.json();
    console.info(`(unlikeRecipe)Recipe ${recipeId} unliked successfully!`);
    return data;
  } catch (error) {
    console.error("(unlikeRecipe)Error:", error);
    throw error;
  }
};

//=================================
//░█████╗░██╗░░██╗░█████╗░████████╗
//██╔══██╗██║░░██║██╔══██╗╚══██╔══╝
//██║░░╚═╝███████║███████║░░░██║░░░
//██║░░██╗██╔══██║██╔══██║░░░██║░░░
//╚█████╔╝██║░░██║██║░░██║░░░██║░░░
//░╚════╝░╚═╝░░╚═╝╚═╝░░╚═╝░░░╚═╝░░░

//█▀▀ █▀▀ ▀█▀   █▀▀ █░█ ▄▀█ ▀█▀ █▀
//█▄█ ██▄ ░█░   █▄▄ █▀█ █▀█ ░█░ ▄█
export const API_fetchChats = async (userId: string) => {
  try {
    const response = await fetch(`http://${API_BASE_IP}/get_chats/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      // Server responded but with an error (4xx / 5xx)
      throw new Error(`Failed to fetch user chats: ${response.status} ${response.statusText}`);
    }

    let data: any;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error("Invalid JSON response from server.");
    }

    // Ensure we always return an array
    if (!Array.isArray(data)) {
      console.warn("(API_fetchChats) Expected array but got:", data);
      return [];
    }

    console.info(`(API_fetchChats) User chats obtained successfully!`);
    return data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("(API_fetchChats) Error:", message);
    // Fail safe: return empty array so frontend doesn’t crash
    return [];
  }
};

//█▀▄ █▀▀ █░░ █▀▀ ▀█▀ █▀▀   █▀▀ █░█ ▄▀█ ▀█▀
//█▄▀ ██▄ █▄▄ ██▄ ░█░ ██▄   █▄▄ █▀█ █▀█ ░█░
export const API_deleteChat = async (chatId: string) => {
  try {
    const response = await fetch(`http://${API_BASE_IP}/delete_chat/${chatId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`(deleteChat) Failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.info(`(deleteChat) Chat ${chatId} deleted successfully`);
    return data;
  } catch (error) {
    console.error("(deleteChat) Error:", error);
    throw error;
  }
};

//█▀▀ █▀█ █▀▀ ▄▀█ ▀█▀ █▀▀   █ █▄░█ █▀▄ █ █░█ █ █▀▄ █░█ ▄▀█ █░░   █▀▀ █░█ ▄▀█ ▀█▀
//█▄▄ █▀▄ ██▄ █▀█ ░█░ ██▄   █ █░▀█ █▄▀ █ ▀▄▀ █ █▄▀ █▄█ █▀█ █▄▄   █▄▄ █▀█ █▀█ ░█░
export const API_create_individual_Chat = async (
  user1_id: string,
  user2_id: string
): Promise<{ chat_id: string }> => {
  try {
    const response = await fetch(
      `http://${API_BASE_IP}/create_individual_chat?user1_id=${user1_id}&user2_id=${user2_id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create chat: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: { chat_id: string } = await response.json();
    return data;
  } catch (error) {
    console.error("(API_create_individual_Chat) Error:", error);
    throw error;
  }
};

//█▀▄▀█ ▄▀█ █▀█ █▄▀   █▀▀ █░█ ▄▀█ ▀█▀   ▄▀█ █▀   █▀█ █▀▀ ▄▀█ █▀▄
//█░▀░█ █▀█ █▀▄ █░█   █▄▄ █▀█ █▀█ ░█░   █▀█ ▄█   █▀▄ ██▄ █▀█ █▄▀
export const API_markChatAsRead = async (chatId: string, userId: string) => {
  try {
    const response = await fetch(`http://${API_BASE_IP}/mark_chat_as_read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, user_id: userId }),
    });

    if (!response.ok) throw new Error("Failed to mark chat as read");

    return await response.json();
  } catch (error) {
    console.error("(API_markChatAsRead) Error:", error);
    throw error;
  }
};

//=======================================================================================================
//░█████╗░██╗░░██╗░█████╗░████████╗  ███╗░░░███╗███████╗░██████╗░██████╗░█████╗░░██████╗░███████╗░██████╗
//██╔══██╗██║░░██║██╔══██╗╚══██╔══╝  ████╗░████║██╔════╝██╔════╝██╔════╝██╔══██╗██╔════╝░██╔════╝██╔════╝
//██║░░╚═╝███████║███████║░░░██║░░░  ██╔████╔██║█████╗░░╚█████╗░╚█████╗░███████║██║░░██╗░█████╗░░╚█████╗░
//██║░░██╗██╔══██║██╔══██║░░░██║░░░  ██║╚██╔╝██║██╔══╝░░░╚═══██╗░╚═══██╗██╔══██║██║░░╚██╗██╔══╝░░░╚═══██╗
//╚█████╔╝██║░░██║██║░░██║░░░██║░░░  ██║░╚═╝░██║███████╗██████╔╝██████╔╝██║░░██║╚██████╔╝███████╗██████╔╝
//░╚════╝░╚═╝░░╚═╝╚═╝░░╚═╝░░░╚═╝░░░  ╚═╝░░░░░╚═╝╚══════╝╚═════╝░╚═════╝░╚═╝░░╚═╝░╚═════╝░╚══════╝╚═════╝░
//█▀▀ █▀▀ ▀█▀   █▀█ █░░ █▀▄ █▀▀ █▀█   █▀▄▀█ █▀▀ █▀ █▀ ▄▀█ █▀▀ █▀▀ █▀
//█▄█ ██▄ ░█░   █▄█ █▄▄ █▄▀ ██▄ █▀▄   █░▀░█ ██▄ ▄█ ▄█ █▀█ █▄█ ██▄ ▄█
// Fetch older messages of a chat (for infinite scroll)
export const API_fetchOlderMessages = async (
  chatId: string,
  before_date: string, // cursor: timestamp of the oldest loaded message
  limit: string = '20'
) => {
  try {
    const response = await fetch(
      `http://${API_BASE_IP}/get_older_messages/${chatId}?before_date=${before_date}&limit=${limit}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch older messages: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.warn("(API_fetchOlderMessages) Expected array but got:", data);
      return [];
    }

    console.info(`(API_fetchOlderMessages) Fetched ${data.length} messages successfully!`);
    return data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("(API_fetchOlderMessages) Error:", message);
    return [];
  }
};

//█▀ █▀▀ █▄░█ █▀▄   █▀▄▀█ █▀▀ █▀ █▀ ▄▀█ █▀▀ █▀▀
//▄█ ██▄ █░▀█ █▄▀   █░▀░█ ██▄ ▄█ ▄█ █▀█ █▄█ ██▄
export const API_sendMessage = async (
  chatId: string,
  senderId: string,
  content: string
) => {
  const response = await fetch(`http://${LOCALHOST_IP}:3001/send-message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, senderId, content }),
  });

  // Check for chat not found (deleted)
  if (response.status === 404) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Chat not found");
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`(API_sendMessage)Failed to send message: ${errorText}`);
  }

  return await response.json(); // Should return the saved message object
};

//█▀▄ █▀▀ █░░ █▀▀ ▀█▀ █▀▀   █▀▀ █░█ ▄▀█ ▀█▀   █▀▄▀█ █▀▀ █▀ █▀ ▄▀█ █▀▀ █▀▀ █▀
//█▄▀ ██▄ █▄▄ ██▄ ░█░ ██▄   █▄▄ █▀█ █▀█ ░█░   █░▀░█ ██▄ ▄█ ▄█ █▀█ █▄█ ██▄ ▄█
export const API_deleteChatMessages = async (chatId: string, deletedDate: string) => {
  try {
    const response = await fetch(`http://${API_BASE_IP}/delete_chat_messages/${chatId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deletedDate }),

    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`(cleanChat) Failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.info(`(cleanChat) Messages in chat ${chatId} deleted successfully`);
    return data;
  } catch (error) {
    console.error("(cleanChat) Error:", error);
    throw error;
  }
};

//=======================================================================================
//░█████╗░██╗░░██╗░█████╗░████████╗  ███████╗██████╗░██╗███████╗███╗░░██╗██████╗░░██████╗
//██╔══██╗██║░░██║██╔══██╗╚══██╔══╝  ██╔════╝██╔══██╗██║██╔════╝████╗░██║██╔══██╗██╔════╝
//██║░░╚═╝███████║███████║░░░██║░░░  █████╗░░██████╔╝██║█████╗░░██╔██╗██║██║░░██║╚█████╗░
//██║░░██╗██╔══██║██╔══██║░░░██║░░░  ██╔══╝░░██╔══██╗██║██╔══╝░░██║╚████║██║░░██║░╚═══██╗
//╚█████╔╝██║░░██║██║░░██║░░░██║░░░  ██║░░░░░██║░░██║██║███████╗██║░╚███║██████╔╝██████╔╝
//░╚════╝░╚═╝░░╚═╝╚═╝░░╚═╝░░░╚═╝░░░  ╚═╝░░░░░╚═╝░░╚═╝╚═╝╚══════╝╚═╝░░╚══╝╚═════╝░╚═════╝░
//█▀▀ █▀▀ ▀█▀   █▀▀ █▀█ █ █▀▀ █▄░█ █▀▄ █▀
//█▄█ ██▄ ░█░   █▀░ █▀▄ █ ██▄ █░▀█ █▄▀ ▄█
export const API_getFriends = async (userId: string) => {
  if (!userId || isNaN(Number(userId))) {
    throw new Error("(API_getFriends) Invalid or missing userId");
  }

  try {
    const response = await fetch(`http://${API_BASE_IP}/get_friends/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`(API_getFriends) Failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    // Safety check: ensure always an array
    if (!Array.isArray(data)) {
      console.warn("(API_getFriends) Expected array but got:", data);
      return [];
    }

    console.info(`(API_getFriends) Retrieved ${data.length} friends for user ${userId}`);
    return data;
  } catch (error) {
    console.error("(API_getFriends) Error:", error);
    throw error;
  }
};

//▄▀█ █▀▄ █▀▄   █▀▀ █▀█ █ █▀▀ █▄░█ █▀▄
//█▀█ █▄▀ █▄▀   █▀░ █▀▄ █ ██▄ █░▀█ █▄▀
export const API_addFriend = async (userId: string, friendId: string) => {
  try {
    const response = await fetch(`http://${API_BASE_IP}/add_friend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, friendId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`(API_addFriend) Failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.info(`(API_addFriend) Friendship added successfully between ${userId} and ${friendId}`);
    return data;
  } catch (error) {
    console.error("(API_addFriend) Error:", error);
    throw error;
  }
};

//█▀█ █▀▀ █▀▄▀█ █▀█ █░█ █▀▀   █▀▀ █▀█ █ █▀▀ █▄░█ █▀▄
//█▀▄ ██▄ █░▀░█ █▄█ ▀▄▀ ██▄   █▀░ █▀▄ █ ██▄ █░▀█ █▄▀
export const API_removeFriend = async (userId: string, friendId: string) => {
  try {
    const response = await fetch(`http://${API_BASE_IP}/remove_friend`, {
      method: "POST", // matches your backend route
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, friendId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`(API_removeFriend) Failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.info(`(API_removeFriend) Friendship removed successfully between ${userId} and ${friendId}`);
    return data;
  } catch (error) {
    console.error("(API_removeFriend) Error:", error);
    throw error;
  }
};


//===========================================
//██████╗░███████╗██████╗░███████╗██╗██╗░░░░░
//██╔══██╗██╔════╝██╔══██╗██╔════╝██║██║░░░░░
//██████╔╝█████╗░░██████╔╝█████╗░░██║██║░░░░░
//██╔═══╝░██╔══╝░░██╔══██╗██╔══╝░░██║██║░░░░░
//██║░░░░░███████╗██║░░██║██║░░░░░██║███████╗
//╚═╝░░░░░╚══════╝╚═╝░░╚═╝╚═╝░░░░░╚═╝╚══════╝
//█░░ █▀█ █▀▀ █ █▄░█
//█▄▄ █▄█ █▄█ █ █░▀█
export const API_login = async (emailOrUsername : string, password: string ) => {
  if (!emailOrUsername || !password) {
    throw new Error("Missing user or password");
  }

  const response = await fetch(`http://${API_BASE_IP}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrUsername, password }),
  });

  if (!response.ok) throw new Error("Failed to fetch authenticated user");
  const data = await response.json();
  console.info("Fetched authenticated user successfully");
  return data;
};


//█▀█ █▀▀ █▀▀ █ █▀ ▀█▀ █▀▀ █▀█
//█▀▄ ██▄ █▄█ █ ▄█ ░█░ ██▄ █▀▄
export const API_registerUser = async (email:string, username:string, password:string) => {

  if(!email || !password || !username){
    throw new Error("[API_userRegister] Error: missing args");
  }

  const response = await fetch(`http://${API_BASE_IP}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email,username,password}),
  })

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || "[API_userRegister] Failed to register user");
  }
  const data = await response.json();
  console.info("Registered user successfully");
  return data;
}


//█▀▀ █░█ ▄▀█ █▄░█ █▀▀ █▀▀   ▄▀█ █░█ ▄▀█ ▀█▀ ▄▀█ █▀█
//█▄▄ █▀█ █▀█ █░▀█ █▄█ ██▄   █▀█ ▀▄▀ █▀█ ░█░ █▀█ █▀▄
export const API_changeAvatar = async (fileUri: string, userId: string) => {
  try {
     // Read file as base64
  const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: "base64" });

  // Send to your backend
  const response = await fetch(`http://${API_BASE_IP}/upload-avatar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileBase64: base64, userId }),
  });

  if (!response.ok) throw new Error("Upload failed");
    const { avatar } = await response.json();
    return avatar;
  } catch (error) {
    console.error("(uploadImageToSupabase) Error:", error);
    throw error;
  }
};

