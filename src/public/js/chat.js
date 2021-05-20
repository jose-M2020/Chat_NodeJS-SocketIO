const socket = io();

const button = $('#send');
const input_msg = $('#mensaje');
const chat = $('.historial .content');

var typing = false;
var typingTimer;    //timer identifier 
var doneTypingInterval = 1000; //time in ms (5 seconds) 

//on keyup, start the countdown 
input_msg.keyup(function(){
    clearTimeout(typingTimer);
    if (input_msg.val() != "") {
    	if(typing == false){
			typing = true;

			socket.emit('typing', {
				user: user,
				sender: contact_established
			})
		}
     	typingTimer = setTimeout(doneTyping, doneTypingInterval);
    } 
}); 

//user is "finished typing," do something 
function doneTyping() { 
	typing = false;

    socket.emit('stopTyping', {
		user: user,
		sender: contact_established
	});
}

// --------New user logged----------------
if(user != null){
	socket.emit('newUser', {user: user});
}

button.click( function() {
	var receiver = $("#usernameReceiver").text();

	if(receiver == ""){
		receiver = "public";
	}
	if(input_msg.val() != ""){
		socket.emit('new_msg', {
			message: input_msg.val(),
			sender: user,
			receiver: receiver,
			date: new Date
		});
	}
	$(input_msg).val("");
});

socket.on('newUser', function(user){
	$(`#${user.user} .status`).attr('id', 'online');
});

socket.on('userDisconnected', function(data) {
	$(`#${data.user} .status`).attr('id', 'offline');
});


socket.on('new_msg', function(data){
	if(contact_established != undefined){
		if(data.sender == contact_established || data.sender == user){
			if(data.sender == user){
				chat.append(`
					<div class="position-relative p-2 m-0">
				        <p class="float-right remitente">
							<b>${data.sender}</b>: ${data.message}
				          	<small>${moment(data.date).format('DD/MMM/YY-LT')}</small>
				        </p>
				    </div>
				`);
			}else{
				chat.append(`
					<div class="position-relative p-2 m-0">
				        <p class="float-left destinatario">
							<b>${data.sender}</b>: ${data.message}
				          	<small>${moment(data.date).format('DD/MMM/YY-LT')}</small>
				        </p>
				    </div>
				`);
			}
			$('.historial').animate({scrollTop: $(".historial").prop("scrollHeight")},200);
		}else{
			notification(data.sender);
		}
	}else{
		notification(data.sender);
	}
});

function notification(user){
	$('.perfiles #' + user).
	append('<div style="background: lightblue; width: 20px; height: 20px; border-radius: 50%; position: absolute; right: 13px; top: 32px; padding-left: 6px;">1</div>');
}


socket.on('privateMessages', function(messages){
	chat.empty();

	if(messages.length > 0){
		var msg;
		for(var i in messages){
			if(messages[i].sender == user){
				msg = `
					<div class="position-relative p-2 m-0">
				        <p class="float-right remitente">
							<b>${messages[i].sender}</b>: ${messages[i].message}
				          	<small>${moment(messages[i].date).format('DD/MMM/YY-LT')}</small>
				        </p>
				    </div>
				`;
			}else{
				msg = `
					<div class="position-relative p-2 m-0">
				        <p class="float-left destinatario">
							<b>${messages[i].sender}</b>: ${messages[i].message}
				          	<small>${moment(messages[i].date).format('DD/MMM/YY-LT')}</small>
				        </p>
				    </div>
				`;
			}
			chat.append(msg);
		}

		$('.historial').animate({scrollTop: $(".historial").prop("scrollHeight")},200);
	}else{
		chat.append('<h4 style="color: white; text-align: center; margin-top: 20px;"> Inicia una conversacion</h4>');
	}
});

var lastMsg;
socket.on('typing', function(data){
	if(data.user == contact_established){
		$('.state').append(`<small id="typing" style="color: lightgreen">Escribiendo...</small>`);		
	}else{
		lastMsg = $(`.perfiles #${data.user} p`).text();
		$(`.perfiles #${data.user} p`).replaceWith('<p id="typing" style="color: #2C9F37">Escribiendo...</p>');
	}
});

socket.on('stopTyping', function (data) {
	if(data.user == contact_established){
		$('.state #typing').remove();
	}else{
		$(`.perfiles #${data.user} p`).replaceWith(`<p>${lastMsg}</p>`);
	}
});
