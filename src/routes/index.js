const Message = require('../mongoDB/models/messages');
const User = require('../mongoDB/models/users');
const Connection = require('../mongoDB/models/connections');
const NotificationSubscription = require('../mongoDB/models/notificationSubscription');
const passport = require('passport');
const fs = require('fs-extra');
const path = require('path');
const uuid = require('uuid');
const { isAuthenticated, guest } = require('../auth/auth');
const {uploadImage, removeImage} = require('../helpers/cloudinary');

const userConstroller = require('../controllers/UserController');

const { Router } = require('express');
const router = Router();

const webpush = require("../webpush");

const upload = require('../helpers/multer')


router.get('/', isAuthenticated, async (req,res) => {
	const {email} = req.user;

	const user = await User.findOne({email}, '_id email username avatar role').lean();
	
	// Realizamos una busqueda en la BD, removemos el usuario logeado y datos innecesarios
	const dataUsers = await User.find(
		{email: {$ne: email}},
		{password: 0, conversations: 0, email: 0, role: 0, __v: 0}
	).lean();

	res.render('index', {dataUsers, user}); 
});

// ---------------------------- Auth

router.get('/signin', guest, (req, res) => {
	res.render('auth/signin');
});

router.get('/signup', guest, (req, res) => {
	res.render('auth/signup');
});

router.post('/signin', guest, passport.authenticate('local',{
	successRedirect: '/',
	failureRedirect: '/signin',
	failureFlash: true
}));

router.post('/signup', upload.single('avatar'), userConstroller.addItem);

router.get('/logout', isAuthenticated, (req, res) => {
	req.logout();
	res.redirect('/signin');
});

// -----------------------------

router.get('/users', isAuthenticated, userConstroller.getAllItems);

router.delete('/users/delete/:id', isAuthenticated, userConstroller.deleteItem);

router.get('/sw.js', async (req, res) => {
	res.header("Content-Type", "text/javascript");
    res.sendFile(path.join(__dirname,"../public/js/sw.js"));
})

// ------------------------------ Web Push

router.post("/subscription", async (req, res) => {
	const { user, subscription: { endpoint, expirationTime, keys: { p256dh, auth}} } = req.body,
			 find = await NotificationSubscription.findOne({endpoint, user});
	// global.pushSubscripton = req.body;
	// console.log('push: ', req.body);
	
	if(!find){
		const newSubscription = new NotificationSubscription({user, endpoint, expirationTime, keys: { p256dh, auth}});
		newSubscription.save();
	}

	res.status(201).json();
	
	try {
		// await webpush.sendNotification(global.pushSubscripton, JSON.stringify({message: 'Suscrito!'}));
	} catch (error) {
		console.log(error);
	}
});

// ------------------------- Test

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
