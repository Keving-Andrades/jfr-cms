import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Ring } from '@uiball/loaders';

const ConfirmModal = ({modalTools}) => {
	const { data, setConfirmModal, closePreviousModal, forceRefreshContent, toast: successMsg } = modalTools;
	const { title, description, next } = data;
	const [ loading, setLoading ] = useState(false);

	const cancel = e => {
		if (loading) return e.preventDefault();
		setConfirmModal(false);
	};

	const accept = async e => {
		if (loading) return e.preventDefault();

		setLoading(true);

		const { success, content } = await next();

		if (!success) {
			setLoading(false);
			if (closePreviousModal) closePreviousModal(false);
			setConfirmModal(false);
			return toast.error(content);
		};

		if (success) {
			if (forceRefreshContent) await forceRefreshContent();
			setLoading(false);
			if (closePreviousModal) closePreviousModal(false);
			setConfirmModal(false);
			if (successMsg) return toast.success(successMsg);
		};
	};

	return (
		<div className='bg-block confirmModal' onClick={cancel}>
			<div className='confirmModal' onClick={e => e.stopPropagation()}>
				<div className='confirmModal__content'>
					<span className="title">{title}</span>
					{
						description ?
							<div className='description'>
								{description}
							</div>
						:
							null
					}
				</div>
				<div className="confirmModal__buttons">
					<div className={`confirmModal__buttons--cancel ${loading ? 'disabled' : ''}`} onClick={cancel}>Cancelar</div>
					<div className={`confirmModal__buttons--accept ${loading ? 'disabled' : ''}`} onClick={accept}>
						<span>
							{ loading ? <Ring size={18} lineWeight={5} speed={2} color="var(--white)" /> : null }
							Aceptar
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ConfirmModal;