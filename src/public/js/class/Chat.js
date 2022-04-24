import UI from './UI.js';

const ui = new UI(),
		 chatSection = $('.historial .content');

class Chat {
	sender = '';
	receiver = '';
	receiverId = null;
	messages = {};
	notifications = [];
	contacts = [];

	static instance;
		
	constructor() {
		if(!!Chat.instance){
			return Chat.instance;
		}
		Chat.instance = this;
	}

	setUser(user){
		this.sender = user;
	}

	set sender(sender){
		this.sender = sender;
	}

	get sender(){
		return this.sender;
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
			const msgExist = msgs ? msgs.find(msg => msg?._id == messages[0]?._id) : [];
			
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

const chat = new Chat(); 
export default chat;