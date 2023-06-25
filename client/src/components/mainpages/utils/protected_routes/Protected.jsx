import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { GlobalState } from "../../../../GlobalState";
import Loading from '../loading/Loading';

const Protected = ({ to, auth, admin, children }) => {
	const state = useContext(GlobalState);
	const { loading: loadingTools, userAPI } = state;
	const [ loading ] = loadingTools;
	const { isAdmin: adminTools } = userAPI;
	const [ isAdmin ] = adminTools;
	const location = useLocation();
	const home = location.pathname === "/";
	const protectedPath = location.pathname === to;
	const isLogged = localStorage.getItem('firstLogin');

	if (loading) return <Loading />;
	if (!auth && isLogged) return <Navigate to={to} replace/>;
	if (!isLogged && auth && !home && !protectedPath) return <Navigate to={to} replace/>;
	if (admin && !isAdmin) return <Navigate to={to} replace/>;
	return children;
};

export default Protected;