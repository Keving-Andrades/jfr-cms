const jwt = require('jsonwebtoken');

const deleteFile = files => {
	if (files || Object.keys(files).length > 0) {
		const fs = require('fs');
		const filePath = files.file.tempFilePath;

		fs.unlink(filePath, err => {
			if (err) throw err;
			console.log(`Temp file of "${files.file.name}" was deleted.\nReason: Invalid authentication.`);
		});
	};
};

const auth = (req, res, next) => {
	try {
		const token = req.header("Authorization");

		const files = req.files;

		if (!token) {
			if (files) deleteFile(files);
			return res.status(400).json({ msg: `Invalid authentication in token verify, token = ${token}` });
		};

		jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
			if (err) {
				if (files) deleteFile(files);
				return res.status(400).json({
					msg: `Invalid authentication in jwt.verify, token = ${token}`,
					error: err
				});
			};

			req.user = user;
			next();
		});

	} catch (err) {
		return res.status(500).json({ msg: err.message });
	};
};

module.exports = auth;