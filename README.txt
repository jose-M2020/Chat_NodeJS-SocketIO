Brach test

Errores:

	- Una ves que haya establecido el chat con un receptor especifico, y el receptor recarga la pagina (cambia de id socket), el emisor no podra enviar el evento (socket.emit) de escribiendo y no escribiendo, ya que el id socket sera otro. Para ello debe volver a seleccionar el receptor.

    - boton de regresar: no alterar el css 

    - Ajustar las imagenes al contenedor

Funciones faltantes:

	- Mostrar vistas dependiendo del rol del usuario (asignación de roles).

	- Envio de solicitudes para poder enviar mensajes a un usuario especifico.

	- Vista para mostrar todos los usuarios y mostrar los usuarios que hayan aceptado la solicitud en la seccion izquierda del chat.

	- Buscar usuarios.