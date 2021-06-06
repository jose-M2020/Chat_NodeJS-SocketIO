const Message = require('../models/messages');
const User = require('../models/users');
const Connection = require('../models/connections');

class DB {
	async searchConnection(user){
		return await Connection.exists({"user": user}); //return true or false
	}

	async setConnection(user, state){
		await User.updateOne({username:user}, {
			$set: {
				connected: state
			}
		});
	}

	async addNewConnection(user, socketId){
		const newConnection = new Connection({
	        user: user,
	        idSocket: [socketId]
	    });
	    await newConnection.save();
	}

	async updateConnections(user, socketId){
		await Connection.updateOne(
		    {"user": user}, 	// Para buscar dentro de un array de objetos
		    { $push: { "idSocket": socketId } }
	    )
	}

	async deleteConnection(user, socketId){
		await Connection.updateOne(
			{user: user}, 
			{ $pull: {idSocket: socketId} }
		)
	}

	async saveMessage(data){
		let newMsg = new Message({
	     	users: [data.sender, data.receiver],
		    conversation: [{
		    	sender: data.sender,
		        message: data.message,
				date: data.date
		    }]
		});

		await newMsg.save()
			.then(doc => {
				this.addConversationUsers(data, doc._id)
			})
	}

	async updateMessages(data){
		await Message.updateOne(
	      	{$and: [
		    	{ users: {$in: [data.sender]} },
		    	{ users: {$in: [data.receiver]} }
		    ]},
	      	{$push: {
	      		conversation:{
	      			sender: data.sender,
	      			message: data.message,
	      			date: data.date 
	      		}
	      	}}
	    )
	}

	async addConversationUsers(data, id){
		await User.updateMany(
			{ $or: [ 
				{username: data.sender}, 
				{username: data.receiver} 
			]}, 
		    {$push: {conversations: id}},
			{ multi: true, upsert: true }
	    )
	}

	async getConnections(user){
		const data = await Connection.findOne({user: user});
		return data ? data.idSocket : [];
	}

	async searchConversation(data){
		const res = await Message.exists({
			$and: [
		     	{ users: {$in: [data.sender]} },
		       	{ users: {$in: [data.receiver]} }
		    ]
		})
		return res;	//return true or false
	}

	async getMessages(data){
		const res = await Message.findOne({
			$and:[
		       	{ users: {$in: [data.sender]} },
		       	{ users: {$in: [data.receiver]} }
		       ]
		})
		return res ? res.conversation : [];
	}
}

module.exports = DB;
