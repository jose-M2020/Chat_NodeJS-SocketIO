const chatSection = $('.historial .content');

class UI {
	addChatBubble = (data, user, direction) => {
		const {sender, message, date} = data;
		let msgHTML;
		if(sender == user){
			msgHTML = `
				<div class="message message-out">
				    <p>${message}</p>
				    <small>${moment(date).format('LT')}</small>
			    </div>
			`;
		}else{
			msgHTML = `
				<div class="message message-in">
				    <p>${message}</p>
				    <small>${moment(date).format('LT')}</small>
			    </div>
			`;
		}
		direction === 'top' ? chatSection.prepend(msgHTML) : chatSection.append(msgHTML)			
	}
}

export default UI;
