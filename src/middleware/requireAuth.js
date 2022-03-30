const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	const { authorization } = req?.headers;

	if (authorization) {
		const token = authorization.replace('Bearer ', '');

		jwt.verify(token, process.env.SECRET_KEY, async (err, user) => {
			if (err) res.status(403).json('Token not valid!');
			req.user = user;
			next();
		});
	} else {
		return res.status(401).json('You are not authenticated!');
	}
};
