import Chat from './Chat.js';
import UI from './UI.js';

const socket = io();
const ui = new UI();
const chat = new Chat();
const user = $('.perfil > p').text();
let previousHeight

let idSocket;
socket.on('connect', () => {
	idSocket = socket.id;
	socket.emit('newConnection', {user: user});
	chat.setUser(user);
})

class Socket {
	constructor(){
		this.receiver = "";
		this.lastMsg = false;	// Para verificar si es el último mensaje
	}

	setReceiver(receiver) {
		this.receiver = receiver;
	}

	setLastMsg(state){
		this.lastMsg = state
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
					ui.addChatBubble(data, user,'bottom');
					$('.historial').animate({scrollTop: $(".historial").prop("scrollHeight")},200);
				}
			}else{
				notification(data.sender);
			}
		});
	}

	emitGetMsg(page) {
		// Comprobamos que haya más mensajes por mostrar
		if(!this.lastMsg){
			previousHeight = $('.historial .content').height();
	   		$('.spinner').css('display', 'block');

			// Realizamos una peticion al servidor para obtener mensajes
	      	socket.emit('getMsg', {
	       		sender: user, //el nombre del sender(user) es obtenido a travez del prompt ubicado en chat.js
	        	receiver: this.receiver,
	        	page: page
	      	});
	    }
	}

	onMsg() {
		socket.on('privateMessages', async ({conversation, finish}) => {
			this.lastMsg = finish;
			
			await chat.setMessages(conversation);
			$('.historial').scrollTop($('.historial .content').height() - previousHeight);
    		$('.spinner').css('display', 'none');
		});
	}

	emitTyping() {
		socket.emit('typing', {
			sender: user,
			receiver: this.receiver
		})
	}

	onTyping() {
		socket.on('typing', sender => {
			if(sender == this.receiver){
				$('.state').append(`<small id="typing" style="color: lightgreen">Escribiendo...</small>`);		
			}else{
				// let lastMsg = $(`.perfiles #${sender} p`).text();
				$(`.perfiles #${sender} p`).replaceWith('<p id="typing" style="color: #2C9F37">Escribiendo...</p>');
			}
		});
	}

	emitStopTyping() {
		socket.emit('stopTyping', {
			sender: user,
			receiver: this.receiver
		});
	}

	onStopTyping() {
		socket.on('stopTyping', sender => {
			if(sender == this.receiver){
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

export default Socket;
