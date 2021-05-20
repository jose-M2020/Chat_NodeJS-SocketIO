const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

// mongodb://localhost/chat
const url = process.env.MONGODB || "mongodb+srv://jose:josepass20@cluster0.sqmod.mongodb.net/test"; //conexion mongo
mongoose.set('useFindAndModify', false);

const connect = mongoose.connect(url, { 
	useNewUrlParser: true 
}).then(db => console.log('DB is connected'))
  .catch(err => console.error(err));

module.exports = connect;