const chatSection = $('.historial .content');

class UI {
	addChatBubble = (data, user) => {
		const {sender, message, date} = data
		let msgHTML;
		if(sender == user){
			msgHTML = `
				<div class="position-relative p-2 m-0">
			        <p class="float-right remitente">
						<b>${sender}</b>: ${message}
			          	<small>${moment(date).format('DD/MMM/YY-LT')}</small>
			        </p>
			    </div>
			`;
		}else{
			msgHTML = `
				<div class="position-relative p-2 m-0">
			        <p class="float-left destinatario">
						<b>${sender}</b>: ${message}
			          	<small>${moment(date).format('DD/MMM/YY-LT')}</small>
			        </p>
			    </div>
			`;
		}
		chatSection.append(msgHTML);			
	}
}

export default UI;
