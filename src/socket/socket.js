const socket = require('socket.io');
const connectDB = require('../mongoDB/DBconnection');
const DB = require('../mongoDB/class/DB');
const mongoDB = new DB();


const socketIO = server => {
	const io = socket(server);
	io.on('connect', async (socket) => {
		let socketId = socket.id;
		let receiverConnections = [];
		let user;

		socket.on('disconnect', async () => {
			console.log('---', user + ' disconnect: ' + socketId, '---');

			mongoDB.deleteConnection(user, socketId);
			mongoDB.setConnection(user, false);
			socket.broadcast.emit('userDisconnected', {user: user});
		});

		socket.on('newConnection', async (data) => {
			user = data.user;
			console.log('---', user +' connected: ' + socketId, '---');

			//Guardar conexion en la BD
			try {
		        // Verificamos si existe una conexion asociada el usuario
		        let existConnection = await mongoDB.searchConnection(user);

		        if (existConnection) {
		            mongoDB.updateConnections(user, socketId);
		        } else {
		            mongoDB.addNewConnection(user, socketId);
		        }
		    }catch(err){
		    	console.log(err)
		    }

			mongoDB.setConnection(user, true);
			socket.broadcast.emit('newConnection', {user: user});		
		});

		socket.on('typing', async (data) => {
			for(i in receiverConnections){
		    	socket.to(receiverConnections[i]).emit('typing', data);
			}
		});

		socket.on('stopTyping', (data) => {
			for(i in receiverConnections){
		    	socket.to(receiverConnections[i]).emit('stopTyping', data);
			}
		});

		socket.on('new_msg', async (data) => {
			const myConnections = await mongoDB.getConnections(user);
			receiverConnections = await mongoDB.getConnections(data.receiver);

		    await connectDB.then(async db => {
		    	let conversationExists = await mongoDB.searchConversation(data);
		    	
		    	if(!conversationExists){
		        	mongoDB.saveMessage(data);
		        }else{
		        	mongoDB.updateMessages(data);
		        }
		        
		    }).catch( err => console.log(err) );
		    
		    for(i in receiverConnections){
		    	io.to(receiverConnections[i]).emit('new_msg', (data));	    	
		    }
		    for(i in myConnections){
		    	io.to(myConnections[i]).emit('new_msg', (data));
		    }
		});

		socket.on('getMsg', async data => {
			// Obtenemos y establecemos los id de las conexiones del receptor
			receiverConnections = await mongoDB.getConnections(data.receiver);
	
			// obtener mensajes privados
			const messages = await mongoDB.getMessages(data);
			io.to(socketId).emit('privateMessages', (messages));
		});
	})
}

module.exports = socketIO;
