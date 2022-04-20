const socket = require('socket.io');
const connectDB = require('../mongoDB/DBconnection');
const DB = require('../mongoDB/class/DB');
const mongoDB = new DB();
const NotificationSubscription = require('../mongoDB/models/notificationSubscription');
const webpush = require("../webpush");

const socketIO = server => {
	const io = socket(server);
	io.on('connect', async (socket) => {
		let socketId = socket.id;
		let user;

		socket.on('disconnect', async () => {
			console.log('---', user + ' disconnect: ' + socketId, '---');

			mongoDB.deleteConnection(user, socketId);
			mongoDB.setConnection(user, false);
			socket.broadcast.emit('userDisconnected', {user: user});
		});

		socket.on('newConnection', async data => {
			user = data.user;
			socket.join(user);
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

		socket.on('typing', async data => {
			socket.to(data.receiver).emit('typing', data.sender);
		});

		socket.on('stopTyping', data => {
			socket.to(data.receiver).emit('stopTyping', data.sender);
		});

		socket.on('new_msg', async data => {
			const {receiver, sender} = data;

		    await connectDB.then(async db => {
		    	let conversationExists = await mongoDB.searchConversation(data);
		    	if(!conversationExists){
		        	mongoDB.saveMessage(data);
		        }else{
		        	mongoDB.updateMessages(data);
		        }
				
				const pushSubscripton = await NotificationSubscription.findOne({user: receiver}).lean();
				if(pushSubscripton){
					try {
						await webpush.sendNotification(pushSubscripton, JSON.stringify(data));
					} catch (error) {
						console.log(error);
					}
				}
		    }).catch( err => console.log(err) );

		    socket.to(receiver).to(sender).emit('new_msg', (data));
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
