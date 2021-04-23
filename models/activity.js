const mongoose = require('mongoose')
const { ObjectID } = mongoose.Schema.Types

const activitySchema = new mongoose.Schema(
	{
		company: {
			type: ObjectID,
			ref: 'Customer',
			required: true
		},
		contact: {
			type: ObjectID,
			ref: 'Contact'
		},
		refNumber: {
			type: String
		},
		refERP: {
			type: String
		},
		date: {
			type: Date
		},

		interactionType: {
			type: String,
			default: 'Un appel'
		},
		typeResponse: {
			type: String,
			default: 'Connecté'
		},
		isNegatif: {
			type: Boolean,
			default: false
		},
		descriptionResponse: {
			type: String
		},
		descriptionResponseNegatif: {
			type: String
		},
		attachments: [
			{
				file: {
					type: String
				}
			}
		],
		postedBy: {
			type: ObjectID,
			ref: 'User'
		},
		updatedBy: {
			type: ObjectID,
			ref: 'User'
		}
	},
	{
		timestamps: {
			createdAt: true,
			updatedAt: true
		}
	}
)

mongoose.model('Activity', activitySchema)
