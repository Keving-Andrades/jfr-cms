import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';

function Register() {
	const navigate = useNavigate();
	const passwordRef = useRef(null);

	const [showPass, setShowPass] = useState(false);
	const [user, setUser] = useState({
		name: '',
		email: '',
		password: '',
		code: ''
	});

	const onChangeInput = e => {
		const { name, value } = e.target;
		setUser({ ...user, [name]: value.trim() });
	};

	const registerSubmit = async e => {
		e.preventDefault();

		try {
			const { data } = await axios.post('/user/register', { ...user });
			const { status, success, content } = data;

			if (!success) return toast.error(content);

			if (success) {
				navigate('/login');
				return toast.success("¡Se ha registrado correctamente!");
			};
		} catch (err) {
			const { response: { data } } = err;
			const { status, success, content } = data;

			if (!success) toast.error(content);
		};
	};

	return (
		<div className='register'>
			<form className="register__form" onSubmit={registerSubmit} autoComplete="off">
				<div>
					<h1>Crea una cuenta</h1>
					<div className='register__form--inputs'>

						<div className='input_field'>
							<input type="text" name='name' className={`inputs__name${user.name.length ? ' filled' : ''}`} value={user.name} required onChange={onChangeInput} minLength="3" />
							<label className="field__label" htmlFor="name">Nombre</label>
							<span className="field__placeholder">Nombre</span>
						</div>

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
								autoComplete='new-password'
								minLength="6"
								required
								ref={passwordRef}
							/>
							<label className="field__label" htmlFor="password">Contraseña</label>
							<span className="field__placeholder">Contraseña</span>
							<div className="input__showPassword" onClick={() => setShowPass(!showPass)} onMouseUp={e => e.preventDefault()} tabIndex="1">
								{
									showPass ?
										<FontAwesomeIcon icon={icon({ name: 'eye-slash', style: 'regular' })} />
										:
										<FontAwesomeIcon icon={icon({ name: 'eye', style: 'regular' })} />
								}
							</div>
						</div>
						
						<div className='input_field'>
							<input type="text" name='code' className={`inputs__code${user.name.length ? ' filled' : ''}`} value={user.code} onChange={onChangeInput} minLength="6" maxLength="6" />
							<label className="field__label" htmlFor="name">Código</label>
							<span className="field__placeholder">Código</span>
						</div>
					</div>

					<div className="register__form--buttons">
						<span to="/login">
							¿Ya tienes una cuenta?{" "}
							<Link to="/login">Ingresa aquí</Link>
						</span>
						<button type='submit'>Registrarse</button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default Register;