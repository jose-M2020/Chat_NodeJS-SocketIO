import UI from './UI.js';

const socket = io(),
		 ui = new UI(),
		 sendBtn = $('#send'),
		 input_msg = $('#mensaje'),
		 chatSection = $('.historial .content'),
		 user = $('.perfil .perfil__username').text();

class Chat {
	sender = '';
	receiver = '';
	receiverId = null;
	messages = {};
	notifications = [];
	contacts = [];

	static instance;
		
	constructor(sender, receiver) {
		this.sender = sender;
		this.receiver = receiver;

		if(!!Chat.instance){
			return Chat.instance;
		}
		Chat.instance = this;
	}

	setUser(user){
		this.sender = user;
	}

	set receiver(receiver){
		this.receiver = receiver;
	}

	get receiver(){
		return this.receiver;
	}
	
	setMessages(messages){
		if(!this.messages.hasOwnProperty(this.receiverId)){
			this.messages[this.receiverId] = messages;
		}else{
			const msgs = this.messages[this.receiverId];
			const msgExist = msgs.find(msg => msg?._id == messages[0]?._id);
			
			if(msgExist){
				console.log('existe');
				// this.messages = [...this.messages]
			}else{
				console.log('no existe');
				this.messages[this.receiverId] = [...this.messages[this.receiverId], ...messages]
			}
		}

		console.log(this.messages);

		if(messages){
			messages.forEach((msg, i) => {
				const initBlock = messages[i+1]?.sender === msg.sender ? true : false; 
				ui.addChatBubble(msg, this.sender, 'top', initBlock);
			});

			// for(let i in messages){
			// 	ui.addChatBubble(messages[i], this.sender, 'top');
			// }
		}else{
			// Si messages no tiene valor
			chatSection.append('<h4 style="color: white; margin: 100px auto;"> Inicia una conversacion</h4>');
		}
	}

	get messages(){
		return this.messages;
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

const chat = new Chat(user, ''); 
export default chat;