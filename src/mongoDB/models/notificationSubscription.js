const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSubscriptionSchema = new Schema({
    user: String,
    endpoint: { type: String},
    expirationTime: { type: String},
    keys: {
        p256dh: { type: String},
        auth: { type: String},
    }
});

module.exports = mongoose.model("notificationSubscription", notificationSubscriptionSchema);