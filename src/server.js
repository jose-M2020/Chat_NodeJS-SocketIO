const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const bodyParser = require("body-parser");
const session  = require('express-session'); 
const flash = require('connect-flash')
const passport = require('passport');

const socket = require('socket.io');
const message = require('./mongoDB/models/messages');
const User = require('./mongoDB/models/users');
const Connection = require('./mongoDB/models/connections');

const express = require('express');

// initiliazations
const app = express();
require('./config/passport');
const connectDB = require('./mongoDB/DBconnection');

app.use(bodyParser.json());
// Settings
app.use(express.static(path.join(__dirname, 'public')));

app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));

app.engine('.hbs', exphbs({				
	defaultLayout: 'main',
	layoutsDir: path.join(app.get('views'), 'layouts'), //define la ruta del main.hbs, concatenando con la dir de views ya creada
	partialsDir: path.join(app.get('views'), 'partials'),  //los partials son pequeñas partes de html que podemos reutiliar en cualquier vista
	extname: '.hbs',     //extension que van a tener nuestros archivos
	helpers: require('./libs/moment')
}));
app.set('view engine', '.hbs');

// Middleware
app.use(express.urlencoded({extended: false}));	//urlencoded sirve cuando un determinado dato se envia, pueda entenderlo
app.use(methodOverride('_method')); 
app.use(session ({
	secret: 'secretApp',
	resave: true,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Global variables
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;	//obtenemos la informacion del usuario logueado, ya que cuando se autentica un usuario, passport gusrda la info. de usuario en un arreglo
	// res.locals.username = req.user.username;
	if(req.user != undefined){
		res.locals.username = req.user.username;
		res.locals.avatar = req.user.avatar;
	}
	next();
});

// Server
const server = app.listen(app.get('port'), () => {
	console.log('Server on port', app.get('port'));
});

// Sockets
const io = socket(server);

socketId_user = new Array();
user_socketsId = new Array();

io.on('connect', async (socket) => {
	var socketId = socket.id;
	var user, connections;

	console.log('Socket connection opened: ', socketId);

	socket.on('disconnect', async () => {
		console.log(user + ' disconnect: ' + socketId);

		if(socketId_user[socketId]){
			var userDisconnect = socketId_user[socketId];

			delete socketId_user[socketId];

			socketsId = user_socketsId[userDisconnect];
			for(var i = 0; i < socketsId.length; i++){
				if(socketId == socketsId[i]){
					var id_to_delete = i;
				}
			}

			user_socketsId[userDisconnect].splice(id_to_delete, 1);
		}

		await User.updateOne({username:user}, {
			$set: {
				connected: false
			}
		});	
		socket.broadcast.emit('userDisconnected', {user: user});

		// console.log('************** user disconnect ********************************');
		// console.log('--------usuario por id-----------');
		// console.log(socketId_user);
		// console.log('-------Ids por usuarios-----------');
		// console.log(user_socketsId);
	});

	socket.on('newUser', async (data) => {
		user = data.user
		console.log(user +' connected: ' + socketId);

		//Guardar conexion en la BD
		try {
	        // Verificamos si existe el usuario en DB
	        if (await Connection.findOne({"user": user})) {
	            //si el usuario ya habia realizado una conexion, agregar la nueva conexion(id socket) al array idSocket el usuario
	            const connection = await Connection.findOneAndUpdate(
	                {"user": user}, // Para buscar dentro de un array de objetos
	                { $push: { "idSocket": socketId } },
	                { returnNewDocument: true,
	                    arrayFilters: [
	                        { "elem.user": { $eq: user } }	// elem es cada objeto del array
	                    ]
	                }
	            );
	            console.log('User exist')
	        } else {
	            //si la coleccion connections se encuentra vacia o no encuentra el usuario en la DB
	            const newConnection = new Connection({
	                user: user,
	                idSocket: socketId
	            });
	            await newConnection.save();
	            console.log('New connection saved');
	        }
	    }catch(err){
	    	console.log(err);
	    }
		




	    //Guardar conexion en un array (no en la BD)
		socketId_user[socketId] = user;

		if(user_socketsId[user] == null){
			user_socketsId[user] = new Array();
		}

		user_socketsId[user].push(socketId);

		await User.updateOne({username:user}, {
			$set: {
				connected: true
			}
		});	

		socket.broadcast.emit('newUser', {user: data.user});		
	});

	socket.on('typing', async (data) => {
		for(i in connections){
	    	socket.to(connections[i]).emit('typing', data);
	    	console.log(connections[i]);
		}
	});

	socket.on('stopTyping', (data) => {
		for(i in connections){
	    	socket.to(connections[i]).emit('stopTyping', data);
		}
	});

	socket.on('new_msg', async (data) => {
		const connectionData = await Connection.findOne({user: user});
		var myConnections;
		if(connectionData){
			myConnections = connectionData.idSocket
		}

	    await connectDB.then(db => {
	        let newMsg = new message({
	            message: data.message, 
				sender: data.sender,
				receiver: data.receiver,
				date: data.date
	        });
	        newMsg.save();
	    });
	    
	    for(i in connections){
	    	io.to(connections[i]).emit('new_msg', (data));	    	
	    }
	    for(i in myConnections){
	    	io.to(myConnections[i]).emit('new_msg', (data));
	    }
	});

	socket.on('getMsg', async (data) => {
		const {sender, receiver} = data;

		// Obtener los id socket de las conexiones que ha realizado un usuario
		const connectionData = await Connection.findOne({user: receiver});
		if(connectionData){
			connections = connectionData.idSocket;			
		}
		console.log('-------outside------');
		console.log(connections);


		// obtener mensajes privados
		await message.find({
			$or: [
				{$and: [
					{sender: sender}, 
					{receiver: receiver}
				]},
				{$and: [
					{sender: receiver}, 
					{receiver: sender}
				]}
			]  
		}, function(err, messages){
			if(err){
				console.log(err);
			}else{
				io.to(socketId).emit('privateMessages', (messages));
			}
		});		
	});
});
 
//Routes
app.use((require('./routes/index')));
