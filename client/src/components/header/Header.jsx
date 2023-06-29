import React, { useContext } from 'react';
import { GlobalState } from '../../GlobalState';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import jfr from '/jfr.png';

function Header() {
	const location = useLocation();
	const { pathname: path } = location;
	const state = useContext(GlobalState);
	const { userAPI, picsAPI, newsAPI, setLogged, token } = state;
	const { user: userTools, isLogged: loggedTools, isAdmin: adminTools, collabs: { setCollabs } } = userAPI;
	const [ user, setUser ] = userTools;
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
			setUser(null);
			setCollabs([]);
			setLogged(false);
			setIsAdmin(false);
			setIsLogged(false);
		} catch (err) {
			console.log(err.response.data);
		}
	};

	const pagesFiltered = pages.filter(page => isLogged && isAdmin && page.logged && page.admin || isLogged && page.logged && !page.admin || !isLogged && !page.logged);

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
					pagesFiltered.map(({ label, path, name }) =>
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
					)
				}

				{
					user ?
						<div className="user">
							<div className="user__name">

								<span>{user.name}</span>
								<FontAwesomeIcon icon = { icon({ name: 'circle-user', style: 'solid' }) } />
							</div>

							<div className="user__menu">

								<span className="user__menu--email">{user.email}</span>

								<Link
									onClick = { logout }
									className = 'link logout'
									to = '/'
								>
									Cerrar sesión
								</Link>

							</div>

						</div>
					:
						null
				}
			</nav>
		</header>
	);
};

export default Header;