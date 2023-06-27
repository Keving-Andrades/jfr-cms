const Pic = require('../models/picModel');
const News = require('../models/newsModel');
const User = require('../models/userModel');
const cloudinary = require('cloudinary');
const tinify = require('tinify');
const fs = require('fs');

/**
 * Remove temp file
 * @param {string} path File path
 */
const removeTemp = path => {
	fs.unlink(path, err => {
		if (err) throw err;
	});
};

// we will upload image on cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.CLOUD_API_KEY,
	api_secret: process.env.CLOUD_API_SECRET
});

tinify.key = 'PZD5jhV31Jgx6ghWN0Zf7MxCWHJss9Ww';

const supportedFormats = /image\/(png|jpg|jpeg)/i;

const uploadStreamAsync = buffer => {
	return new Promise((resolve, reject) => {
		cloudinary.v2.uploader.upload_stream(
			{
				folder: 'JFR - Photos',
				resource_type: "image",
				transformation: {
					width: 2160,
					height: 1440,
					crop: "lfill"
				},
				format: 'jpg',
			},
			function onEnd(error, result) {
				if (error) {
					return reject(error);
				};
				resolve(result);
			}
		).end(buffer);
	});
};

const picsCtrl = {
	getPics: async (req, res) => {
		try {
			const user = await User.findById(req.user.id);
			const { role } = user;
			const pics = await Pic.find(role === 1 ? undefined : { code: user.code } ).select('-updatedAt -__v');

			if (pics.length < 1) {
				const error = {
					status: 400,
					success: false,
					content: "Aun no hay fotos disponibles."
				};
				return res.json(error);
			};

			return res.json({
				status: 200,
				success: true,
				content: pics
			});
		} catch (err) {
			const { message } = err;
			const error = {
				status: 500,
				success: false,
				content: message
			};

			console.error(error);
			return res.json(error);
		};
	},
	uploadPic: async (req, res) => {
		try {
			const user = await User.findById(req.user.id);
			const by = {
				name: user.name
			};

			const picInfo = {
				by
			}

			const { file, metadata: { type } } = req.body;

			if (!type.match(supportedFormats)) {
				return res.json({
					status: 400,
					success: false,
					content: "Formato de foto inválido."
				});
			};

			tinify.fromBuffer(Buffer.from(file, "base64")).toBuffer(async function (err, resultData) {
				if (err) throw err;
				const compressedImageBuff = resultData;

				const result = await uploadStreamAsync(compressedImageBuff);
				const { public_id, secure_url } = result;

				if (!public_id) return res.json({
					status: 400,
					success: false,
					content: "No se ha podido publicar la imagen"
				});

				const newPic = new Pic({
					public_id: public_id,
					url: secure_url,
					...picInfo
				});

				await newPic.save();

				return res.json({
					status: 200,
					success: true,
					content: "Imagen publicada exitosamente"
				});
			});
		} catch (err) {
			const { message } = err;
			const error = {
				status: 500,
				success: false,
				content: message
			};

			console.error(error);
			return res.json(error);
		};
	},
	deletePic: async (req, res) => {
		try {
			const file = req.files?.file;
			if (file) removeTemp(file.tempFilePath);
			const { id } = req.params;

			if (!id) return res.json({
				status: 400,
				success: false,
				content: 'No se han seleccionado imágenes para eliminar.'
			});

			const pic = await Pic.findById(id);
			if (!pic) return res.json({
				status: 400,
				success: false,
				content: 'No se han seleccionado imágenes para eliminar.'
			});

			const { public_id, by } = pic;
			const user = await User.findById(req.user.id);

			if (user.role === 2 && pic.code !== user.code) return res.json({
				status: 400,
				success: false,
				content: "No tienes permitido eliminar esta foto."
			});
				
			if (pic.post && pic.post.id) {
				const post = await News.findById(pic.post.id);

				if (user.role === 2 && post.featured) return res.json({
					status: 400,
					success: false,
					content: "No tienes permitido eliminar esta foto porque pertenece a una publicación destacada."
				});

				await News.findByIdAndDelete(pic.post.id);
				await Pic.findByIdAndDelete(id);

				await cloudinary.v2.uploader.destroy(public_id, async (err, result) => {
					if (err) throw err;

					// if (result.result !== "ok") return res.json({
					// 	status: 400,
					// 	success: false,
					// 	content: result.result
					// });
				});

				return res.json({
					status: 200,
					success: true,
					content: "Foto eliminada."
				});
			};

			if (!pic.post) {
				await Pic.findByIdAndDelete(id);

				await cloudinary.v2.uploader.destroy(public_id, async (err, result) => {
					if (err) throw err;
				});
				
				return res.json({
					status: 200,
					success: true,
					content: "Foto eliminada."
				});
			};
		} catch (err) {
			const { message } = err;
			const error = {
				status: 500,
				success: false,
				content: message
			};

			console.error(error);
			return res.json(error);
		};
	},
};

module.exports = picsCtrl;