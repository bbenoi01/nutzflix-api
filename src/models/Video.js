const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, 'Video title is required'],
			trim: true,
			unique: true,
		},
		desc: {
			type: String,
		},
		img: {
			type: String,
		},
		trailer: {
			type: String,
		},
		media: {
			type: String,
			required: [true, 'Video is required'],
		},
		runTime: {
			type: String,
		},
		year: {
			type: String,
		},
		rating: {
			type: String,
		},
		genre: {
			type: String,
		},
		isSeries: {
			type: Boolean,
			default: false,
		},
		seriesType: {
			type: String,
		},
		seriesTitle: {
			type: String,
		},
		season: {
			type: String,
		},
		episode: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Video', videoSchema);
