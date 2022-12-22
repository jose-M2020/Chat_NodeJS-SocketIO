const User = require('../mongoDB/models/users');
const fs = require('fs-extra');
const path = require('path');
const {uploadImage, removeImage} = require('../helpers/cloudinary');

exports.addItem = async (req, res) => {
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
		res.render('auth/signup', {errors, username, email, password, confirm_password})
	}else{
		const emailUser = await User.findOne({email: email});
		if(emailUser){
			req.flash('error', 'El correo ya ha sido registrado');
			res.redirect('/signup');
		}else{
			let avatar = {};
			
			if (req.file) {
				const result = await uploadImage(req.file.path)
				avatar = {
				  name: req.file.originalname,
				  public_id: result.public_id,
				  secure_url: result.secure_url
				}
			}

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
}

exports.getAllItems = async (req, res) => {
    const username = req.user.username;
	const json = await User.find(
		{username: {$ne: username}},
		{password: 0, conversations: 0, __v: 0}
	).lean();
	
	res.render('user/users', {json});
}

exports.deleteItem = async (req, res) => {
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
}