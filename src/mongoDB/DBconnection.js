const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

// mongodb://localhost/chat
//mongodb+srv://jose:josepass20@cluster0.sqmod.mongodb.net/test   ->this URI is for connect using MongoDB Compass

const url = process.env.MONGODB || "mongodb+srv://jose:josepass20@cluster0.sqmod.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"; //conexion mongo
mongoose.set('useFindAndModify', false);

const connect = mongoose.connect(url, { 
	useNewUrlParser: true 
}).then(db => console.log('DB is connected'))
  .catch(err => console.error(err));

module.exports = connect;