WEBSOCKET.JS tiene que estar en una carpeta aparte porque si no al compilar el proyecto expo peta.

La idea de utilizar websocket para chats es porque cuando un usuario manda un mensaje en el chats
se crea en la base de datos el mensaje pero el otro usuario del chat no tiene forma de saber que se
ha mandado un mensaje, a menos que este constantemente preguntando a la DB de si hay nuevos mensajes,
algo que no es nada eficiente. Esto lo soluciona websocket ya que cuando un usuario manda un mensaje
tambien le dice a los otros usuarios del chat mediante web socket de que hay un nuevo mensaje.

Dentro del servidor websocket se guarda una lista con los chats que hay activos y los clientes websocket
que hay suscritos a cada chat, por lo que solo se mandan los mensajes a ese cliente websocket.