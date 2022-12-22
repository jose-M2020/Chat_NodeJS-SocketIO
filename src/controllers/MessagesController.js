const socket = require('socket.io');
const connectDB = require('../mongoDB/DBconnection');
const DB = require('../mongoDB/class/DB');
const mongoDB = new DB();
const NotificationSubscription = require('../mongoDB/models/notificationSubscription');
const webpush = require("../webpush");

exports.addItem = async (data) => {
    await connectDB.then(async db => {
        let conversationExists = await mongoDB.searchConversation(data);
        
        if(!conversationExists){
            mongoDB.saveMessage(data);
        }else{
            mongoDB.updateMessages(data);
        }
        
        const pushSubscripton = await NotificationSubscription.findOne({user: data.receiver}).lean();
        if(pushSubscripton){
            try {
                await webpush.sendNotification(pushSubscripton, JSON.stringify(data));
            } catch (error) {
                console.log(error);
            }
        }
    }).catch( err => console.log(err) );
}