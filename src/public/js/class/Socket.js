import chat from './Chat.js';
import UI from './UI.js';

const socketIO = io(),
		  ui = new UI();
let previousHeight

class Socket{
	static instance;

	constructor(){
		if(!!Socket.instance){
			return Socket.instance;
		}
		
		this.isLastMessage = false;
		
		socketIO.on('connect', () => {
			const idSocket = socketIO.id,
					 user = $('.perfil .perfil__username').text();
					 
			chat.sender = user;
			socketIO.emit('newConnection', {user});
		})

		Socket.instance = this;
	}

	setLastMsg(state){
		this.isLastMessage = state
	}

	// emitNewConnection(user) {
	// 	socketIO.emit('newConnection', {user: chat.sender});
	// 	chat.sender = user;
	// }

	onNewConnection() {
		socketIO.on('newConnection', ({user}) => {
			$(`#${user} .status`).attr('id', 'online');
		});
	}

	onDisconnection() {
		socketIO.on('userDisconnected', ({user}) => {
			$(`#${user} .status`).attr('id', 'offline');
		});
	}

	emitNewMsg({message, urlImg}) {
		if(chat.receiver !== ""){
			const data = {
				message,
				urlImg,
				sender: chat.sender,
				receiver: chat.receiver,
				date: new Date
			}

			$(`.perfiles [data-username="${chat.receiver}"]`).prependTo('.perfiles');

			socketIO.emit('new_msg', data);
			// TODO hacer cambios

			console.log(chat.messages);

			ui.addChatBubble( data, chat.sender, 'bottom');
			$('.historial').animate({scrollTop: $(".historial").prop("scrollHeight")},200);
		}else{
			toastr.warning('Selecciona un usuario.', '¿Con quién quieres chatear?');
		}
	}

	onNewMsg() {
		socketIO.on('new_msg', data => {
			const {sender, receiver} = data;

			// Colocar el contacto en la parte superior
			$(`.perfiles [data-username="${sender}"]`).prependTo('.perfiles');

			// Esta condicion es para el receptor. Si el receptor establecion chat con el emisor del mensaje, muestra el mensaje, sino, muestra una notificacion en la seccion del emisor.
			if( sender === chat.receiver || sender === chat.sender){
				// Esta condicion es para el front-end del emisor, cuando el emisor tiene dos o más pestañas abiertas, y en una de ellas envia un mensaje, en las otras pestañas no se vera reflejado, si no a seleecionado al receptor del mensaje
				if(chat.receiver === receiver || chat.receiver === sender) {
					ui.addChatBubble(data, chat.sender,'bottom');
					$('.historial').animate({scrollTop: $(".historial").prop("scrollHeight")},200);
				}
			}else{
				// toastr.options.preventDuplicates = false;
				// toastr.info(`${sender} te ha enviado un nuevo mensaje.`);
				notification(sender);
			}
		});
	}

	emitGetMsg(page) {
		if(!this.isLastMessage){
			previousHeight = $('.historial .content').height();
	   		$('.spinner').css('display', 'block');

			// Realizamos una peticion al servidor para obtener mensajes
	      	socketIO.emit('getMsg', {
	       		sender: chat.sender,
	        	receiver: chat.receiver,
	        	page: page
	      	});
	    }
	}

	onMsg() {
		socketIO.on('privateMessages', async ({conversation, finish}) => {
			this.isLastMessage = finish;
			
			await chat.setMessages(conversation);
			$('.historial').scrollTop($('.historial .content').height() - previousHeight);
    		$('.spinner').css('display', 'none');
		});
	}

	emitTyping() {
		socketIO.emit('typing', {
			sender: chat.sender,
			receiver: chat.receiver
		})
	}

	onTyping() {
		socketIO.on('typing', sender => {
			if(sender == chat.receiver){
				$('.state').append(`<small id="typing" style="color: #86e6f1">Escribiendo...</small>`);		
			}else{
				// let lastMsg = $(`.perfiles #${sender} p`).text();
				$(`.perfiles #${sender} p`).replaceWith('<p id="typing" style="color: #86e6f1">Escribiendo...</p>');
			}
		});
	}

	emitStopTyping() {
		socketIO.emit('stopTyping', {
			sender: chat.sender,
			receiver: chat.receiver
		});
	}

	onStopTyping() {
		socketIO.on('stopTyping', sender => {
			if(sender == chat.receiver){
				$('.state #typing').remove();
			}else{
				$(`.perfiles #${sender} p`).replaceWith(`<p>Test message</p>`);
			}
		});
	}
}

function notification(user){
	$('.perfiles #' + user).
	append('<div style="background: lightblue; width: 20px; height: 20px; border-radius: 50%; position: absolute; right: 13px; top: 32px; padding-left: 6px;">1</div>');
}

const socket = new Socket(); 
export default socket;
