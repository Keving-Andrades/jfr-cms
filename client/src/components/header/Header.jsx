import React, { useContext } from 'react';
import { GlobalState } from '../../GlobalState';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import jfr from '/jfr.png';

function Header() {
	const location = useLocation();
	const { pathname: path } = location;
	const state = useContext(GlobalState);
	const { userAPI, picsAPI, newsAPI, setLogged, token } = state;
	const { isLogged: loggedTools, isAdmin: adminTools, collabs: { setCollabs } } = userAPI;
	const { pics: picsTools } = picsAPI;
	const [ pics, setPics ] = picsTools;
	const { news: newsTools } = newsAPI;
	const [ news, setNews ] = newsTools;
	const [ isLogged, setIsLogged ] = loggedTools;
	const [ isAdmin, setIsAdmin ] = adminTools;

	const pages = [
		{
			label: "home",
			path: "/",
			name: "Inicio",
			admin: false
		},
		{
			label: "news",
			path: "/news",
			name: "Noticias",
			admin: false,
			logged: true
		},
		{
			label: "pics",
			path: "/pics",
			name: "Fotos",
			admin: false,
			logged: true
		},
		{
			label: "login",
			path: "/login",
			name: "Iniciar sesión",
			admin: false,
			logged: false
		},
		{
			label: "register",
			path: "/register",
			name: "Registrarse",
			admin: false,
			logged: false
		},
		{
			label: "collaborators",
			path: "/collaborators",
			name: "Colaboradores",
			admin: true,
			logged: true
		},
		{
			label: "logout",
			path: "/",
			name: "Cerrar sesión",
			admin: false,
			logged: true
		}
	];

	const pathname = path === "/" ? "home" : path.replace("/", "");

	const logout = async () => {
		try {
			await axios.get('/user/logout', {
				headers: { Authorization: token }
			});
			localStorage.clear();
			setPics([]);
			setNews([]);
			setCollabs([]);
			setLogged(false);
			setIsAdmin(false);
			setIsLogged(false);
		} catch (err) {
			console.log(err.response.data);
		}
	};

	return (
		<header>
			<div className="logo">
				<img src={jfr} alt="José Félix Ribas - Logo" onContextMenu={e => e.preventDefault()} draggable={false} />
				<span style={{ display: 'flex', alignItems: 'center', gap: '.5vw' }}>José Félix Ribas
					<span style={{ fontFamily: 'monospace', fontSize: '.9vw'}}>(cms)</span>
				</span>
			</div>
			<nav>
				{
					pages.map(({ label, path, name, admin, logged }) =>
						!isLogged && !logged?
							<Link
								onClick={e => {
									if (label === pathname) return e.preventDefault();
								}}
								key={label}
								className={`link ${label}${pathname === label ? ' active' : ''}`}
								to={path}
							>
								<span>{name}</span>
							</Link>
						:
							isLogged && logged ? 
								admin && isAdmin ?
									<Link
										onClick={e => {
											if (label === pathname) return e.preventDefault();
										}}
										key={label}
										className={`link ${label}${pathname === label ? ' active' : ''}`}
										to={path}
									>
										<span>{name}</span>
									</Link>
								:
									!admin && !admin ?
										<Link
											onClick={e => {
												if (label === pathname) return e.preventDefault();
												if (label === "logout") return logout();
											}}
											key={label}
											className={`link ${label}${pathname === label ? ' active' : ''}`}
											to={path}
										>
											<span>{name}</span>
										</Link>
									:
										null
							:
								null
					)
				}
			</nav>
		</header>
	);
};

export default Header;