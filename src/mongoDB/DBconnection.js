const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const url = process.env.MONGODB || "mongodb://localhost/chat"; //conexion mongo
mongoose.set('useFindAndModify', false);

const connect = mongoose.connect(url, { 
	useNewUrlParser: true 
}).then(db => console.log('DB is connected'))
  .catch(err => console.error(err));

module.exports = connect;