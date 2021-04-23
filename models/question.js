const mongoose = require('mongoose')
const { ObjectID } = mongoose.Schema.Types

const questionSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true
		},
		description: {
			type: String
		},
		specs: {
			minChar: {
				type: Number,
				default: 5
			},
			maxChar: {
				type: Number,
				default: 255
			},
			isMultiple: {
				type: Boolean,
				default: false
			},
			isComment: {
				type: Boolean,
				default: false
			},
			isRequired: {
				type: Boolean,
				default: true
			}
		},

		answers: [
			{
				name: {
					type: String
				},
				value: {
					type: String
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

mongoose.model('Question', questionSchema)
