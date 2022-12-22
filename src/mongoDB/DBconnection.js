const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const { MONGODB_URI } = process.env;

// Connect to MongoDB Atlas from MongoDB Compass: mongodb+srv://jose:josepass20@cluster0.sqmod.mongodb.net/test

mongoose.set('useFindAndModify', false);

const connect = mongoose.connect(MONGODB_URI, { 
	useNewUrlParser: true,
	useUnifiedTopology: true 
}).then(db => console.log('DB is connected'))
  .catch(err => console.error(err));

module.exports = connect;
