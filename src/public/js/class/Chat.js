import UI from './UI.js';

const socket = io();
const ui = new UI();
const sendBtn = $('#send');
const input_msg = $('#mensaje');
const chatSection = $('.historial .content');

class Chat {
	constructor() {
		this.sender = '';
		this.receiver = '';
		this.messages = [];
		this.notifications = [];
		this.contacts = [];
	}

	setUser(user){
		this.sender = user;
	}

	setReceiver(receiver){
		this.receiver = receiver;
	}
	
	setMessages = messages => {
		console.log(messages);
		if(messages){
			// Si messages representa un array vacio (en el caso de haber obtenido datos, y posteriormente no) o con datos entra a esta condición.
			this.messages = [...messages];
			for(let i in messages){
				ui.addChatBubble(messages[i], this.sender, 'top');
			}
		}else{
			// Si messages no tiene valor
			chatSection.append('<h4 style="color: white; margin: 100px auto;"> Inicia una conversacion</h4>');
		}
	}

	setNotifications = () => {

	}

	setContacts = () => {

	}

	getMessagges = () => {
		
	}

	getNotifications = () => {

	}

	getContacts = () => {

	}
}

export default Chat;