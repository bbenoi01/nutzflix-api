const express = require('express');
const Video = require('../models/Video');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

// router.put('/all', async (req, res) => {
// 	try {
// 		const updated = await Video.updateMany(
// 			{ media: 'A_Quite_Place.mp4' },
// 			{
// 				media: 'A_Quiet_Place.mp4',
// 			}
// 		);
// 		res.status(200).json(updated);
// 	} catch (err) {
// 		console.log(err);
// 	}
// });

// Add New Video
router.post('/', requireAuth, async (req, res) => {
	let errors = {};

	if (req?.user?.isAdmin) {
		const newVideo = new Video(req?.body);

		try {
			const video = await newVideo.save();
			res.status(201).json(video);
		} catch (err) {
			errors.video = 'Error adding video!';
			res.status(500).json(errors);
		}
	} else {
		errors.auth = 'You are not authorized!';
		return res.status(403).json(errors);
	}
});

// Update Video
router.put('/:id', requireAuth, async (req, res) => {
	const { id } = req?.params;
	let errors = {};

	if (req?.user?.isAdmin) {
		try {
			const updatedVideo = await Video.findByIdAndUpdate(
				id,
				{
					$set: req?.body,
				},
				{
					new: true,
				}
			);
			res.status(200).json(updatedVideo);
		} catch (err) {
			errors.video = 'Error updating video!';
			res.status(500).json(errors);
		}
	} else {
		errors.auth = 'You are not authorized!';
		return res.status(403).json(errors);
	}
});

// Delete Video
router.delete('/:id', requireAuth, async (req, res) => {
	const { id } = req?.params;
	let errors = {};

	if (req?.user?.isAdmin) {
		try {
			const deletedVideo = await Video.findByIdAndDelete(id);
			const updatedVideoList = await Video.find({});
			res.status(200).json({
				updatedVideoList,
				message: `${deletedVideo.title} has been successfully deleted!`,
			});
		} catch (err) {
			errors.video = 'Error updating video!';
			res.status(500).json(errors);
		}
	} else {
		errors.auth = 'You are not authorized!';
		return res.status(403).json(errors);
	}
});

// Get Single Video
router.get('/find/:id', requireAuth, async (req, res) => {
	const { id } = req?.params;
	let errors = {};

	try {
		const video = await Video.findById(id);
		res.status(200).json(video);
	} catch (err) {
		errors.video = 'Error getting video!';
		res.status(500).json(errors);
	}
});

// Get Random
router.get('/random', requireAuth, async (req, res) => {
	const type = req?.query?.type;
	let errors = {};
	let video;

	try {
		if (type === 'series') {
			video = await Video.aggregate([
				{ $match: { isSeries: true } },
				{ $sample: { size: 1 } },
			]);
		} else {
			video = await Video.aggregate([
				{ $match: { isSeries: false } },
				{ $sample: { size: 1 } },
			]);
		}
		res.status(200).json(video);
	} catch (err) {
		errors.video = 'Error getting video!';
		res.status(500).json(errors);
	}
});

// Get All Videos
router.get('/', requireAuth, async (req, res) => {
	let errors = {};

	if (req?.user?.isAdmin) {
		try {
			const videos = await Video.find({});
			res.status(200).json(videos);
		} catch (err) {
			errors.video = 'Error getting videos!';
			res.status(500).json(errors);
		}
	} else {
		errors.auth = 'You are not authorized!';
		return res.status(403).json(errors);
	}
});

module.exports = router;
