import Socket from './class/Socket.js';
import Chat from './class/Chat.js';

const socket = new Socket();
const chat = new Chat();

const sendBtn = $('#send');
const input_msg = $('#mensaje');
let typing = false;
let typingTimer;    //timer identifier 
const doneTypingInterval = 1000; //time in ms (5 seconds) 
const user = $('.perfil > p').text();

$(document).ready(function(){
  	$('.historial').scrollTop($(".historial")[0].scrollHeight);

  	//cambiar color del boton
  	$("#send").click(function(){
    	$(this).css("background-color","#FFA726");
    	setTimeout(function(){
      	$("#send").css("background-color","#FFCC80");
    	},300);
	});
  	
  	$("#back").click(function(){
    	socket.setReceiver("");
    	$(".inf").css("display","block");
    	$(".chat").css("display","none");
  	});
});

//on keyup, start the countdown 
input_msg.keyup(function(){
    clearTimeout(typingTimer);
    if (input_msg.val() !== "") {
    	if(typing == false){
			typing = true;
			socket.emitTyping();
		}
     	typingTimer = setTimeout(doneTyping, doneTypingInterval);
    }
});

//user is "finished typing," do something 
function doneTyping() { 
	typing = false;
    socket.emitStopTyping();
}

sendBtn.click( function() {
	if(input_msg.val() !== "" && socket.getReceiver() !== ""){
		socket.emitNewMsg(input_msg.val());
		$(input_msg).val("");
	}
});

socket.onNewConnection();
socket.onDisconnection();
socket.onNewMsg();
socket.onMsg();
socket.onTyping();
socket.onStopTyping();

// ------------------------------------------

var  width = $(window).width();//alamacena valor del tamaño de la pagina

  //detecta cambio del tamaño de la pagina
  $(window).resize(function(){
    if($(window).width()!=width){
      width = $(window).width();//actualiza el valor de width
    }
  });

//Cambiar datos del contacto(cabecera)
$(".perfiles .contact").click(function(){
  	let contact_established = $(this).find("b").text();
  	let img = $("img", this).attr("src");

  	$(".cabecera p").text(contact_established);
  	$(".cabecera img").attr("src",img);      


    chat.setReceiver(contact_established);
  	socket.setReceiver(contact_established);
  	socket.emitGetMsg();

    if(width < 992){
      	$(".inf").css("display","none");
      	$(".chat").css("display","block");
    } 
});
