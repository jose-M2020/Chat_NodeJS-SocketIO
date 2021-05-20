const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    message: { type: String },
    sender: { type: String },
    receiver: { type: String },
    date: {type: String,}
});

let Chat = mongoose.model("messages", chatSchema);

module.exports = Chat;