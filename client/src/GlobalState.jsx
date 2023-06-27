import React, { createContext, useState, useEffect } from 'react';
import UserAPI from './api/UserAPI';
import NewsAPI from './api/NewsAPI';
import PicsAPI from './api/PicsAPI';
import axios from 'axios';
import ConfirmModal from './components/mainpages/utils/confirm_modal/ConfirmModal';

export const GlobalState = createContext();

export const DataProvider = ({ children }) => {
	
	const [ token, setToken ] = useState(false);
	const [ logged, setLogged ] = useState(false);
	const [ loading, setLoading ] = useState(true);
	const [ modal, setModal ] = useState(false);

	const refreshToken = async () => {
		try {
			const res = await axios.get('/user/df12_84dawDA155WD78wsda');
			const { data: { content: accessToken, success } } = res;

			if (success) setToken(accessToken);
		} catch (err) {
			const { response: { data: { content: msg } } } = err;
			console.log(msg);
			setLoading(false);
		};
	};

	useEffect(() => {
		const tryLogin = () => {
			const firstLogin = localStorage.getItem('firstLogin');
			if (firstLogin) return refreshToken();
			setLoading(false);
		};

		tryLogin();
	}, [logged]);

	const checkPass = async pass => {
		try {
			const res = await axios.post("/user/confirm_password", {...pass}, {
				headers: { Authorization: token }
			});

			return res.data.content;
		} catch (err) {
			console.log(err.response.data.content);
		};
	};



	const state = {
		userAPI: UserAPI(token, setLoading, setLogged),
		picsAPI: PicsAPI(token),
		newsAPI: NewsAPI(token),
		setLogged,
		token,
		loading: [ loading, setLoading ],
		checkPass,
		confirmModal: [ modal, setModal, ConfirmModal ]
	};

	return (
		<GlobalState.Provider value={state}>
			{ children }
		</GlobalState.Provider>
	);
};