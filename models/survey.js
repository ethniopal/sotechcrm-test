const mongoose = require('mongoose')
const { ObjectID } = mongoose.Schema.Types

const surveySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true
		},
		description: {
			type: String
		},
		message: {
			welcome: {
				type: String
			},
			success: {
				type: String
			}
		},
		notification: {
			type: String
		},

		questions: [
			{
				type: ObjectID,
				ref: 'Question'
			}
		],
		// rules: [
		// 	{
		// 		rule: {
		// 			type: ObjectID,
		// 			ref: 'Rule'
		// 		}
		// 	}
		// ],
		status: {
			type: String
		}
		// timestamps: {
		// 	createdAt: true,
		// 	updatedAt: true
		// }
	},
	{
		timestamps: {
			createdAt: true,
			updatedAt: true
		}
	}
)

mongoose.model('Survey', surveySchema)
