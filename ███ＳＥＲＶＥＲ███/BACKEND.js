// npm install express pg cors
require("dotenv").config({ path: "../.env" });
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { createClient } = require("@supabase/supabase-js");
const { decode } = require("base64-arraybuffer");  // npm i uuid


const app = express();
const PORT = 3001;

app.use(cors()); // Allow frontend requests
app.use(express.json());
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);


// PostgreSQL connection
const pool = new Pool({
  user: "root",
  host: "127.0.0.1",          // WSL IP bridged to localhost
  database: "recetario",
  password: "root",
  port: 5432,                 // default PostgreSQL port
});

app.get("/", (req, res) => {
  res.send("¡Backend server is running!");
});


//=========================================================
//██████╗░███████╗░█████╗░███████╗████████╗░█████╗░░██████╗
//██╔══██╗██╔════╝██╔══██╗██╔════╝╚══██╔══╝██╔══██╗██╔════╝
//██████╔╝█████╗░░██║░░╚═╝█████╗░░░░░██║░░░███████║╚█████╗░
//██╔══██╗██╔══╝░░██║░░██╗██╔══╝░░░░░██║░░░██╔══██║░╚═══██╗
//██║░░██║███████╗╚█████╔╝███████╗░░░██║░░░██║░░██║██████╔╝
//╚═╝░░╚═╝╚══════╝░╚════╝░╚══════╝░░░╚═╝░░░╚═╝░░╚═╝╚═════╝░

//█▀▀ █▀▀ ▀█▀   ▄▀█ █░░ █░░   █▀█ █▀▀ █▀▀ █ █▀█ █▀▀ █▀
//█▄█ ██▄ ░█░   █▀█ █▄▄ █▄▄   █▀▄ ██▄ █▄▄ █ █▀▀ ██▄ ▄█
app.get("/recipes", async (req, res) => {
  try {
    console.log("Fetching recipes from the database...");
    
    const result = await pool.query(`
      SELECT 
        r.*,
        u.username,
        u.avatar,
        COALESCE(
          json_agg(
            json_build_object(
              'image_id', ri.image_id,
              'url', ri.url,
              'created_at', ri.created_at
            )
          ) FILTER (WHERE ri.image_id IS NOT NULL), 
          '[]'
        ) AS recipe_images
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN recipe_images ri ON r.id = ri.recipe_id
      GROUP BY r.id, u.username, u.avatar
      ORDER BY r.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching recipes:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

//█▀▀ █▀▀ ▀█▀   █░█ █▀ █▀▀ █▀█   █▀█ █▀▀ █▀▀ █ █▀█ █▀▀ █▀
//█▄█ ██▄ ░█░   █▄█ ▄█ ██▄ █▀▄   █▀▄ ██▄ █▄▄ █ █▀▀ ██▄ ▄█
app.get("/recipes/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching user recipes from the database...");
    const result = await pool.query(`
      SELECT r.*
      FROM recipes r
      WHERE user_id = $1
      ORDER By r.created_at DESC
    `, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching user recipes:", err);
    res.status(500).json({ error: "Internal server error. Database with that name might not exist." });
  }
});

//█▀▀ █▀█ █▀▀ ▄▀█ ▀█▀ █▀▀   █▀█ █▀▀ █▀▀ █ █▀█ █▀▀
//█▄▄ █▀▄ ██▄ █▀█ ░█░ ██▄   █▀▄ ██▄ █▄▄ █ █▀▀ ██▄
// Crear nueva receta
app.post("/create_recipe", async (req, res) => {
  try {
    const { title, user_id} = req.body;

    if (!title || !user_id) {
      return res.status(400).json({ error: "Missing required fields (title, user_id)" });
    }

    // FIX DE LA SECUENCIA SETVAL (lo del id incremental)
    const maxIdResult = await pool.query(`SELECT MAX(id) AS max_id FROM recipes`);
    const maxId = maxIdResult.rows[0].max_id || 0;
    await pool.query(`SELECT setval('recipes_id_seq', $1, false)`, [maxId + 1]);

    const result = await pool.query(
      `INSERT INTO recipes (title, user_id) 
       VALUES ($1, $2) 
       RETURNING *`,
      [title, user_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating recipe:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//█▀▄ █▀▀ █░░ █▀▀ ▀█▀ █▀▀   █▀█ █▀▀ █▀▀ █ █▀█ █▀▀
//█▄▀ ██▄ █▄▄ ██▄ ░█░ ██▄   █▀▄ ██▄ █▄▄ █ █▀▀ ██▄
app.delete("/delete_recipe", async (req, res) => {
  try {
    const { recipe_id, user_id } = req.body;

    if (!recipe_id || !user_id) {
      return res
        .status(400)
        .json({ error: "Missing required fields (recipe_id, logged_user_id)" });
    }

    const result = await pool.query(
      `DELETE FROM recipes 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [recipe_id, user_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Recipe not found or not owned by user" });
    }

    res.status(200).json({ message: "Recipe deleted successfully", recipe: result.rows[0] });
  } catch (err) {
    console.error("Error deleting recipe:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//▄▀█ █▀▄ █▀▄   █▀█ █▀▀ █▀▀ █ █▀█ █▀▀   █▀█ █ █▀▀ ▀█▀ █░█ █▀█ █▀▀ █▀
//█▀█ █▄▀ █▄▀   █▀▄ ██▄ █▄▄ █ █▀▀ ██▄   █▀▀ █ █▄▄ ░█░ █▄█ █▀▄ ██▄ ▄█
app.post("/upload-recipe-pictures", async (req, res) => {
  try {
    const { base64s, userId, recipeId } = req.body;

    //compruebo que todos los archivos están bien
    if (!Array.isArray(base64s) || base64s.length === 0 || !userId || !recipeId) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    //Obtengo el maximo id para introducir en supabase s3 storage
    const max_id = await pool.query(
      `SELECT COALESCE(MAX(image_id), 0) AS max_id FROM recipe_images WHERE recipe_id = $1`,
      [recipeId]
    );

    let nextImageId = max_id.rows[0].max_id;
    const uploadedImages = [];

    //recorro el array de imagenes seleccionadas, los meto en supabase 
    for (const rawBase64 of base64s) {

       //miro si es correcto el uri
      const cleanedBase64 = typeof rawBase64 === "string" ? rawBase64.split(",").pop() : null;
      if (!cleanedBase64) {
        return res.status(400).json({ error: "Invalid image payload." });
      }

      //subo la imagen a supabase
      nextImageId += 1;
      const imageName = `${nextImageId}.jpg`;
      const filePath = `images_users/${userId}/recipes/${recipeId}/${imageName}`;
      const arrayBuffer = decode(cleanedBase64);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("recetarium")
        .upload(filePath, arrayBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError.message);
        return res.status(500).json({ error: uploadError.message });
      }

      const { data: publicData } = supabase.storage.from("recetarium").getPublicUrl(filePath);
      const imageUrl = publicData?.publicUrl;

      if (!imageUrl) {
        console.error("Failed to obtain public URL for", filePath);
        return res.status(500).json({ error: "Failed to generate public URL." });
      }

      //añado el public url al array
      uploadedImages.push(imageUrl);
    }

    for (const url of uploadedImages) { 
      const insertResult = await pool.query(
        `INSERT INTO recipe_images (recipe_id, url) VALUES ($1, $2, $3) RETURNING *`,
        [recipeId, url]
      );
    }

    res.json({ images: uploadedImages }); //devuelvo los public url de las imagenes subidas
  } catch (e) {
    console.error("upload-recipe-pictures error:", e);
    res.status(500).json({ error: "Failed to upload recipe pictures." });
  }
});



//█▀▀ █▀▄ █ ▀█▀ ▄▀█ █▀█   █▀█ █▀▀ █▀▀ █▀▀ ▀█▀ ▄▀█
//██▄ █▄▀ █ ░█░ █▀█ █▀▄   █▀▄ ██▄ █▄▄ ██▄ ░█░ █▀█


// FALTA HACER


/*==============================================================================================================================
██████╗░███████╗░█████╗░███████╗████████╗░█████╗░░██████╗  ███████╗░█████╗░██╗░░░██╗░█████╗░██████╗░██╗████████╗░█████╗░░██████╗
██╔══██╗██╔════╝██╔══██╗██╔════╝╚══██╔══╝██╔══██╗██╔════╝  ██╔════╝██╔══██╗██║░░░██║██╔══██╗██╔══██╗██║╚══██╔══╝██╔══██╗██╔════╝
██████╔╝█████╗░░██║░░╚═╝█████╗░░░░░██║░░░███████║╚█████╗░  █████╗░░███████║╚██╗░██╔╝██║░░██║██████╔╝██║░░░██║░░░███████║╚█████╗░
██╔══██╗██╔══╝░░██║░░██╗██╔══╝░░░░░██║░░░██╔══██║░╚═══██╗  ██╔══╝░░██╔══██║░╚████╔╝░██║░░██║██╔══██╗██║░░░██║░░░██╔══██║░╚═══██╗
██║░░██║███████╗╚█████╔╝███████╗░░░██║░░░██║░░██║██████╔╝  ██║░░░░░██║░░██║░░╚██╔╝░░╚█████╔╝██║░░██║██║░░░██║░░░██║░░██║██████╔╝
╚═╝░░╚═╝╚══════╝░╚════╝░╚══════╝░░░╚═╝░░░╚═╝░░╚═╝╚═════╝░  ╚═╝░░░░░╚═╝░░╚═╝░░░╚═╝░░░░╚════╝░╚═╝░░╚═╝╚═╝░░░╚═╝░░░╚═╝░░╚═╝╚═════╝░*/
//█▀▀ █▀▀ ▀█▀   █░░ █ █▄▀ █▀▀ █▀▄   █▀█ █▀▀ █▀▀ █ █▀█ █▀▀ █▀
//█▄█ ██▄ ░█░   █▄▄ █ █░█ ██▄ █▄▀   █▀▄ ██▄ █▄▄ █ █▀▀ ██▄ ▄█
app.get("/users/:userId/liked", async (req, res) => {
  const { userId } = req.params;
  const liked = await pool.query(
    "SELECT recipe_id FROM saved_recipes WHERE user_id = $1",
    [userId]
  );
  res.json(liked.rows);
});

//█   █ █▄▀ █▀▀   █▀█ █▀▀ █▀▀ █ █▀█ █▀▀
//█▄▄ █ █░█ ██▄   █▀▄ ██▄ █▄▄ █ █▀▀ ██▄
app.post("/recipes/:id/like", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  await pool.query(
    "INSERT INTO saved_recipes (user_id, recipe_id) VALUES ($1, $2)",
    [user_id, id]
  );

  await pool.query(
    "UPDATE recipes SET likes = likes + 1 WHERE id = $1",
    [id]
  );

  res.json({ success: true });
});

//█░█ █▄░█ █░░ █ █▄▀ █▀▀   █▀█ █▀▀ █▀▀ █ █▀█ █▀▀
//█▄█ █░▀█ █▄▄ █ █░█ ██▄   █▀▄ ██▄ █▄▄ █ █▀▀ ██▄
app.delete("/recipes/:id/unlike", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  await pool.query(
    "DELETE FROM saved_recipes WHERE user_id = $1 AND recipe_id = $2",
    [user_id, id]
  );

  await pool.query(
    "UPDATE recipes SET likes = likes - 1 WHERE id = $1 AND likes > 0",
    [id]
  );

  res.json({ success: true });
});


//=================================
//░█████╗░██╗░░██╗░█████╗░████████╗
//██╔══██╗██║░░██║██╔══██╗╚══██╔══╝
//██║░░╚═╝███████║███████║░░░██║░░░
//██║░░██╗██╔══██║██╔══██║░░░██║░░░
//╚█████╔╝██║░░██║██║░░██║░░░██║░░░
//░╚════╝░╚═╝░░╚═╝╚═╝░░╚═╝░░░╚═╝░░░
// Get all chats for a user
//chat_id	is_group	name	created_at	                  unread_count	                                                                   participants	                                                                                                    last_messages
//   3	     f	    NULL	2025-08-19 15:38:17.583443+00	     2	      [{"id" : 1, "username" : "Isabella", "email" : "isabella@example.com"}, {"id" : 4, "username" : "Noah", "email" : "noah@example.com"}]	       [{"id" : 6, "sender_id" : 4, "content" : "Hey Alice 👋 Want to cook Carbonara together?", "created_at" : "2025-08-18T15:38:17.601487+00:00"}, {"id" : 7, "sender_id" : 8, "content" : "Sure! I’ll bring the parmesan.", "created_at" : "2025-08-14T15:38:17.601487+00:00"}]
//   2	     f	    NULL	2025-08-19 15:38:17.582206+00    	 0	      [{"id" : 1, "username" : "Isabella", "email" : "isabella@example.com"}, {"id" : 3, "username" : "Olivia", "email" : "olivia@example.com"}]	   [{"id" : 5, "sender_id" : 1, "content" : "Yes! It looks amazing, I’ll try it tonight.", "created_at" : "2025-08-17T15:38:17.600002+00:00"}, {"id" : 4, "sender_id" : 3, "content" : "Hi Alice, have you seen my soup recipe?", "created_at" : "2025-08-17T15:38:17.600002+00:00"}]
//█▀▀ █▀▀ ▀█▀   █▀▀ █░█ ▄▀█ ▀█▀ █▀
//█▄█ ██▄ ░█░   █▄▄ █▀█ █▀█ ░█░ ▄█
app.get("/get_chats/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const { rows: chats } = await pool.query(
      `
      SELECT
        c.chat_id, 
        c.is_group, 
        c.name, 
        c.created_at,
        c.all_messages_deleted_at,
        
        -- 1. Cuento los mensajes no leídos por este usuario en el chat
        COUNT(m.message_id) FILTER (
          WHERE m.sender_id <> $1   -- Solo mensajes enviados por otros
          AND mr.message_id IS NULL -- Y que no estén marcados como leídos
        ) AS unread_count,

        -- 2. Obtengo los participantes del chat en formato JSON, ordenados por username
        (
          SELECT json_agg(json_build_object(
            'id', u2.id,
            'username', u2.username,
            'email', u2.email
          ) ORDER BY u2.username)
          FROM chat_participants cp2
          JOIN users u2 ON u2.id = cp2.user_id
          WHERE cp2.chat_id = c.chat_id
        ) AS participants,

        -- 3. Obtengo los últimos 20 mensajes del chat en JSON
        COALESCE(
          (
            SELECT json_agg(m_json)
            FROM (
              SELECT json_build_object(
                'id', m2.message_id,
                'sender_id', m2.sender_id,
                'content', m2.content,
                'created_at', m2.created_at
              ) AS m_json
              FROM messages m2
              WHERE m2.chat_id = c.chat_id
              ORDER BY m2.created_at DESC  -- Orden descendente para obtener los más recientes
              LIMIT 20                     -- Solo los últimos 20 mensajes
            ) AS sub
          ), '[]'::json  -- Si no hay mensajes, devuelvo un array vacío
        ) AS last_messages

      FROM chats c

      -- 4. Uno con chat_participants para filtrar solo los chats en los que participa el usuario
      JOIN chat_participants cp ON cp.chat_id = c.chat_id

      -- 5. Lo uno con mensajes y message_reads para poder contar los no leídos
      LEFT JOIN messages m ON m.chat_id = c.chat_id
      LEFT JOIN message_reads mr 
        ON mr.message_id = m.message_id 
       AND mr.chat_id = m.chat_id   -- 👈 agregado para respetar la PK compuesta
       AND mr.user_id = $1

      -- 6. Filtro para traer solo los chats en los que participa este usuario
      WHERE cp.user_id = $1

      -- 7. Agrupo por chat para poder contar los mensajes no leídos correctamente
      GROUP BY c.chat_id, c.is_group, c.name, c.created_at

      -- 8. Orden final por fecha de creación del chat (los más recientes primero)
      ORDER BY c.created_at DESC;
      `,
      [userId]
    );

    res.json(chats);
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//█▀▄ █▀▀ █░░ █▀▀ ▀█▀ █▀▀   █▀▀ █░█ ▄▀█ ▀█▀
//█▄▀ ██▄ █▄▄ ██▄ ░█░ ██▄   █▄▄ █▀█ █▀█ ░█░
app.delete("/delete_chat/:chatId", async (req, res) => {
    const { chatId } = req.params;
    try {
        // Finalmente eliminar el chat
        const result = await pool.query("DELETE FROM chats WHERE chat_id = $1 RETURNING *", [chatId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Chat not found" });
        }

        res.json({ message: "Chat deleted successfully", chat: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

//█▀▀ █▀█ █▀▀ ▄▀█ ▀█▀ █▀▀   █ █▄░█ █▀▄ █ █░█ █ █▀▄ █░█ ▄▀█ █░░   █▀▀ █░█ ▄▀█ ▀█▀
//█▄▄ █▀▄ ██▄ █▀█ ░█░ ██▄   █ █░▀█ █▄▀ █ ▀▄▀ █ █▄▀ █▄█ █▀█ █▄▄   █▄▄ █▀█ █▀█ ░█░
app.post("/create_individual_chat", async (req, res) => {
  const { user1_id, user2_id } = req.query;

  if (!user1_id || !user2_id) {
    return res.status(400).json({ error: "Both user IDs are required" });
  }

  try {
    // 1. Verificar si ya existe un chat entre los dos usuarios (no grupo)
    const existingChat = await pool.query(
      `
      SELECT c.chat_id
      FROM chats c
      JOIN chat_participants cp1 ON c.chat_id = cp1.chat_id
      JOIN chat_participants cp2 ON c.chat_id = cp2.chat_id
      WHERE c.is_group = FALSE
        AND cp1.user_id = $1
        AND cp2.user_id = $2
      LIMIT 1
      `,
      [user1_id, user2_id]
    );

    if (existingChat.rows.length > 0) {
      // Ya existe, devolver ese chat_id
      return res.status(200).json({ chat_id: existingChat.rows[0].chat_id });
    }

    // 2. Crear un nuevo chat (no grupo)
    const chatResult = await pool.query(
      `INSERT INTO chats (is_group) VALUES (FALSE) RETURNING chat_id`
    );

    if (!chatResult.rows[0]) {
      return res.status(500).json({ error: "Failed to create chat" });
    }

    const chatId = chatResult.rows[0].chat_id;

    // 3. Agregar ambos usuarios como participantes
    await pool.query(
      `INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2), ($1, $3)`,
      [chatId, user1_id, user2_id]
    );

    // 4. Retornar el chat creado
    return res.status(200).json({ chat_id: chatId });
  } catch (err) {
    console.error("Error creating chat:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//█▀▄▀█ ▄▀█ █▀█ █▄▀   █▀▀ █░█ ▄▀█ ▀█▀   ▄▀█ █▀   █▀█ █▀▀ ▄▀█ █▀▄
//█░▀░█ █▀█ █▀▄ █░█   █▄▄ █▀█ █▀█ ░█░   █▀█ ▄█   █▀▄ ██▄ █▀█ █▄▀
app.post("/mark_chat_as_read", async (req, res) => {
  const { chat_id, user_id } = req.body;

  if (!chat_id || !user_id) {
    return res.status(400).json({ error: "chat_id and user_id are required" });
  }

  try {
    const query = `
      INSERT INTO message_reads (chat_id, message_id, user_id, read_at)
      SELECT m.chat_id, m.message_id, $2, NOW()
      FROM messages m
      LEFT JOIN message_reads mr
        ON mr.message_id = m.message_id
       AND mr.chat_id = m.chat_id
       AND mr.user_id = $2
      WHERE m.chat_id = $1
        AND m.sender_id <> $2
        AND mr.message_id IS NULL
    `;

    await pool.query(query, [chat_id, user_id]);

    res.json({ success: true });
  } catch (err) {
    console.error("Error marking messages as read:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//=======================================================================================================
//░█████╗░██╗░░██╗░█████╗░████████╗  ███╗░░░███╗███████╗░██████╗░██████╗░█████╗░░██████╗░███████╗░██████╗
//██╔══██╗██║░░██║██╔══██╗╚══██╔══╝  ████╗░████║██╔════╝██╔════╝██╔════╝██╔══██╗██╔════╝░██╔════╝██╔════╝
//██║░░╚═╝███████║███████║░░░██║░░░  ██╔████╔██║█████╗░░╚█████╗░╚█████╗░███████║██║░░██╗░█████╗░░╚█████╗░
//██║░░██╗██╔══██║██╔══██║░░░██║░░░  ██║╚██╔╝██║██╔══╝░░░╚═══██╗░╚═══██╗██╔══██║██║░░╚██╗██╔══╝░░░╚═══██╗
//╚█████╔╝██║░░██║██║░░██║░░░██║░░░  ██║░╚═╝░██║███████╗██████╔╝██████╔╝██║░░██║╚██████╔╝███████╗██████╔╝
//░╚════╝░╚═╝░░╚═╝╚═╝░░╚═╝░░░╚═╝░░░  ╚═╝░░░░░╚═╝╚══════╝╚═════╝░╚═════╝░╚═╝░░╚═╝░╚═════╝░╚══════╝╚═════╝░
//█▀▀ █▀▀ ▀█▀   █▀█ █░░ █▀▄ █▀▀ █▀█   █▀▄▀█ █▀▀ █▀ █▀ ▄▀█ █▀▀ █▀▀ █▀
//█▄█ ██▄ ░█░   █▄█ █▄▄ █▄▀ ██▄ █▀▄   █░▀░█ ██▄ ▄█ ▄█ █▀█ █▄█ ██▄ ▄█
app.get("/get_older_messages/:chatId", async (req, res) => {
  const { chatId } = req.params;
  const { before_date, limit } = req.query;

  try {
    const query = `
      SELECT 
        m.message_id, 
        m.chat_id,
        m.sender_id, 
        u.username, 
        m.content, 
        m.created_at
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.chat_id = $1
        AND m.created_at < $2
      ORDER BY m.created_at DESC
      LIMIT $3
    `;

    const params = [
      chatId,
      before_date,
      limit || 20   // sensible default if not provided
    ];

    const { rows } = await pool.query(query, params);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//█▀ █▀▀ █▄░█ █▀▄   █▀▄▀█ █▀▀ █▀ █▀ ▄▀█ █▀▀ █▀▀
//▄█ ██▄ █░▀█ █▄▀   █░▀░█ ██▄ ▄█ ▄█ █▀█ █▄█ ██▄
app.post("/send-message", async (req, res) => {
  const { chatId, senderId, content } = req.body;

  try {
    // Step 1: Get the max message_id
    const { rows } = await pool.query(
      "SELECT MAX(message_id) AS max_id FROM messages WHERE chat_id = $1",
      [chatId]
    );

    let newId;

    if (!rows || rows.length === 0 || rows[0].max_id === null) {
      // No messages → check if chat exists
      const chatCheck = await pool.query("SELECT 1 FROM chats WHERE chat_id = $1", [chatId]);
      if (chatCheck.rowCount === 0) {
        return res.status(404).json({ error: "Chat not found" });
      }
      newId = 1; //Chat existe per aún no tiene mensajes.
    } else {
      // Messages exist → increment max_id
      newId = rows[0].max_id + 1;
    }

    // Step 2: Insert the new message
    const result = await pool.query(
      "INSERT INTO messages (chat_id, message_id, sender_id, content, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
      [chatId, newId, senderId, content]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

//█▀▄ █▀▀ █░░ █▀▀ ▀█▀ █▀▀   █▀▀ █░█ ▄▀█ ▀█▀   █▀▄▀█ █▀▀ █▀ █▀ ▄▀█ █▀▀ █▀▀ █▀
//█▄▀ ██▄ █▄▄ ██▄ ░█░ ██▄   █▄▄ █▀█ █▀█ ░█░   █░▀░█ ██▄ ▄█ ▄█ █▀█ █▄█ ██▄ ▄█
app.delete("/delete_chat_messages/:chatId", async (req, res) => {
    const { chatId } = req.params;
    const { deletedDate } = req.body;
    try {
        const result = await pool.query("DELETE FROM messages WHERE chat_id = $1", [chatId]);

        await pool.query(
        "UPDATE chats SET all_messages_deleted_at = $1 WHERE chat_id = $2",
        [deletedDate, chatId]
      );

       res.json({ message: "Chat messages cleaned", deleted: result.rowCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

//=======================================================================================
//░█████╗░██╗░░██╗░█████╗░████████╗  ███████╗██████╗░██╗███████╗███╗░░██╗██████╗░░██████╗
//██╔══██╗██║░░██║██╔══██╗╚══██╔══╝  ██╔════╝██╔══██╗██║██╔════╝████╗░██║██╔══██╗██╔════╝
//██║░░╚═╝███████║███████║░░░██║░░░  █████╗░░██████╔╝██║█████╗░░██╔██╗██║██║░░██║╚█████╗░
//██║░░██╗██╔══██║██╔══██║░░░██║░░░  ██╔══╝░░██╔══██╗██║██╔══╝░░██║╚████║██║░░██║░╚═══██╗
//╚█████╔╝██║░░██║██║░░██║░░░██║░░░  ██║░░░░░██║░░██║██║███████╗██║░╚███║██████╔╝██████╔╝
//░╚════╝░╚═╝░░╚═╝╚═╝░░╚═╝░░░╚═╝░░░  ╚═╝░░░░░╚═╝░░╚═╝╚═╝╚══════╝╚═╝░░╚══╝╚═════╝░╚═════╝░
//█▀▀ █▀▀ ▀█▀   █▀▀ █▀█ █ █▀▀ █▄░█ █▀▄ █▀
//█▄█ ██▄ ░█░   █▀░ █▀▄ █ ██▄ █░▀█ █▄▀ ▄█
app.get("/get_friends/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId || isNaN(Number(userId))) {
    return res.status(400).json({ error: "[api_get_friends] Invalid or missing userId" });
  }
  try {
    // Query both directions (user_id1 -> user_id2 and user_id2 -> user_id1)
    const query = `
      SELECT u.id, u.username
      FROM chat_friends cf
      JOIN users u ON u.id = cf.user_id2 AND cf.user_id1 = $1 
      ORDER BY u.username;
    `;

    const result = await pool.query(query, [userId]);

    res.json(result.rows); // returns array of friend objects
  } catch (err) {
    console.error("Error fetching friends:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//▄▀█ █▀▄ █▀▄   █▀▀ █▀█ █ █▀▀ █▄░█ █▀▄
//█▀█ █▄▀ █▄▀   █▀░ █▀▄ █ ██▄ █░▀█ █▄▀
app.post("/add_friend", async (req, res) => {
  const { userId, friendId } = req.body;

  // Basic validation
  if (!userId || !friendId || isNaN(Number(userId)) || isNaN(Number(friendId))) {
    return res.status(400).json({ error: "[api_add_friend] Invalid or missing userId/friendId" });
  }
  if (userId === friendId) {
    return res.status(400).json({ error: "[api_add_friend] Cannot add yourself as a friend" });
  }

  try {
    const query = `
      INSERT INTO chat_friends (user_id1, user_id2)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING;
    `;
    await pool.query(query, [userId, friendId]);

    res.json({ success: true, message: `Friendship added successfully between ${userId} and ${friendId}`});
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Error adding friend:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//█▀█ █▀▀ █▀▄▀█ █▀█ █░█ █▀▀   █▀▀ █▀█ █ █▀▀ █▄░█ █▀▄
//█▀▄ ██▄ █░▀░█ █▄█ ▀▄▀ ██▄   █▀░ █▀▄ █ ██▄ █░▀█ █▄▀
app.post("/remove_friend", async (req, res) => {
  const { userId, friendId } = req.body;

  // Basic validation
  if (!userId || !friendId || isNaN(Number(userId)) || isNaN(Number(friendId))) {
    return res
      .status(400)
      .json({ error: "[api_remove_friend] Invalid or missing userId/friendId" });
  }
  if (userId === friendId) {
    return res
      .status(400)
      .json({ error: "[api_remove_friend] Cannot remove yourself as a friend" });
  }

  try {
    const query = `
      DELETE FROM chat_friends
      WHERE (user_id1 = $1 AND user_id2 = $2);
    `;

    const result = await pool.query(query, [userId, friendId]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: `No friendship found between ${userId} and ${friendId}` });
    }

    res.json({
      success: true,
      message: `Friendship removed successfully between ${userId} and ${friendId}`,
    });
  } catch (err) {
    console.error("Error removing friend:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//===========================================
//██████╗░███████╗██████╗░███████╗██╗██╗░░░░░
//██╔══██╗██╔════╝██╔══██╗██╔════╝██║██║░░░░░
//██████╔╝█████╗░░██████╔╝█████╗░░██║██║░░░░░
//██╔═══╝░██╔══╝░░██╔══██╗██╔══╝░░██║██║░░░░░
//██║░░░░░███████╗██║░░██║██║░░░░░██║███████╗
//╚═╝░░░░░╚══════╝╚═╝░░╚═╝╚═╝░░░░░╚═╝╚══════╝
//█░░ █▀█ █▀▀ █ █▄░█
//█▄▄ █▄█ █▄█ █ █░▀█
app.post("/login", async (req, res) => {
  const { emailOrUsername,  password} = req.body;

  if (!emailOrUsername || !password) {
    return res.status(400).json({ error: "[API Endpoint] Missing login data." });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1 OR username = $1 AND password=$2", [emailOrUsername,password]);

    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


//█▀█ █▀▀ █▀▀ █ █▀ ▀█▀ █▀▀ █▀█
//█▀▄ ██▄ █▄█ █ ▄█ ░█░ ██▄ █▀▄
app.post("/register", async (req, res) => {
  const { email,username,password} = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ error: "[API Endpoint] Missing register data." });
  }

  try {
    const result = await pool.query("Insert into users (email,password,username) values ($1,$2,$3) RETURNING *", [email,password,username]);

    if (result.rows.length === 0) return res.status(404).json({ error: "Error, user not registered" });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting user:", err);
    // Handle unique constraint violation (Postgres error code 23505)
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email or username already exists" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

//█▀▀ █░█ ▄▀█ █▄░█ █▀▀ █▀▀   ▄▀█ █░█ ▄▀█ ▀█▀ ▄▀█ █▀█
//█▄▄ █▀█ █▀█ █░▀█ █▄█ ██▄   █▀█ ▀▄▀ █▀█ ░█░ █▀█ █▀▄
app.post("/upload-avatar", async (req, res) => {

  try{
    const { fileBase64, userId } = req.body;

    const arrayBuffer = decode(fileBase64);
    const { data, error } = await supabase.storage
      .from("recetarium")
      .upload(`images_users/${userId}/avatar.jpg`, arrayBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) return res.status(500).json({ error: error.message });

    const url = supabase.storage.from("recetarium").getPublicUrl(data.path).data.publicUrl;

    const result = await pool.query(`
      UPDATE users set avatar_url=$1 WHERE id = $2
    `, [url, userId]);

    res.json({ url: url });
  
  }catch(e){
    console.log(e);
  }
});
















//================================== START SERVER ===============================================================
//===============================================================================================================
// MUY IMPORTANTE PONER 0.0.0.0 PARA QUE SEA ACCESIBLE DESDE EL DISPOSITIVO MOVIL (POR EJEMPLO, si mi IP
// WINDOWS ES 192.168.1.5 Y MI MOVIL 192.168.1.8)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
