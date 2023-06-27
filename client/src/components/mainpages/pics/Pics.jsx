import React, { useContext, useEffect, useRef, useState } from 'react';
import { GlobalState } from '../../../GlobalState';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { toast } from 'react-toastify';
import { Ring } from '@uiball/loaders';

const Modal = ({ pic, modalTools, confirmModal, delPic, getPics, getNews }) => {
	const [ expanded, setExpanded ] = modalTools;
	const newDate = new Date(pic.createdAt).toLocaleDateString('en-GB', { month: '2-digit',day: '2-digit',year: 'numeric'});
	const time =  new Date(pic.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
	.replace("p. m.", "PM")
	.replace("a. m.", "AM");
	const [ modal, setModal ] = confirmModal;

	const deletePic = id => {
		setModal({
			data: {
				title: "¿Estás seguro?",
				description: pic.post ? 
					<> 
						<span>Borrar esta foto, eliminará la publicación que le corresponde.</span> 
						<div>
							<span>Publicación:</span>
							<span>{pic.post.title}</span>
						</div>
					</> 
				: 
					null,
				next: () => delPic(id)
			},
			setConfirmModal: setModal,
			closePreviousModal: () => setExpanded(false),
			forceRefreshContent: () => {
				getPics();
				if (pic.post && pic.post.id) getNews();
			},
			toast: '¡Imagen borrada exitosamente!'
		});
	};

	return (
		<>
			<div className="bg-block" onClick={() => setExpanded(false)}>
				<div className="pic__card--expanded" onClick={e => e.stopPropagation()}>

					<div className="expanded__pic">
						<img src={pic.url} alt="" />
					</div>

					<div className="expanded__content">

						<div className="expanded__content--info">
							{
								pic.by ?
									<div className="info__author">
										<span>Publicada por:</span>
										<div className='name'>
											<FontAwesomeIcon icon = { icon({name: 'circle-user', style: 'solid'}) } />
											<span>{pic.by.name}</span>
										</div>
									</div>
								:
									null
							}
							<div className="info__date">
								<div className="date">
									<span className='field'>Fecha:</span>
									<span className='data'>{newDate}</span>
								</div>
								<div className="time">
									<span className='field'>Hora:</span>
									<span className='data'>{time}</span>
								</div>
							</div>
						</div>
						
						<div className="separator"></div>

						<div className="expanded__content--buttons">
							<div className="delete" onClick={() => deletePic(pic._id)}>
								<FontAwesomeIcon icon = { icon({name: 'trash', style: 'solid'}) } />
								<span>Borrar</span>
							</div>
						</div>

					</div>
				</div>
			</div>
		</>
	);
};

const ModalUpload = ({ image, setUpload, preview, uploadPic, getPics, getNews, input }) => {
	const { metadata: { name, size, type } } = image;
	const [ previewImage, setPreview ] = preview;
	const [ loading, setLoading ] = useState(false);

	const cancelHandler = async e => {
		if (loading) return e.preventDefault();

		setUpload({
			file: null,
			metadata: null
		});
		setPreview(false);
		return input.value = null;
	};

	const acceptHandler = async e => {
		setLoading(true);

		if (loading) return e.preventDefault();

		const { success, content } = await uploadPic(image);

		if (!success) {
			setLoading(false);
			return toast.error(content);
		};

		if (success) {
			await getPics();
			setUpload({
				file: null,
				metadata: null
			});
			setPreview(false);
			setLoading(false);
			input.value = null;
			return toast.success("¡Imagen publicada exitosamente!");
		};
	};

	return (
		<div className="bg-block" onClick={cancelHandler}>
			<div className="modalUpload" onClick={e => e.stopPropagation()}>
				<div className="modalUpload__image">
					<img src={previewImage} alt="" />
				</div>
				<div className="modalUpload__content">
	
					<div className="modalUpload__content--metadata">

						<div className="imageInfo__data name">
							<span className="imageInfo__data--title">Nombre de archivo:</span>
							<span className="imageInfo__data--value">{name}</span>
						</div>

						<div className="imageInfo__data size">
							<span className="imageInfo__data--title">Tamaño de archivo:</span>
							<span className="imageInfo__data--value">{size}</span>
						</div>

					</div>
	
					<div className="separator"></div>
	
					<div className="modalUpload__content--buttons">
						<div className={`buttons cancel ${loading ? 'disabled' : ''}`} onClick={cancelHandler}>
							<FontAwesomeIcon icon = { icon({ name: 'ban', style: 'solid' }) } />
							<span>Cancelar</span>
						</div>
						<div className={`buttons accept ${loading ? 'disabled' : ''}`} onClick={acceptHandler}>
							{
								loading ?
									<Ring size={18} lineWeight={5} speed={2} color="var(--white)" />
								:
									<FontAwesomeIcon icon = { icon({ name: 'upload', style: 'solid' }) } />
							}
							<span>Publicar</span>
						</div>
					</div>
	
				</div>
			</div>
		</div>
	);
};

const Pics = () => {
	const state = useContext(GlobalState);
	const { newsAPI, picsAPI, userAPI, confirmModal } = state;
	const { isAdmin: adminTools } = userAPI;
	const [ isAdmin ] = adminTools;
	const { news: newsTools } = newsAPI;
	const { pics: picsTools, delPic, uploadPic } = picsAPI;
	const [ news, setNews, getNews ] = newsTools;
	const [ pics, setPics, getPics ] = picsTools;
	const [ expanded, setExpanded ] = useState(false);
    const [ preview, setPreview ] = useState(false);
    const [ file, setFile ] = useState(false);
	const [ upload, setUpload ] = useState({
		file: null,
		metadata: null
	});
	const inputFileRef = useRef(null);

	const imageHandler = e => {
		const { name, size, type } = e.target.files[0];

		if (!type.match(/image\/(png|jpg|jpeg)/i)) return toast.error("Formato de imagen inválido");

		const metadata = {
			name,
			size: `${(size / (1024 ** 2)).toFixed(2)} MB`,
			type
		};

		setUpload({...upload, metadata});
		setFile(e.target.files[0]);
	};

	useEffect(() => {
		let fileReader, isCancel = false;
		if (file) {
			fileReader = new FileReader();

			fileReader.onload = e => {
				const { result } = e.target;

				const parseBase64 = result.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
				setUpload({...upload, file: parseBase64});
				setPreview(result);
			};
			
			fileReader.readAsDataURL(file);
		};

		return () => {
			isCancel = true;
			if (fileReader && fileReader.readyState === 1) fileReader.abort();
		};

	}, [ file ]);

	return (
		<>
			{
				preview ?
					<ModalUpload image = { upload } setUpload = { setUpload } preview = { [ preview, setPreview] } uploadPic = { uploadPic } getPics = { getPics } input = { inputFileRef.current } />
				:
					null
			}
			{
				expanded ?
					<Modal pic = { expanded } modalTools = { [ expanded, setExpanded ] } confirmModal = { confirmModal } delPic = { delPic } getPics = { getPics } getNews = { getNews } />
				:
					null
			}
			<div className='pics__container'>
				<div className="upload__card">
					<div className='upload__card--placeholder'>
						<FontAwesomeIcon icon = { icon({ name: "file-arrow-up", style: "solid" }) } />
						<span>Subir imagen</span>
					</div>
					<input type="file" ref = { inputFileRef } onChange={imageHandler} title='' name="file" id="file" accept='.jpg, .jpeg, .png' multiple={false} />
				</div>
				{
					pics.map(pic => 
						<div key={pic._id} className='pics__card' onClick={() => setExpanded(pic)}>
							<img src={pic.url} alt="" />
						</div>
					)
				}
			</div>
		</>
	);
};

export default Pics;