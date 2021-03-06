const mongoose = require('mongoose');

const listSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		type: {
			type: String,
		},
		genre: {
			type: String,
		},
		content: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Video',
			},
		],
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('List', listSchema);
