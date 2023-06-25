import { useState, useEffect } from 'react';
import axios from 'axios';

function UserAPI(token, setLoading, setLogged) {
	const [ isLogged, setIsLogged ] = useState(false);
	const [ isAdmin, setIsAdmin ] = useState(false);
	const [ collabs, setCollabs ] = useState([]);

	const getUser = async token => {
		try {
			const { data } = await axios.get('/user/info', {
				headers: { Authorization: token }
			});
			const { success, content } = data;
			if (success) {
				if (content.state === 2) {
					await axios.get('/user/logout', {
						headers: { Authorization: token }
					});
					localStorage.clear();
					window.location.href = '/login';
				};

				setIsLogged(true);
				if (content.role === 1) setIsAdmin(true);
				setLoading(false);
				setLogged(true);

				if (content.role === 1) getCollabs();
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