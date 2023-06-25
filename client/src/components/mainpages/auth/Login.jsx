import React, { useState, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { GlobalState } from '../../../GlobalState';

function Login() {
	const state = useContext(GlobalState);
	const { setLogged } = state;
	const navigate = useNavigate();
	const passwordRef = useRef(null);

	const [showPass, setShowPass] = useState(false);
	const [user, setUser] = useState({
		email: '',
		password: ''
	});

	const onChangeInput = e => {
		const { name, value } = e.target;
		setUser({ ...user, [name]: value.trim() });
	};

	const loginSubmit = async e => {
		e.preventDefault();

		try {
			const { data } = await axios.post('/user/login', { ...user });
			const { status, success, content } = data;

			if (!success) return toast.error(content);

			if (success) {
				localStorage.setItem('firstLogin', true);

				setLogged(true);
				toast.success("¡Sesión iniciada correctamente!");
				navigate('/news');
			};
		} catch (err) {
			console.log(err);
		};
	};

	return (
		<div className='login'>
			<form className="login__form" onSubmit={loginSubmit} autoComplete="off">
				<div>
					<h1>Inicia sesión</h1>
					<div className='login__form--inputs'>

						<div className='input_field'>
							<input type="email" name='email' className={`inputs__email${user.email.length ? ' filled' : ''}`} value={user.email} required onChange={onChangeInput} />
							<label className="field__label" htmlFor="email">Correo electrónico</label>
							<span className="field__placeholder">Correo electrónico</span>
						</div>

						<div
							className='input_field'
							onBlur={e => {
								e.preventDefault();
								if (e.relatedTarget && e.relatedTarget.classList.contains("input__showPassword")) passwordRef.current.focus();
							}}
						>
							<input
								type={showPass ? 'text' : 'password'}
								name='password'
								className={`inputs__password${user.password.length ? ' filled' : ''}`}
								value={user.password}
								onChange={onChangeInput}
								onFocus={e => e.currentTarget.selectionStart = e.currentTarget.value.length}
								autoComplete='on'
								minLength="6"
								required
								ref={passwordRef}
							/>
							<label className="field__label" htmlFor="password">Contraseña</label>
							<span className="field__placeholder">Contraseña</span>
							<div className="input__showPassword" onClick={() => setShowPass(!showPass)} onMouseUp={e => e.preventDefault()} tabIndex="1">
								{
									showPass ?
										<FontAwesomeIcon icon={icon({ name: 'eye-slash', style: 'regular' })}/>
										:
										<FontAwesomeIcon icon={icon({ name: 'eye', style: 'regular' })}/>
								}
							</div>
						</div>
					</div>

					<div className="login__form--buttons">
						<span>
							¿Necesitas una cuenta?{" "}
							<Link to="/register">Regístrate aquí</Link>
						</span>
						<button type='submit'>Ingresar</button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default Login;