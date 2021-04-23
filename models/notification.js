const mongoose = require('mongoose')
const { ObjectID } = mongoose.Schema.Types

const notificationSchema = new mongoose.Schema(
	{
		sender: {
			type: ObjectID,
			ref: 'User'
		}, // Notification creator
		receiver: [
			{
				type: ObjectID,
				ref: 'User'
			}
		], // Ids of the receivers of the notification
		message: {
			type: String // any description of the notification message
		},
		read_by: [
			{
				readerId: {
					type: ObjectID,
					ref: 'User'
				},
				read_at: {
					type: Date,
					default: Date.now
				}
			}
		]
	},
	{
		timestamps: {
			createdAt: true,
			updatedAt: true
		}
	}
)

mongoose.model('Notification', notificationSchema)
