const mongoose = require('mongoose')
const { ObjectID } = mongoose.Schema.Types

const noteSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true
		},
		description: {
			type: String,
			required: true
		},
		company: {
			type: ObjectID,
			ref: 'Customer'
		},
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

mongoose.model('Note', noteSchema)
