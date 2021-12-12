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

const multer  = require('multer');
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

router.get('/', isAuthenticated, async (req,res) => {
	const {username, avatar} = req.user;

	// Realizamos una busqueda en la BD, removemos el usuario logeado y datos innecesarios
	const dataUsers = await User.find(
		{username: {$ne: username}},
		{password: 0, conversations: 0, email: 0, role: 0, __v: 0}
	).lean();

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
	const {username, email, password, confirm_password} = req.body;
	const errors = [];

	if(username.length <= 0 || email.length <= 0 || password.length <= 0 || confirm_password.length <= 0){
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
				const newUser = new User({username, email, password, avatar, role: 'user'});
				newUser.password = await newUser.encryptPassword(password);
				await newUser.save();
				req.flash('success_msg', 'El registro ha sido exitoso');
				res.redirect('/signin');
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

router.get('/users', isAuthenticated, async (req, res) => {
	const username = req.user.username;
	const json = await User.find(
		{username: {$ne: username}},
		{password: 0, conversations: 0, __v: 0}
	).lean();
	
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

// -------------------------Test---------------------------

router.get('/getUserData/:sender/:receiver/:page', async (req, res) => {
	const { sender, receiver, page } = req.params;
	const perPage = 10;

	// const json = await User.findOne(
	// 	{username: req.params.user},
	// 	{password: 0}
	// )
	

	const json = await Message.aggregate([
		  {$match: { 
		  	$and:[
		       { users: {$in: [sender]} },
		       { users: {$in: [receiver]} }
		    ]
		  }},
		  {$unwind: "$conversation"}, 
		  {$sort: {"conversation.date": -1}},
		  {$skip: (perPage * page) - perPage},
		  {$limit: perPage},
		  {"$group": {"_id": "$_id", "conversation": {"$push": "$conversation"}}}
		])

	res.send(json);
});

module.exports = router;
