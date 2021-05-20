const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const connetionSchema = new Schema({
    user: { type: String, required: true },
    idSocket: { type: Array, default: [] },
    // usersOnline: [{
    //         idSocket: { type: Array, default: [] },
    //         user: { type: String, required: true },
    // }]
});

module.exports = mongoose.model("connections", connetionSchema);