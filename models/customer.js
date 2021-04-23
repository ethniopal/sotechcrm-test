const mongoose = require('mongoose')
const { ObjectID } = mongoose.Schema.Types

const customerSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Le nom de la compagnie est requis']
		},
		refNumber: {
			type: String
		},
		refERP: {
			type: String
		},
		contacts: [
			{
				type: ObjectID,
				ref: 'Contact'
			}
		],
		mainContact: {
			name: { type: String },
			email: { type: String },
			function: { type: String },
			phone: {
				phone: { type: String },
				ext: { type: String },
				mobile: { type: String },
				fax: { type: String }
			}
		},
		surveys: [
			{
				survey: {
					type: ObjectID,
					ref: 'Survey'
				},
				answers: [
					{
						type: String
					}
				],
				status: {
					type: String
				}
			}
		],
		phone: {
			phone: {
				type: String,
				required: [true, 'Le téléphone de la compagnie est requis']
			},
			ext: {
				type: String
			},
			mobile: {
				type: String
			},
			fax: { type: String }
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
		website: {
			type: String
		},
		email: {
			type: String
		},
		language: {
			type: String
		},

		attributions: [
			{
				attribution: {
					type: ObjectID,
					ref: 'User'
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
		status: {
			type: String,
			default: 'Prospect'
		},
		archive: {
			type: Boolean,
			default: false
		}
	},
	{
		timestamps: {
			createdAt: true,
			updatedAt: true
		}
	}
)

mongoose.model('Customer', customerSchema)
