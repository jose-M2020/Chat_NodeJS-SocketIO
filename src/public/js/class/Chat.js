import UI from './UI.js';

const ui = new UI(),
		 chatSection = $('.historial .content');

class Chat {
	sender = '';
	receiver = '';
	receiverId = null;
	messages = [];
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
	
	/**
	 * 
	 * @param {arrayObjects} messages
	 * [{
	*	message: String,
	*	urlImg: String,
	*	sender: String,
	*	receiver: String,
	*	date: Date
	 * }]
	 * @param {string} position - top or bottom 
	 */
	setMessages(messages, position = 'top'){
		// Creado para guardar los datos en un objeto de los mensajes solicitados de cada remitente

		// if(!this.messages.hasOwnProperty(this.receiverId)){
		// 	this.messages[this.receiverId] = messages;
		// }else{
		// 	const msgs = this.messages[this.receiverId];
		// 	const msgExist = msgs ? msgs.find(msg => msg?._id == messages[0]?._id) : [];
			
		// 	if(msgExist){
		// 		console.log('existe');
		// 		// this.messages = [...this.messages]
		// 	}else{
		// 		console.log('no existe');
		// 		this.messages[this.receiverId] = [...this.messages[this.receiverId], ...messages]
		// 	}
		// }

		const isNewMsg = position === 'top' ? false : true;

		if(messages){
			if(this.messages.length && !isNewMsg){
				const lastMsgShowed = $('.historial .message:first-child');
				messages[0].sender === lastMsgShowed.attr('data-sender') ? lastMsgShowed.removeClass('bubble') : '';
			}

			messages.forEach((msg, i) => {
				let initBlock;
				if(!isNewMsg){
					initBlock = messages[i+1]?.sender === msg.sender ? true : false; 
				}else{
					initBlock = this.messages[0]?.sender === msg.sender ? true : false;
				}
				ui.addChatBubble(msg, this.sender, position, initBlock);
			});

			// for(let i in messages){
			// 	ui.addChatBubble(messages[i], this.sender, 'top');
			// }
		}else{
			// Si messages no tiene valor
			chatSection.append('<h4 style="color: white; margin: 100px auto;"> Inicia una conversacion</h4>');
		}

		if(isNewMsg){
			this.messages = [...messages, ...this.messages];
		}else{
			const hasMessage = this.messages ? this.messages.find(msg => msg?._id == messages[0]?._id) : [];
	
			if(!hasMessage && messages?.length ){
				this.messages = [...this.messages, ...messages];
				console.log(this.messages);
			}
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