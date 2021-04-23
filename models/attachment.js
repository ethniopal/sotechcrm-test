const mongoose = require('mongoose')
const { ObjectID } = mongoose.Schema.Types

const attachmentSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			maxLength: 255
		},
		path: {
			type: String,
			required: true,
			maxLength: 255
		},
		name: {
			type: String,
			required: true,
			maxLength: 200
		},
		original: {
			type: String,
			maxLength: 200
		},
		mimetype: {
			type: String,
			maxLength: 150
		},
		size: {
			type: Number
		},
		customer: {
			type: ObjectID,
			ref: 'Customer'
		},
		postedBy: {
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

mongoose.model('Attachment', attachmentSchema)
