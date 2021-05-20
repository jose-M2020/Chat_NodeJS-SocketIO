const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

/*
	Connect MongoDB in localhost: mongodb://localhost/chat
	Connect MongoDB in cloud MongoDB - mlab: mongodb+srv://jose:josepass20@cluster0.sqmod.mongodb.net/chatDB?retryWrites=true&w=majority
	Connect with uri from MongoDB Compass: mongodb+srv://jose:josepass20@cluster0.sqmod.mongodb.net/test
*/

const uri = process.env.MONGODB || "mongodb+srv://jose:josepass20@cluster0.sqmod.mongodb.net/chatDB?retryWrites=true&w=majority"; //conexion mongo
mongoose.set('useFindAndModify', false);

const connect = mongoose.connect(uri, { 
	useNewUrlParser: true 
}).then(db => console.log('DB is connected'))
  .catch(err => console.error(err));

module.exports = connect;
