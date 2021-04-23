const mongoose = require('mongoose')
const { ObjectID } = mongoose.Schema.Types
const userMsg = require('../constants/user')

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true
		},
		address: {
			address: {
				type: String
			},
			city: {
				type: String
			},
			province: {
				type: String
			},
			country: {
				type: String
			},
			zip: {
				type: String
			}
		},
		phone: {
			phone: {
				type: String
			},
			ext: {
				type: String
			},
			mobile: {
				type: String
			},
			fax: { type: String }
		},
		picture: {
			type: String
		},
		email: {
			type: String,
			required: true
		},
		password: {
			type: String,
			required: true
		},
		permission: {
			type: String,
			required: true
		},
		status: {
			type: String,
			default: userMsg.status.ACTIVE
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

mongoose.model('User', userSchema)
