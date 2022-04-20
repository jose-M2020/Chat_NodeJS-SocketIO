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
		const {sender, receiver, message, urlImg, date} = data;
		
		let newMsg = new Message({
	     	users: [sender, receiver],
		    conversation: [{sender, message, urlImg, date}]
		});

		await newMsg.save()
			.then(doc => {
				this.addConversationUsers(data, doc._id)
			})
	}

	async updateMessages(data){
		const {sender, receiver, message, urlImg, date} = data;

		await Message.updateOne(
	      	{$and: [
		    	{ users: {$in: [sender]} },
		    	{ users: {$in: [receiver]} }
		    ]},
	      	{$push: {
	      		conversation:{
	      			sender,	message, urlImg, date 
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

	async searchConversation({sender, receiver}){
		const res = await Message.exists({
			$and: [
		     	{ users: {$in: [sender]} },
		       	{ users: {$in: [receiver]} }
		    ]
		})
		return res;	//return true or false
	}

	async getMessages({sender, receiver, page}){
		const perPage = 10;

		// Buscar mensajes por orden de fecha descendente
		const res = await Message.aggregate([
		  {$match: { 
		  	$and:[
		       { users: {$in: [sender]} },
		       { users: {$in: [receiver]} }
		    ]
		  }},
		  {$unwind: "$conversation"}, 
		  {$sort: {"conversation.date": -1}},
		  {$skip: (perPage * page) - perPage},
		  {$limit: perPage},
		  {"$group": {"_id": "$_id", "conversation": {"$push": "$conversation"}}}
		])

		const c = res.length > 0 ? res[0].conversation : [];
		const conversation = {
			conversation: c,
			finish: c.length < perPage ? true : false 	//Determinar si existen más mensajes
		}

		// Retornamos conversation si el usuario tiene mensajes o si despues de una consulta ya no se obtiene datos, y en el caso contrario retornamos un array vacio
		return c.length > 0 || page > 1 ? conversation : [];
	}
}

module.exports = DB;
