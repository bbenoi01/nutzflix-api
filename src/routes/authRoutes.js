const express = require('express');
const User = require('../models/User');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const {
	validateRegisterData,
	validateLoginData,
} = require('../utils/validators');
const router = express.Router();

//Register User
router.post('/register', async (req, res) => {
	const { valid, errors } = validateRegisterData(req?.body);
	if (!valid) return res.status(400).json(errors);

	const { username, email, password } = req?.body;

	const newUser = new User({
		username,
		email,
		password: CryptoJS.AES.encrypt(password, process.env.SECRET_KEY).toString(),
	});

	try {
		const user = await newUser.save();
		const token = jwt.sign(
			{ id: user?._id, isAdmin: user?.isAdmin },
			process.env.SECRET_KEY,
			{ expiresIn: '5d' }
		);

		const { password, ...userData } = user?._doc;

		res.status(201).json({ ...userData, token });
	} catch (err) {
		if (err.code === 11000) {
			errors.email = 'Email already in use';
			return res.status(422).json(errors);
		} else {
			errors.general = 'Unable to register user';
			return res.status(422).json(errors);
		}
	}
});

//Login User
router.post('/login', async (req, res) => {
	const { valid, errors } = validateLoginData(req?.body);
	if (!valid) return res.status(400).json(errors);

	const { email } = req?.body;

	try {
		const user = await User.findOne({ email });
		if (!user) {
			errors.email = 'Invalid Email or password';
			return res.status(401).json(errors);
		}

		const bytes = CryptoJS.AES.decrypt(user?.password, process.env.SECRET_KEY);
		const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

		if (originalPassword !== req?.body?.password) {
			errors.password = 'Invalid email or Password';
			return res.status(401).json(errors);
		}

		const token = jwt.sign(
			{ id: user?._id, isAdmin: user?.isAdmin },
			process.env.SECRET_KEY,
			{ expiresIn: '5d' }
		);

		const { password, ...userData } = user?._doc;

		res.status(200).json({ ...userData, token });
	} catch (err) {
		errors.general = 'Invalid email or password';
		return res.status(500).json(errors);
	}
});

// Generate Password Reset Token
router.post('/forgot-password-token', async (req, res) => {
	const { email } = req?.body;
	let errors = {};
	const user = await User.findOne({ email });

	if (!user) {
		errors.user = 'Error, user not found';
		return res.status(404).json(errors);
	}

	try {
		const resetToken = user?.createPasswordResetToken();
		await user?.save();

		const resetUrl = `<h3>We've received a request to reset your password!</h3> \n Hi ${email}, we received a password reset request from your account. To complete the reset, please <a href='http://localhost:3005/reset-password/${resetToken}'>click here.</a> The link is valid for 10 minutes. \n If this was not intended or you have questions about your account, please contact an admin right away.`;
		const msg = {
			to: email,
			from: process.env.SG_BASE_EMAIL,
			subject: 'Reset Your Password',
			html: resetUrl,
		};

		await sgMail.send(msg);
		res.json(
			`A password reset link has been sent to ${user?.email}. The link is valid for 10 minutes.`
		);
	} catch (err) {
		errors.token = 'Error generating token';
		return res.status(400).json(errors);
	}
});

// Password Reset
router.put('/reset-password', async (req, res) => {
	let errors = {};
	const hashedToken = crypto
		.createHash('sha256')
		.update(req?.body?.token)
		.digest('hex');
	const user = await User.findOne({
		passwordResetToken: hashedToken,
		passwordResetTokenExpires: { $gt: new Date() },
	});

	if (!user) {
		errors.token = 'Token expired, try again later';
		return res.status(400).json(errors);
	}
	try {
		user.password = CryptoJS.AES.encrypt(
			req?.body?.password,
			process.env.SECRET_KEY
		).toString();
		user.passwordResetToken = undefined;
		user.passwordResetTokenExpires = undefined;
		await user?.save();
		res.json('Password Upated Successfully!');
	} catch (err) {
		errors.token = 'Error verifing token';
		return res.status(400).json(errors);
	}
});

module.exports = router;
