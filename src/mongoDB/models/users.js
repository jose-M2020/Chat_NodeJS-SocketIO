const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    username: { type: String },
    email: { type: String },
    password: { type: String },
    avatar: {
      name: {type: String, required: true},
      secure_url: {type: String, required: true},
      public_id: {type: String, required: true},
    },
    role: {type: String},
    connected: {type: Boolean, default: false},
    conversations: [String],
    date: {type: Date, default: Date.now},
    pushSubscripton:  {
        endpoint: { type: String },
        expirationTime: { type: Number },
        keys: {
          p256dh: { type: String },
          auth: { type: String }
        }
    }
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