const express = require('express');
const User = require('../models/User');
const CryptoJS = require('crypto-js');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

// router.put('/updateallusers', async (req, res) => {
// 	const updatedUsers = await User.updateMany({
// 		profilePhoto:
// 			'https://res.cloudinary.com/dcxmdnu2h/image/upload/v1639171987/bo7933fr3wmulznyog83.jpg',
// 	});
// 	res.json(updatedUsers);
// });

// Update User
router.put('/:id', requireAuth, async (req, res) => {
	const { id } = req?.params;
	let errors = {};

	if (req?.user?.id === id || req?.user?.isAdmin) {
		if (req?.body?.password) {
			req.body.password = CryptoJS.AES.encrypt(
				req?.body?.password,
				process.env.SECRET_KEY
			).toString();
		}

		try {
			const user = await User.findByIdAndUpdate(
				id,
				{
					$set: req?.body,
				},
				{
					new: true,
					runValidators: true,
				}
			);

			const { password, ...updatedUser } = user?._doc;

			res.json(updatedUser);
		} catch (err) {
			errors.update = 'Error updating profile';
			return res.status(400).json(errors);
		}
	} else {
		errors.auth = 'You are not authorized!';
		return res.status(403).json(errors);
	}
});

// Delete Single User
router.delete('/:id', requireAuth, async (req, res) => {
	const { id } = req?.params;
	let errors = {};

	if (req?.user?.id === id || req?.user?.isAdmin) {
		try {
			const user = await User.findByIdAndDelete(id);
			res.status(200).json(`${user?.username} has been deleted successfully!`);
		} catch (err) {
			errors.delete = 'Error deleting user!';
			res.status(500).json(errors);
		}
	} else {
		errors.auth = 'You are not authorized!';
		res.status(403).json(errors);
	}
});

// Get All Users
router.get('/', requireAuth, async (req, res) => {
	const query = req?.query?.new;
	let errors = {};

	if (req?.user?.isAdmin) {
		try {
			const users = query
				? await User.find().limit(10).sort('-createdAt')
				: await User.find({}).sort('-createdAt');
			res.status(200).json(users);
		} catch (err) {
			errors.user = 'Error retreiving users!';
			res.status(500).json(errors);
		}
	} else {
		errors.auth = 'You are not authorized!';
		res.status(403).json(errors);
	}
});

// Get User
router.get('/find/:id', requireAuth, async (req, res) => {
	const { id } = req?.params;
	let errors = {};

	if (req?.user?.id === id || req?.user?.isAdmin) {
		try {
			const user = await User.findById(id);
			if (!user) {
				errors.user = 'Error user not found';
				return res.status(404).json(errors);
			}

			res.status(200).json(user);
		} catch (err) {
			errors.user = 'Error getting user details';
			return res.status(500).json(errors);
		}
	} else {
		errors.auth = 'You are not authorized!';
		res.status(403).json(errors);
	}
});

// Get User Stats
router.get('/stats', requireAuth, async (req, res) => {
	let errors = {};

	if (req?.user?.isAdmin) {
		const today = new Date();
		const lastYear = today.setFullYear(today.setFullYear() - 1);
		const monthsArray = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December',
		];

		try {
			const data = await User.aggregate([
				{
					$project: {
						month: { $month: '$createdAt' },
					},
				},
				{
					$group: {
						_id: '$month',
						total: { $sum: 1 },
					},
				},
			]);
			res.status(200).json(data);
		} catch (err) {
			errors.user = 'Error getting stats!';
			res.status(500).json(errors);
		}
	} else {
		errors.auth = 'You are not authorized!';
		res.status(403).json(errors);
	}
});

module.exports = router;
