const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

// Connect to MongoDB Atlas from MongoDB Compass: mongodb+srv://jose:josepass20@cluster0.sqmod.mongodb.net/test

const uri = process.env.MONGODB_URI || "mongodb://localhost/chat"; // Si hay una variable configurada nos conectamos al mongoDB definido(en este caso usamos MongoDB Atlas en heroku), sino al mongoDB de localhost
mongoose.set('useFindAndModify', false);

const connect = mongoose.connect(uri, { 
	useNewUrlParser: true,
	useUnifiedTopology: true 
}).then(db => console.log('DB is connected'))
  .catch(err => console.error(err));

module.exports = connect;
