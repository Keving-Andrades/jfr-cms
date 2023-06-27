const Pic = require('../models/picModel');
const News = require("../models/newsModel");
const User = require('../models/userModel');
const cloudinary = require('cloudinary');
const tinify = require('tinify');

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

const bodyEmpty = value => value.replace(/<(.|\n)*?>/g, '').trim().length === 0 && !value.includes("<img");

const newsCtrl = {
	getNews: async (req, res) => {
		try {
			const user = await User.findById(req.user.id);
			const { role, _id } = user;

			const news = await News.find(role === 1 ? undefined : { code: user.code } ).select("-updatedAt -__v");

			if (news.length < 1) return res.json({
				status: 400,
				success: false,
				content: "Aun no hay publicaciones disponibles."
			});

			return res.json({
				status: 200,
				success: true,
				content: news
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
	createNews: async (req, res) => {
		try {
			const { title, description, content: body, category, image } = req.body;
			const user = await User.findById(req.user.id);
			const by = {
				name: user.name
			};

			if (!title) return res.json({
				status: 400,
				success: false,
				content: "El titulo de la publicación es obligatorio."
			});

			if (title.length > 50) return res.json({
				status: 400,
				success: false,
				content: "El titulo excede los 50 caracteres de longitud."
			});

			if (!description) return res.json({
				status: 400,
				success: false,
				content: "La descripción de la publicación es obligatoria."
			});

			if (description.length > 160) return res.json({
				status: 400,
				success: false,
				content: "La descripción excede los 160 caracteres de longitud."
			});

			if (body && bodyEmpty(body)) return res.json({
				status: 400,
				success: false,
				content: "El contenido de la publicación es obligatorio."
			});

			if (!image.data) return res.json({
				status: 400,
				success: false,
				content: "La imagen de la publicación es obligatoria."
			});

			if (!image.type.match(supportedFormats)) {
				return res.json({
					status: 400,
					success: false,
					content: "Formato de foto inválido."
				});
			};

			tinify.fromBuffer(Buffer.from(image.data, "base64")).toBuffer(async function (err, resultData) {
				if (err) throw err;
				const compressedImageBuff = resultData;

				const result = await uploadStreamAsync(compressedImageBuff);
				const { public_id, secure_url } = result;

				if (!public_id) return res.json({
					status: 400,
					success: false,
					content: "No se ha podido publicar la imagen"
				});

				const picInfo = {
					by
				}

				if (title) picInfo.post = { title };

				const newPic = new Pic({
					public_id: public_id,
					url: secure_url,
					...picInfo
				});

				const pic = await newPic.save();

				const newNews = new News({
					title,
					description,
					body,
					category,
					image: pic._id,
					by,
					code: user.code
				});
	
				const uploadedNews = await newNews.save();

				await Pic.findOneAndUpdate({ _id: pic._id }, { post: { ...pic.post, id: uploadedNews._id } });

				return res.json({
					status: 200,
					success: true,
					content: "Su publicación se ha subido con éxito"
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
	deleteNews: async (req, res) => {
		try {
			const { id } = req.params;

			if (!id) return res.json({
				status: 400,
				success: false,
				content: 'No se han seleccionado publicaciones para eliminar.'
			});

			const news = await News.findById(id);

			if (!news) return res.json({
				status: 400,
				success: false,
				content: 'No se han seleccionado publicaciones para eliminar.'
			});

			const user = await User.findById(req.user.id);

			if (user.role === 2 && news.code !== user.code || user.role === 2 && news.featured) return res.json({
				status: 400,
				success: false,
				content: "No tienes permitido eliminar esta publicación."
			});

			if (news.featured) {
				await cloudinary.v2.uploader.destroy(news.image.public_id, async (err, result) => {
					if (err) throw err;

					if (result.result !== "ok") return res.json({
						status: 400,
						success: false,
						content: result.result
					});

					await Pic.findByIdAndDelete(news.image._id);
				});

				await News.findByIdAndDelete(id);

				const posts = await News.find().sort({ createdAt: -1 });

				await News.findByIdAndUpdate(posts[0]._id, { featured: true });

				return res.json({
					status: 200,
					success: true,
					content: "Publicación eliminada exitosamente."
				});
			};

			if (!news.featured) {
				await cloudinary.v2.uploader.destroy(news.image.public_id, async (err, result) => {
					if (err) throw err;

					if (result.result !== "ok") return res.json({
						status: 400,
						success: false,
						content: result.result
					});

					await Pic.findByIdAndDelete(news.image._id);
				});

				await News.findByIdAndDelete(id);

				return res.json({
					status: 200,
					success: true,
					content: "Publicación eliminada exitosamente."
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
	updateNews: async (req, res) => {
		try {
			const { id } = req.params;

			if (!id) return res.json({
				status: 400,
				success: false,
				content: 'No se han seleccionado publicaciones para actualizar.'
			});

			const news = await News.findById(id);

			if (!news) return res.json({
				status: 400,
				success: false,
				content: 'No se han seleccionado publicaciones para actualizar.'
			});

			const user = await User.findById(req.user.id);
			const fields = req.body;

			if (user.role === 2 && news.code !== user.code) return res.json({
				status: 400,
				success: false,
				content: "No tienes permitido actualizar esta publicación."
			});

			// Filtering inputs
			delete fields["_id"];
			if (!fields["title"] || fields["title"] === news.title) delete fields["title"];
			if (!fields["description"] || fields["description"] === news.description) delete fields["description"];
			if (!fields["content"] || fields["content"] === news.body) delete fields["content"];
			if (!fields["category"] || fields["category"] === news.category) delete fields["category"];
			if (fields["image"] && !fields["image"].data || fields["image"] && fields["image"].data === news.image.url) delete fields["image"];

			// Checking inputs
			if (!Object.keys(fields).length) return res.json({
				status: 400,
				success: false,
				content: "No hay datos para actualizar."
			});

			if (fields["title"]) {
				if (fields["title"].length > 50) return res.json({
					status: 400,
					success: false,
					content: "El titulo excede los 50 caracteres de longitud."
				});

				if (fields["title"] === news.title) return res.json({
					status: 400,
					success: false,
					content: "El titulo no puede ser igual al anterior."
				});
			};

			if (fields["description"]) {
				if (fields["description"].length > 160) return res.json({
					status: 400,
					success: false,
					content: "La descripción excede los 150 caracteres de longitud."
				});

				if (fields["description"] === news.description) return res.json({
					status: 400,
					success: false,
					content: "La descripción no puede ser igual a la anterior."
				});
			};

			if (fields["content"]) {
				if (fields["content"] === news.body) return res.json({
					status: 400,
					success: false,
					content: "El contenido no puede ser igual al anterior."
				});

				fields.body = fields["content"];
				delete fields["content"];
			};

			if (fields["category"]) {
				if (fields["category"] === news.category) return res.json({
					status: 400,
					success: false,
					content: "La categoría no puede ser igual a la anterior."
				});
			};

			if (fields["image"] && fields["image"].data) {
				if (fields["image"].data === news.image.url) return res.json({
					status: 400,
					success: false,
					content: "La imagen no puede ser igual a la anterior."
				});

				tinify.fromBuffer(Buffer.from(fields["image"].data, "base64")).toBuffer(async function (err, resultData) {
					if (err) throw err;
					const compressedImageBuff = resultData;
	
					const result = await uploadStreamAsync(compressedImageBuff);
					const { public_id, secure_url } = result;
	
					if (!public_id) return res.json({
						status: 400,
						success: false,
						content: "No se ha podido actualizar la publicación."
					});

					await Pic.findOneAndUpdate({ _id: news.image._id }, {
						public_id,
						url: secure_url,
						...(fields["title"] ? ({post: { title: fields["title"] }}) : ({}))
					});

					await cloudinary.v2.uploader.destroy(news.image.public_id, async (err, result) => {
						if (err) console.log({
							status: 400,
							success: false,
							content: err
						});
	
						if (fields["title"] || fields["description"] || fields["content"] || fields["category"]) {
							if (fields["image"]) delete fields["image"];
	
							await News.findOneAndUpdate({ _id: id }, {
								...fields
							});
	
							return res.json({
								status: 200,
								success: true,
								content: "Publicación actualizada exitosamente."
							});
						};
	
						return res.json({
							status: 200,
							success: true,
							content: "Publicación actualizada exitosamente."
						});
					});
				});
			};

			if (!fields["image"] && !fields["title"]) {

				await News.findOneAndUpdate({ _id: id }, {
					...fields
				});

				return res.json({
					status: 200,
					success: true,
					content: "Publicación actualizada exitosamente."
				});
			};

			if (!fields["image"] && fields["title"]) {

				await News.findOneAndUpdate({ _id: id }, {
					...fields
				});

				await Pic.findOneAndUpdate({ _id: news.image._id }, {
					post: { 
						title: fields["title"]
					}
				});

				return res.json({
					status: 200,
					success: true,
					content: "Publicación actualizada exitosamente."
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
	setFeatured: async (req, res) => {
		try {
			const user = await User.findById(req.user.id);

			if (user.role !== 1) return res.json({
				status: 400,
				success: false,
				content: "No tienes permitido destacar esta publicación."
			});

			const { id } = req.params;

			if (!id) return res.json({
				status: 400,
				success: false,
				content: 'No se han seleccionado publicaciones para destacar.'
			});

			const newsToUpdate = [
				{
					id,
					featured: true
				}
			];

			const oldFeatured = await News.findOne({ featured: true }).select('_id');

			if (oldFeatured) newsToUpdate.push({ id: oldFeatured._id, featured: false});

			const bulkOps = newsToUpdate.map(news => ({
				updateOne: {
					filter: { _id: news.id },
					update: { featured: news.featured }
				}
			}));

			await News.bulkWrite(bulkOps);

			return res.json({
				status: 200,
				success: true,
				content: "Publicación destacada exitosamente."
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
	}
};

module.exports = newsCtrl;