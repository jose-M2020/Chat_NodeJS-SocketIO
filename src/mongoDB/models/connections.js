const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const connectionSchema = new Schema({
    user: { type: String, required: true },
    idSocket: [String]
});

module.exports = mongoose.model("connections", connectionSchema);