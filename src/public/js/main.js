import Socket from './class/Socket.js';
import Chat from './class/Chat.js';

const socket = new Socket();
const chat = new Chat();

const sendBtn = $('#send');
const inputMsg = $('#mensaje');
const chatSection = $('.historial .content');
const user = $('.perfil > p').text();

let typing = false;
let typingTimer;    //timer identifier 
const doneTypingInterval = 1000; //time in ms (5 seconds)

// ---------------- Boton y flecha de regresar -------------
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

// ----------------------- Emit writing socket ----------------------

//on keyup, start the countdown 
inputMsg.keyup(function(){
    clearTimeout(typingTimer);
    if (inputMsg.val() !== "") {
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

// --------------------- Send message --------------------
sendBtn.click( function() {
	if(inputMsg.val() !== "" && socket.getReceiver() !== ""){
		socket.emitNewMsg(inputMsg.val());
		$(inputMsg).val("");
	}
});

// --------------------- Sockets - On -------------------
socket.onNewConnection();
socket.onDisconnection();
socket.onNewMsg();
socket.onTyping();
socket.onStopTyping();

socket.onMsg();

// --------------- Infinite scroll - load data ------------
let isLoading = false;
let page = 0;

// Load more data
const loadData = () => {
    page++;
    socket.emitGetMsg(page);
    isLoading = false;
}

// Event Scroll
$('.historial').scroll(e => {
  const { scrollTop, scrollHeight, offsetHeight } = e.target;
  
  // Verificamos que el usuario haya hecho scroll hasta la parte superior. Que exista un scrollbar, calculando que el total de scroll del contenedor sea mayor a la altura del div, ademas evitamos que en ocasiones haga un emit dos veces.
  // Y finalmente verificamos que isLoading sea falso, para cargar los datos una vez
  if(scrollTop < 50 && scrollHeight > offsetHeight && !isLoading){
    isLoading = true;
    loadData()
  }
})

// ------------------------------------------

// Almacena valor del tamaño de la pagina
var  width = $(window).width();

//Detecta cambio del tamaño de la pagina
$(window).resize(function(){
  if($(window).width()!=width){
    width = $(window).width();//actualiza el valor de width
  }
});

//Cambiar datos del contacto(cabecera)
$(".perfiles .contact").click(function(){
  	let contact_established = $(this).find("b").text();
  	let img = $("img", this).attr("src");
    page = 1;
    chatSection.empty();

  	$(".cabecera p").text(contact_established);
  	$(".cabecera img").attr("src",img);      

    chat.setReceiver(contact_established);
  	socket.setReceiver(contact_established); // Definimos el receptor
    socket.setLastMsg(false);
  	socket.emitGetMsg(page);

    if(width < 992){
      	$(".inf").css("display","none");
      	$(".chat").css("display","block");
    } 
});
