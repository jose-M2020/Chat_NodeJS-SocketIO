import Chat from './Chat.js';
import UI from './UI.js';

const socket = io();
const ui = new UI();
const chat = new Chat();
const user = $('.perfil > p').text();

let idSocket;
socket.on('connect', () => {
	idSocket = socket.id;
	socket.emit('newConnection', {user: user});
	chat.setUser(user);
})

class Socket {
	constructor(){
		this.receiver = "";
	}

	setReceiver(receiver) {
		this.receiver = receiver;
	}

	getReceiver(){
		return this.receiver;
	}

	emitNewConnection(user) {
		socket.emit('newConnection', {user: user});
		chat.setUser(user);
	}

	onNewConnection() {
		socket.on('newConnection', user => {
			$(`#${user.user} .status`).attr('id', 'online');
		});
	}

	onDisconnection() {
		socket.on('userDisconnected', data => {
			$(`#${data.user} .status`).attr('id', 'offline');
		});
	}

	emitNewMsg(msg) {
		socket.emit('new_msg', {
			message: msg,
			sender: user,
			receiver: this.receiver,
			date: new Date
		});
	}

	onNewMsg() {
		socket.on('new_msg', data => {
			// Esta condicion es para el receptor. Si el receptor establecion chat con el emisor del mensaje, muestra el mensaje, sino, muestra una notificacion en la seccion del emisor.
			if( data.sender === this.receiver || data.sender === user){
				// Esta condicion es para el front-end del emisor, cuando el emisor tiene dos o más pestañas abiertas, y en una de ellas envia un mensaje, en las otras pestañas no se vera reflejado, si no a seleecionado al receptor del mensaje
				if(this.receiver === data.receiver || this.receiver === data.sender) {
					ui.addChatBubble(data, user);
					$('.historial').animate({scrollTop: $(".historial").prop("scrollHeight")},200);
				}
			}else{
				notification(data.sender);
			}
		});
	}

	emitGetMsg() {
		// Realizamos una peticion al servidor para obtener mensajes
      	socket.emit('getMsg', {
       		sender: user, //el nombre del sender(user) es obtenido a travez del prompt ubicado en chat.js
        	receiver: this.receiver
      	});
	}

	onMsg() {
		socket.on('privateMessages', messages => {
			chat.setMessages(messages);
		});
	}

	emitTyping() {
		socket.emit('typing', {
			user: user,
			sender: this.receiver
		})
	}

	onTyping() {
		socket.on('typing', data => {
			if(data.user == this.receiver){
				$('.state').append(`<small id="typing" style="color: lightgreen">Escribiendo...</small>`);		
			}else{
				// let lastMsg = $(`.perfiles #${data.user} p`).text();
				$(`.perfiles #${data.user} p`).replaceWith('<p id="typing" style="color: #2C9F37">Escribiendo...</p>');
			}
		});
	}

	emitStopTyping() {
		socket.emit('stopTyping', {
			user: user,
			sender: this.receiver
		});
	}

	onStopTyping() {
		socket.on('stopTyping', data => {
			if(data.user == this.receiver){
				$('.state #typing').remove();
			}else{
				$(`.perfiles #${data.user} p`).replaceWith(`<p>Test message</p>`);
			}
		});
	}
}

function notification(user){
	$('.perfiles #' + user).
	append('<div style="background: lightblue; width: 20px; height: 20px; border-radius: 50%; position: absolute; right: 13px; top: 32px; padding-left: 6px;">1</div>');
}

export default Socket;
