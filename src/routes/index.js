const Message = require('../mongoDB/models/messages');
const User = require('../mongoDB/models/users');
const Connection = require('../mongoDB/models/connections');
const passport = require('passport');
const path = require('path');
const fs = require('fs');
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
var upload = multer({
	storage: storage,
	fileFilter: (req, file, cb) => {
		if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
		  cb(null, true);
		} else {
		  cb(null, false);
		  req.flash('error', 'Archivo no válido');
		}
	}
});

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
	const dataUsers = await User.find().lean();
	const {username, avatar} = req.user;

	// remover el usuario logeado y datos innecesarios
	dataUsers.splice(getIndice(dataUsers, username), 1);
	dataUsers.forEach( e => {
		delete e.password;
		delete e.conversations;
		delete e.email;
	});

	res.render('index', {dataUsers, username: username, avatar: avatar}); 
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

router.post('/signup', upload.single('avatar'), async (req,res) => {
	const {username, email, password, confirm_password, role} = req.body;
	const errors = [];

	if(username.length <= 0 || email.length <= 0 || password.length <= 0 || confirm_password.length <= 0 || role == undefined){
		errors.push({text: 'ingresa los datos faltantes'});
	}
	if(password != confirm_password){
		errors.push({text: 'Las constraseñas no coinciden'});
	}
	if(password.length < 6){
		errors.push({text: 'La contraseña debe ser minimo de 6 caracteres'});
	}
	if(errors.length > 0){
		fs.unlink(path.join(__dirname, '../public/img/avatar/' + avatar), function(err){
			if(err){
				console.log(err)
			}
		});
		res.render('auth/signup', {errors, username, email, password, confirm_password})
	}else{
		const emailUser = await User.findOne({email: email});
		if(emailUser){
			fs.unlink(path.join(__dirname, '../public/img/avatar/' + avatar), function(err){
				if(err){
					console.log(err)
				}
			});
			req.flash('error', 'El correo ya ha sido registrado');
			res.redirect('/signup');
		}else{
			// if(avatar){
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
	const {params: {id, user}} = req // Destructuring ES6
	// const data = await Connection.find();

	try {
        // Verificamos si existe el usuario en DB
        if (await Connection.findOne({"user": user})) {
            //si el usuario ya habia realizado una conexion, agregar la nueva conexion(id socket) al array idSocket el usuario
            const connection = await Connection.findOneAndUpdate(
                {"user": user}, // Para buscar dentro de un array de objetos
                {
                    $push: { "idSocket": id }
                },
                {
                    returnNewDocument: true,
                    arrayFilters: [
                        {
                            "elem.user": { // elem es cada objeto del array
                                $eq: user
                            }
                        }
                    ]
                }
            );
            res.send('User exist')  // Si es necesario devolver la conexion solo es poner res.send(connection)
        } else {
            //si la coleccion connections se encuentra vacia o no encuentra el usuario en la DB
            const newConnection = new Connection({
                user: user,
                idSocket: id
            });
            await newConnection.save();
            res.send('New connection saved');
        }
    } catch (err) {
        res.send(err)
    }

	//si la coleccion connections no esta vacia
	/*if(data.length > 0){
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
	}*/
});

router.get('/deleteIdSocket/:user/:idSocket', async (req,res) => {
	const {params: {id, user}} = req;

	if(await Connection.findOne({"user": user})) {
		const connection = await Connection.findOneAndUpdate(
	        {"user": user},
	        {
	            $pull: { idSocket: {$elemMatch: { score: 8 , item: id }} }
	            // {$pull: { 
	            //  	fruits: { $in: [ "apples", "oranges" ] }, 
	            //  	vegetables: "carrots" 
	            //   	} 
	            // }
	        },
	        function(err, model) {
		        if (err) { return handleError(res, err); }
		        console.log(model);
		    }
	    );
	    res.send('id removed from array');
	}else{
		res.send('connection not foud');
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

router.get('/getIdSockets/:user', async (req, res) => {
	const user = req.params.user;
	const data = await Connection.findOne({user: user});
	const idSocket = data.idSocket;

	for(i in idSocket){
		console.log(idSocket[i]);
	}

	res.send('ok');
})

router.get('/users', isAuthenticated, async (req, res) => {
	const json = await User.find().lean();
	const user = req.user.username;
	// remover el usuario logeado dentro del objeto json
	json.splice(getIndice(json, user), 1);
	
	res.render('user/users', {json});
});

router.delete('/users/delete/:id', isAuthenticated, async (req,res) => {
	const json = await User.findById(req.params.id);
	const img = json.avatar;

	await User.findByIdAndDelete(req.params.id);

	fs.unlink(path.join(__dirname, '../public/img/avatar/' + img), function(err){
		if(err){
			console.log(err)
		}
	});
	req.flash('success_msg', 'Usuario eliminado');
	res.redirect('/users');
});

module.exports = router;