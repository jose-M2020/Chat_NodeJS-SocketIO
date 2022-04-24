const chatSection = $('.historial .content');
const searchSection = $('.results__sticker-container .row');

class UI {
	addChatBubble = (data, user, direction, initBlock) => {
		const {sender, message, urlImg, date} = data;
		// console.log(initBlock, ': ', sender)

		let msgHTML;
		if(sender == user){
			if(urlImg?.length){
				msgHTML = `
					<div class="message message-out bubble mt-3 animate__animated animate__fadeInDown" data-sender="${sender}">
						<img class="w-100" src="${urlImg}">
						<div>
							<div class="d-flex align-items-center justify-content-between">
								<small>${moment(date).format('LT')}</small>
								<span>
									<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="check-circle" class="svg-inline--fa fa-check-circle fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"></path></svg>
								</span>
							</div>
						</div>
					</div>
				`;
			}else{
				msgHTML = `
					<div class="message message-out animate__animated animate__fadeInDown ${!initBlock ? 'bubble' : ''}" data-sender="${sender}">
						<div>
							<p class="mb-0">${message}</p>
							<div class="d-flex align-items-center justify-content-between">
								<small>${moment(date).format('LT')}</small>
								<span class="ml-2">
									<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="check-circle" class="svg-inline--fa fa-check-circle fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"></path></svg>
								</span>
							</div>
						</div>
					</div>
				`;
			}
		}else{
			if(urlImg?.length){
				msgHTML = `
					<div class="message message-in bubble mt-3 animate__animated animate__fadeInDown" data-sender="${sender}">
						<img class="w-100" src="${urlImg}">
						<div>
							<small>${moment(date).format('LT')}</small>
						</div>
					</div>
				`;
			}else{
				msgHTML = `
					<div class="message message-in animate__animated animate__fadeInDown ${!initBlock ? 'bubble' : ''}" data-sender="${sender}">
						<div>
							<p class="mb-0">${message}</p>
							<small>${moment(date).format('LT')}</small>
						</div>
					</div>
				`;
			}
		}
		direction === 'top' ? chatSection.prepend(msgHTML) : chatSection.append(msgHTML)			
	}

	addSticker({data}){

	}

	addResultsStickers({data}){
		searchSection.empty();
		data.forEach(item => {
			const element = `
			<div class="col-4 col-md-4 text-center item__sticker-container">
				<img class="w-100" src="${item.images.downsized_medium.url}" alt="${item.title}">
			</div>
			`;

			searchSection.append(element);
		});
	}	
}

export default UI;
