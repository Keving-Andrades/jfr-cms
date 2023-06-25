const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { customAlphabet } = require('nanoid');
const randomString = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 10);

const userCtrl = {
	register: async (req, res) => {
		try {
			const { name, email, password, code } = req.body;

			if (name.length < 3) return res.json({
				status: 400,
				success: false,
				content: "El nombre debe tener como mínimo 3 caracteres de longitud."
			});

			const user = await User.findOne({ email });
			if (user) return res.json({
				status: 400,
				success: false,
				content: "El correo electrónico ya existe."
			});

			if (password.length < 6) return res.json({
				status: 400,
				success: false,
				content: "La contraseña debe tener como mínimo 6 caracteres de longitud."
			});

			// Password encryption
			const passwordHash = await bcrypt.hash(password, 10);

			if (!code) {
				const admin = await User.findOne({ role: 1 });
				if (admin) return res.json({
					status: 400,
					success: false,
					content: "Ya existe un administrador."
				});
			};

			if (code) {
				if (code.length !== 6) return res.json({
					status: 400,
					success: false,
					content: "El código de colaborador es inválido."
				});
	
				const validCollab = await User.findOne({ code, state: 0 });
				if (!validCollab) return res.json({
					status: 400,
					success: false,
					content: "El código de colaborador es inválido."
				});

				const data = {
					name,
					email,
					password: passwordHash,
					state: 1
				};

				await User.findOneAndUpdate({ code }, data);
				return res.json({
					status: 200,
					success: true,
					content: "Se ha registrado exitosamente."
				})
			};

			const data = {
				name,
				email,
				password: passwordHash,
				role: 1,
				state: 1
			};
			
			const newUser = new User(data);

			await newUser.save();

			return res.json({
				status: 200,
				success: true,
				content: "Se ha registrado exitosamente."
			});
		} catch (err) {
			const { message } = err;
			const error = {
				status: 500,
				success: false,
				content: message
			};
			return res.json(error);
		};
	},
	login: async (req, res) => {
		try {
			const { email, password } = req.body;

			const user = await User.findOne({ email });

			if (!user) return res.json({
				status: 400,
				success: false,
				content: "Datos incorrectos."
			});

			if (user.state !== 1) return res.json({
				status: 400,
				success: false,
				content: "Datos incorrectos."
			});

			if (!password) return res.json({
				status: 400,
				success: false,
				content: "Contraseña requerida."
			});

			const isMatch = await bcrypt.compare(password, user.password);

			if (!isMatch) return res.json({
				status: 400,
				success: false,
				content: "Datos incorrectos."
			});

			// If login success, create access token and refresh token
			const accessToken = createAccessToken({id: user._id});
			const refreshToken = createRefreshToken({id: user._id});

			res.cookie('df12_84dawDA155WD78wsda', refreshToken, {
				httpOnly: true,
				secure: true,
				sameSite: 'Strict',
				path: '/user/df12_84dawDA155WD78wsda',
				expires: new Date(Date.now() + (400 * 24 * 3600000))
			});

			return res.json({
				status: 200,
				success: true
			});
		} catch (err) {
			const { message } = err;
			const error = {
				status: 500,
				success: false,
				content: message
			};
			return res.json(error);
		};
	},
	logout: async (req, res) => {
		try {
			res.clearCookie('df12_84dawDA155WD78wsda', {
				path: '/user/df12_84dawDA155WD78wsda'
			});

			return res.json({
				status: 200,
				success: true,
				content: "Logged out, cookies cleared."
			});
		} catch (err) {
			const { message } = err;
			const error = {
				status: 500,
				success: false,
				content: message
			};
			return res.json(error);
		};
	},
	refreshToken: async (req, res) => {
		try {
			const rf_token = req.cookies["df12_84dawDA155WD78wsda"];
			if (!rf_token) {
				const error = {
					status: 400,
					success: false,
					content: "Please login or register."
				};

				console.error(error);
				return res.json(error);
			};
	
			jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
				if (err) {
					const error = {
						status: 400,
						success: false,
						content: "Please login or register."
					};
	
					console.error(error);
					return res.json(error);
				};

				const accessToken = createAccessToken({ id: user.id });

				res.json({
					status: 200,
					success: true,
					content: accessToken
				});
			});
		} catch (err) {
			const { message } = err;
			const error = {
				status: 500,
				success: false,
				content: message
			};
			return res.json(error);
		};
	},
	confirmPassword: async (req, res) => {
		try {
			const user = await User.findById(req.user.id);	
			if (!user) {
				const error = {
					status: 400,
					success: false,
					content: "User does not exist."
				};

				console.error(error);
				return res.json(error);
			};

			const { password } = req.body;

			const validPass = await bcrypt.compare(password, user.password);
			
			res.json({
				status: 200,
				success: true,
				content: validPass
			});
		} catch (err) {
			const { message } = err;
			const error = {
				status: 500,
				success: false,
				content: message
			};
			return res.json(error);
		};
	},
	addCollab: async (req, res) => {
		try {
			let newCode = '';

			while (newCode.length === 0) {
				const code = randomString(6);
				const collab = await User.findOne({ code });
				if (!collab) newCode = code;
			};

			const passwordHash = await bcrypt.hash(newCode, 10);

			const newCollab = new User({
				name: "Colaborador",
				email: `${newCode}@gmail.com`,
				password: passwordHash,
				role: 2,
				code: newCode
			});

			await newCollab.save();

			return res.json({
				status: 200,
				success: true,
				content: "Código de colaborador generado exitosamente"
			});
		} catch (err) {
			const { message } = err;
			const error = {
				status: 500,
				success: false,
				content: message
			};
			return res.json(error);
		};
	},
	getCollabs: async (req, res) => {
		try {
			const user = await User.findById(req.user.id);

			if (user.role !== 1) return res.json({
				status: 400,
				success: false,
				content: "No tienes permitido acceder a esta ruta"
			});

			const collabs = await User.find({ role: 2, state: { $in: [ 0, 1 ] } }).select('name code');

			if (!collabs.length) return res.json({
				status: 400,
				success: false,
				content: "Aun no hay colaboradores"
			});

			return res.json({
				status: 200,
				success: true,
				content: collabs
			});
		} catch (err) {
			const { message } = err;
			const error = {
				status: 500,
				success: false,
				content: message
			};
			return res.json(error);
		};
	},
	deleteCollab: async (req, res) => {
		try {
			const user = await User.findById(req.user.id);

			if (user.role !== 1) return res.json({
				status: 400,
				success: false,
				content: "No tienes permitido acceder a esta ruta"
			});

			const { id } = req.params;

			if (!id) return res.json({
				status: 400,
				success: false,
				content: 'No ha seleccionado un colaborador para eliminar'
			});

			await User.findOneAndUpdate({ _id: id, role: 2 }, { state: 2 });

			return res.json({
				status: 200,
				success: true,
				content: 'El colaborador se ha eliminado'
			})
		} catch (err) {
			const { message } = err;
			const error = {
				status: 500,
				success: false,
				content: message
			};
			return res.json(error);
		};
	},
	getInfo: async (req, res) => {
		try {
			const user = await User.findById(req.user.id).select("name role state -_id");
			if (!user) return res.status(400).json({
				status: 200,
				success: true,
				content: "El usuario no existe"
			});

			return res.json({
				status: 200,
				success: true,
				content: user
			});
		} catch (err) {
			const { message } = err;
			const error = {
				status: 500,
				success: false,
				content: message
			};
			return res.json(error);
		};
	}
};

const createAccessToken = user => {
	return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
};

const createRefreshToken = user => {
	return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

module.exports = userCtrl;