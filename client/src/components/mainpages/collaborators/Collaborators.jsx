import React, { useContext, useState } from 'react';
import { GlobalState } from '../../../GlobalState';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Ring } from '@uiball/loaders';

const Collaborators = () => {
	const state = useContext(GlobalState);
	const { userAPI, confirmModal } = state;
	const { collabs: collabsTools } = userAPI;
	const { collabs, genCode, getCollabs, deleteCollab } = collabsTools;
	const [ modal, setModal ] = confirmModal;
	const [ loading, setLoading ] = useState(false);

	const handleCode = async e => {
		if (loading) return e.preventDefault();

		setLoading(true);

		const { success, content } = await genCode();

		if (!success) {
			setLoading(false);
			return toast.error(content);
		};

		if (success) {
			await getCollabs();
			setLoading(false);
			return toast.success("¡Código de colaborador generado exitosamente!");
		};
	};

	const handleCopy = e => {
		navigator.clipboard.writeText(e.currentTarget.innerText);
		toast.success("¡Código copiado al portapapeles!");
	};

	const handleDelete = id => {
		setModal({
			data: {
				title: "¿Estás seguro?",
				description: <span>El colaborador seleccionado no podrá volver a ingresar al sistema.</span>,
				next: () => deleteCollab(id)
			},
			setConfirmModal: setModal,
			forceRefreshContent: async () => {
				await getCollabs();
			},
			toast: 'El colaborador ha sido eliminado'
		});
	};

	return (
		<div className='collabs__container'>
			<div className={`collabs__container--create ${loading ? 'disabled' : ''}`} onClick={handleCode}>
				<span>
					{ loading ? <Ring size={18} lineWeight={5} speed={2} color="var(--white)" /> : null }
					Crear colaborador
				</span>
			</div>
			<div className='collabs__container--list'>
				{
					collabs.map(collab =>
						<div className='list__collabCard' key={collab._id}>

							<div className='list__collabCard--delete' onClick={() => handleDelete(collab._id)}>
								<FontAwesomeIcon icon = { icon({ name: 'ban', style: 'solid' }) } />
							</div>

							<div className='list__collabCard--user'>
								<FontAwesomeIcon icon = { icon({ name: 'circle-user', style: 'solid' }) } />
								<span>{collab.name}</span>
							</div>

							<span className='list__collabCard--code' title='Copiar código' onClick={handleCopy}>{collab.code}</span>

						</div>
					)
				}
			</div>
		</div>
	);
};

export default Collaborators;