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
		chatSection.empty();
		if(messages.length > 0){
			this.messages = [...messages];
			for(let i in messages){
				ui.addChatBubble(messages[i], this.sender)
			}
			$('.historial').animate({scrollTop: $(".historial").prop("scrollHeight")},200);
		}else{
			chatSection.append('<h4 style="color: white; text-align: center; margin-top: 20px;"> Inicia una conversacion</h4>');
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