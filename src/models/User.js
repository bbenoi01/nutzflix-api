const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
	{
		username: {
			required: [true, 'Username is required'],
			type: String,
			unique: true,
		},
		email: {
			required: [true, 'Email is required'],
			type: String,
			unique: true,
		},
		password: {
			type: String,
			required: [true, 'Password is required'],
		},
		profilePhoto: {
			type: String,
			default: '',
		},
		isAdmin: {
			type: Boolean,
			default: false,
		},
		passwordChangeAt: {
			type: Date,
		},
		passwordResetToken: {
			type: String,
		},
		passwordResetTokenExpires: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
);

userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex');
	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');
	this.passwordResetTokenExpires = Date.now() + 30 * 60 * 1000;
	return resetToken;
};

module.exports = mongoose.model('User', userSchema);
