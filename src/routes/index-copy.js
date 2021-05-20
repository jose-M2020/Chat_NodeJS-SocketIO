const Message = require('../mongoDB/models/messages');
const User = require('../mongoDB/models/users');
const Connection = require('../mongoDB/models/connections');
const passport = require('passport');
const path = require('path');
const uuid = require('uuid');
const { isAuthenticated } = require('../auth/auth');

const express = require('express');
const router = express.Router();

var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

var avatar;
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '../public/img/avatar'));
	},
	filename: function (req, file, cb) {
		avatar = uuid.v4() + file.originalname;
	  cb(null, avatar);
	}
});
console.log(avatar);
			
// obtener indice de un usuario
function getIndice(json, user) {
	var indice = -1;
	json.filter(function(element, i){
		if(element.username === user) {
			indice = i;
		}
	});
	return indice;
}

router.get('/', isAuthenticated, async (req,res) => {
	// await Message.find()
	// .then(documentos => {
	// 	const contexto = {
	// 		messages: documentos.map(documento => {
	// 			return {
	// 				message: documento.message,
	// 				sender: documento.sender,
	// 				receiver: documento.receiver,
	// 				date: documento.date
	// 			}
	// 		})
	// 	}
	// 	res.render('index', {
	// 		data: contexto.messages
	// 	})
	// })
	
	// const dataMsg = await Message.find().lean();
	const dataUsers = await User.find().lean();
	const user = req.user.username;

	// remover el usuario logeado dentro del objeto json
	dataUsers.splice(getIndice(dataUsers, user), 1);

	

	dataUsers.forEach(function(item) {
		if(item.connected == false){
			item.connected = 'offline';
		}else{
			item.connected = 'online';
		}
	})
	res.render('index', {dataUsers}); 
});

router.get('/signin', (req, res) => {
	res.render('auth/signin');
});

router.get('/signup', (req, res) => {
	res.render('auth/signup');
});

router.post('/signin', passport.authenticate('local',{
	successRedirect: '/',
	failureRedirect: '/signin',
	failureFlash: true
}));
 
router.post('/signup', async (req, res) => {
	// const role = 'user';
	const {username, email, password, confirm_password, role} = req.body;
	const errors = [];

	console.log(req.body);
	console.log(req.file);
	if(username.length <= 0 || email.length <= 0 || password.length <= 0 || confirm_password.length <= 0 || req.file == undefined){
		errors.push({text: 'ingresa los datos faltantes'});
	}
	if(password != confirm_password){
		errors.push({text: 'Las constraseñas no coinciden'});
	}
	if(password.length < 6){
		errors.push({text: 'La contraseña debe ser minimo de 6 caracteres'});
	}
	if(errors.length > 0){
		res.render('auth/signup', {errors, username, email, password, confirm_password})
	}else{
		const emailUser = await User.findOne({email: email});
		if(emailUser){
			req.flash('error', 'El correo ya ha sido registrado');
			res.redirect('/signup');
		}else{
			/*var upload = multer({ 
				// fileFilter(req, file, next) {
			 //     	const isPhoto = file.mimetype.startsWith('image/');
			 //     	if (isPhoto) {
			 //     	  next(null, true);
			 //     	} else {
			 //     	  next(null, false);
			 //     	  req.flash('error', 'Archivo no válido');
			 //     	}
			 //    },
				// storage: storage

				storage: storage,
				fileFilter: (req, file, cb) => {
				    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
				      cb(null, true);
				    } else {
				      cb(null, false);
				      req.flash('error', 'Archivo no válido');
				    }
				}
			}).single('avatar');*/

				const newUser = new User({username, email, password, avatar, role});
				newUser.password = await newUser.encryptPassword(password);
				await newUser.save();
				req.flash('success_msg', 'El usuario ha sido registrado exitosamente');
				res.redirect('/signup');
			// }else{
			// 	errors.push({text: 'Seleccione una foto de perfil'});
			// 	res.render('auth/signup', {errors, username, email, password, confirm_password})
			// }

		}
	}
});

router.get('/logout', isAuthenticated, (req, res) => {
	req.logout();
	res.redirect('/signin');
});

router.get('/add/:id/:user', async (req, res) => {
	var id = req.params.id;
	var user = req.params.user;

	const data = await Connection.find();
	

	// const dta = await Connection.children.user('jose');
	// console.log(dta);
	// for(var i = 0; i < dta.length; i++){
	// 	if(dta[i].user == 'jose'){
	// 		var user = dta[i]
	// 	}
	// 	console.log(user);
	// }
	//si la coleccion connections no esta vacia
	if(data.length > 0){
		const findUser = data[0].usersOnline.find( u => u.user === user);

		if(findUser == undefined){
			// si el usuario realiza una nueva conexion, se agrega al array activeUsers
			const newConnection = await Connection.updateOne({
		        	$push: {
		          		usersOnline: [{
		          			user: user,
							idSocket: id
		          		}]
		        	}
		    });	
		    res.send('New connection saved');
		}else{
			//si el usuario ya habia realizado una conexion, agregar la nueva conexion(id socket) al array idSocket el usuario 
			// --------------ingresar nuevo id socket en el vector de idSocket del usuario  (incompleto)

			res.send('User exist');

			newConnection = await Connection.findOneAndUpdate(
				{ usersOnline: user },
		      	{ $push: {idSocket: [id]} },
			    	function(err, result) {
			      		if (err) {
			        		res.send(err);
			      		} else {
			        		res.send(result);
			      		}
			    	}
		    );	




			// db.connections.update(
			// 	{"_id": {$eq: ObjectId("5fb2dc5e935f3e3c082164ee")}},
			// 	{$set: {"usersOnline.$[users]": $push:{idSocket: "socketId_1"}},
			// 	{arrayFilters:[
			// 		{"users.user": {$eq: "juan"}}
			// 	]}
			// )



		}

		// console.log('there are data');
		// console.log(data);	
	}else{
		//si la coleccion connections se encuentra vacia
		const newConnection = new Connection({
			usersOnline: [{
				user: user,
				idSocket: id
			}]
		});
		await newConnection.save();
		res.send('New connection saved');
	}
});

router.get('/findUserBySocket/:id', async (req, res) => {
	const json = await Connection.find();
	const id = req.params.id;
	console.log(json);
	// -------------------MAP-------------------------
	const data = await Connection.findOne().map(res => {
		console.log('-----------------------MAP-------------------');
		console.log(res.usersOnline[0].user);  
		console.log('---------------------------------------------');
	});

	function findUserBySocket(json, id) {
	  	return json[0].usersOnline.find( u => u.idSocket.includes(id) )
	}

	// if(json[0].usersOnline[i].find( u => u.user(user))

	// console.log(json);

	console.log(findUserBySocket(json, id));
	console.log(json[0].usersOnline.find( u => u.user === 'xd' ));
	res.send('ok');
});

router.get('/users', async (req, res) => {
	const json = await User.find().lean();
	const user = req.user.username;

	// remover el usuario logeado dentro del objeto json
	json.splice(getIndice(json, user), 1);
	
	res.render('user/users', {json});
});

router.delete('/users/delete/:id', isAuthenticated, async (req,res) => {
	await User.findByIdAndDelete(req.params.id);
	req.flash('success_msg', 'Usuario eliminado');
	res.redirect('/users');
});

module.exports = router;