const mongoose = require('mongoose')
const { ObjectID } = mongoose.Schema.Types

const contactSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true
		},
		company: {
			type: ObjectID,
			ref: 'Customer'
		},
		refNumber: {
			type: String
		},
		refERP: {
			type: String
		},
		function: {
			type: String
		},
		phone: {
			phone: {
				type: String,
				required: true
			},
			ext: {
				type: String
			},
			mobile: {
				type: String
			},
			fax: {
				type: String
			}
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

		email: {
			type: String,
			required: true
		},
		notes: [
			{
				note: {
					type: ObjectID,
					ref: 'Note'
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
		},
		language: {
			type: String,
			default: ''
		},
		status: {
			type: String,
			default: ''
		}
	},
	{
		timestamps: {
			createdAt: true,
			updatedAt: true
		}
	}
)

mongoose.model('Contact', contactSchema)
