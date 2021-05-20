const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    username: { type: String },
    email: { type: String },
    password: { type: String },
    avatar: { type: String },
    role: {type: String},
    connected: {type: Boolean, default: false},
    date: {type: Date, default: Date.now},
});

userSchema.methods.encryptPassword = async (password) =>{
	const salt = await bcrypt.genSalt(10);
	const hash = bcrypt.hash(password, salt);
	return hash;
};

userSchema.methods.matchPassword = async function (password){
	return await bcrypt.compare(password, this.password);
}

module.exports = mongoose.model("users", userSchema);