const { Schema, model } = require('mongoose');

const userSchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	role: {
		type: Number,
		required: true
	},
	code: {
		type: String
	}
}, {
	timestamps: true
});

module.exports = model('Users', userSchema);