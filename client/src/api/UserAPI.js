import { useState, useEffect } from 'react';
import axios from 'axios';

function UserAPI(token, setLoading, setLogged) {
	const [ isLogged, setIsLogged ] = useState(false);
	const [ isAdmin, setIsAdmin ] = useState(false);
	const [ collabs, setCollabs ] = useState([]);
	const [ user, setUser ] = useState(null);

	const getUser = async token => {
		try {
			const { data } = await axios.get('/user/info', {
				headers: { Authorization: token }
			});
			const { success, content } = data;

			if (success) {
				setIsLogged(true);
				setLogged(true);
				setUser(content);
				if (content.role !== 2) setIsAdmin(true);
				setLoading(false);

				if (content.role !== 2) getCollabs();
			};

			if (!success && content === 'El usuario no existe') {
				await axios.get('/user/logout', {
					headers: { Authorization: token }
				});
				localStorage.clear();
				window.location.href = '/login';
			};
		} catch (err) {
			console.log(err);
		};
	};

	const genCode = async () => {
		try {
			const { data } = await axios.get('/user/add_collab', {
				headers: { Authorization: token }
			});
			const { success, content } = data;

			return {
				success,
				content
			};
		} catch (err) {
			return {
				success: false,
				content: err
			};
		};
	};

	const getCollabs = async () => {
		try {
			const { data } = await axios.get('/user/collabs', {
				headers: { Authorization: token }
			});
			const { success, content } = data;

			setCollabs(collabs => [...(success ? content : [])]);
		} catch (err) {
			console.log(err);
		}
	};

	const deleteCollab = async id => {
		try {
			const { data } = await axios.delete(`/user/collabs/${id}`, {
				headers: { Authorization: token }
			});
			const { success, content } = data;

			return {
				success,
				content
			};
		} catch (err) {
			return {
				success: false,
				content: err
			};
		}
	};

	useEffect(() => {
		if (token) getUser(token);
	}, [token]);

	return {
		user: [ user, setUser ],
		isLogged: [ isLogged, setIsLogged ],
		isAdmin: [ isAdmin, setIsAdmin ],
		collabs: {
			collabs,
			setCollabs,
			genCode,
			getCollabs,
			deleteCollab
		}
	};
};

export default UserAPI;