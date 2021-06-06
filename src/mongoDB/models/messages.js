const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    users: [String],
    conversation: [
        {
            sender: {type: String},
            message: { type: String },
            date: {type: String}
        }
    ]
});

let Chat = mongoose.model("messages", chatSchema);

module.exports = Chat;