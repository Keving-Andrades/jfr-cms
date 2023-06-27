import { useState, useEffect } from 'react';
import axios from 'axios';

function NewsAPI(token) {
	const [ news, setNews ] = useState([]);

	const getNews = async () => {
		try {
			const { data: { status, success, content } } = await axios.get('/api/news', {
				headers: { Authorization: token }
			});

			console.log(content);
			setNews(news => [...(success ? content : [])]);
		} catch (err) {
			console.log(err.response.data.content);
		};
	};

	const addFeatured = async id => {
		try {
			const newNews = news.map(news => {
				return {
					...news,
					featured: news.featured ? false : news._id === id ? true : news.featured
				};
			});

			setNews(news => newNews);
			
			const { data } = await axios.get(`/api/news/set_featured/${id}`, {
				headers: { Authorization: token }
			});
			const { success, content } = data;

			return {
				success,
				content
			};
		} catch (err) {
			console.log(err);
		};
	};

	const delNews = async id => {
		try {
			const { data } = await axios.delete(`/api/news/${id}`, {
				headers: { Authorization: token }
			});
			const { success, content } = data;

			return {
				success,
				content
			};
		} catch (err) {
			console.log(err);
		}
	};

	const postNews = async postData => {
		try {
			const { data } = await axios.post('/api/news', postData, {
				headers: { Authorization: token }
			});
			
			const { success, content } = data;

			return {
				success,
				content
			};
		} catch (err) {
			console.log(err);
		};
	};

	const updateNews = async postData => {
		try {

			if (Object.keys(postData).length < 2 && postData.hasOwnProperty("_id")) return {
				success: false,
				content: "No hay nada por actualizar"
			};

			const { data } = await axios.put(`/api/news/${postData._id}`, postData, {
				headers: { Authorization: token }
			});
			
			const { success, content } = data;

			return {
				success,
				content
			};
		} catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		if (token) getNews();
	}, [token]);

	return {
		news: [ news, setNews, getNews ],
		addFeatured,
		delNews,
		postNews,
		updateNews
	};
};

export default NewsAPI;