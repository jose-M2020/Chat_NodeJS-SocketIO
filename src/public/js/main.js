var contact_established;

$(document).ready(function(){

  $('.historial').scrollTop($(".historial")[0].scrollHeight);

  //cambiar color del boton
  $("#send").click(function(){
    $(this).css("background-color","#FFA726");
    setTimeout(function(){
      $("#send").css("background-color","#FFCC80");
    },300);
    
  });


  var  width = $(window).width();//alamacena valor del tamaño de la pagina

  //detecta cambio del tamaño de la pagina
  $(window).resize(function(){
      
    if($(window).width()!=width){
      width = $(window).width();//actualiza el valor de width

    }
  });

  //Cambiar datos del contacto(cabecera)
 

    $(".perfiles .contact").click(function(){
      contact_established = $(this).find("b").text();
      var img = $("img", this).attr("src");

      $(".cabecera p").text(contact_established);
      $(".cabecera img").attr("src",img);
        
      socket.emit('getMsg', {
        sender: user, //el nombre del sender(user) es obtenido a travez del prompt ubicado en chat.js
        receiver: contact_established
      });
        if(width < 992){
          // $("#back").css("display","block");
          // $(".inf").addClass("hide");
          // $(".chat").addClass("show");

          $("#back").css("display","block");
          $(".inf").css("display","none");
          $(".chat").css("display","block");
        } 
    });

  $("#back").click(function(){
    contact_established = "";

    $(".inf").css("display","block");
    $(".chat").css("display","none");
    // $("#chat").addClass("hide");
    // $(".inf").removeClass("hide");
  });
});