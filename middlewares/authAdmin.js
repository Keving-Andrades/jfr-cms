const Users = require('../models/userModel');

const deleteFile = files => {
	if (files || Object.keys(files).length > 0) {
		const fs = require('fs');
		const filePath = files.file.tempFilePath;

		fs.unlink(filePath, err => {
			if (err) throw err;
			console.log(`Temp file of "${files.file.name}" was deleted.\nReason: Access denied.`);
		});
	};
};

const authAdmin = async (req, res, next) => {
	try {
		// Get user information by id
		const user = await Users.findOne({
			_id: req.user.id
		});

		const files = req.files;

		if (user.role === 2) {
			if (files) deleteFile(files);
			return res.status(400).json({ msg: "Admin resources access denied." });
		};

		next();
	} catch (err) {
		return res.status(500).json({ msg: err.message });
	};
};

module.exports = authAdmin;