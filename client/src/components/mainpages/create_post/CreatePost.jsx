import React, { useContext, useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { GlobalState } from '../../../GlobalState';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import CustomToolbar, { modules, formats } from '../utils/custom_toolbar/CustomToolbar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Ring } from '@uiball/loaders';

const CreatePost = () => {
	const navigate = useNavigate();
	const state = useContext(GlobalState);
	const { newsAPI, picsAPI } = state;
	const { news: newsTools, postNews } = newsAPI;
	const { pics: picsTools } = picsAPI;
	const [ news, setNews, getNews ] = newsTools;
	const [ pics, setPics, getPics ] = picsTools;
	const [ loading, setLoading ] = useState(false);
    const [ preview, setPreview ] = useState(false);
	const [ file, setFile ] = useState(null);
	const [ postData, setPostData ] = useState({
		title: '',
		description: '',
		category: 'Evento',
		content: '',
		image: {
			data: '',
			type: ''
		}
	});
	const [ openCategory, setOpenCategory ] = useState(false);
	const formRef = useRef(null);

	const bodyEmpty = value => value.replace(/<(.|\n)*?>/g, '').trim().length === 0 && !value.includes("<img");

	const formValidity = () => formRef.current && formRef.current.checkValidity() && postData.content && !bodyEmpty(postData.content);

	const handleSubmit = async e => {
		setLoading(true);
		
		e.preventDefault();

		if (loading) return e.preventDefault();

		if (formRef.current && !formRef.current.checkValidity()) {
			setLoading(false);
			return e.preventDefault();
		};

		if (!postData.content || postData.content && bodyEmpty(postData.content)) {
			setLoading(false);
			return toast.error("El contenido de la publicación es obligatorio.");
		};

		const { success, content } = await postNews(postData);

		if (!success) {
			setLoading(false);
			return toast.error(content);
		};

		if (success) {
			getNews();
			getPics();
			navigate('/news');
			setLoading(false);
			return toast.success("¡Publicación realizada exitosamente!");
		};
	};

	const imageHandler = e => {
		const file = e.target.files[0];
		if (!file.type.match(/image\/(png|jpg|jpeg)/i)) return toast.error("Formato de imagen inválido");
		setPostData({...postData, image: {...postData.image, type: file.type}});
		setFile(file);
	};

	const categoryList = [
		"Evento",
		"Informativo",
		"Educativo",
		"Publicitario",
		"Concientización",
		"Entretenimiento"
	];

	const categoryHandler = e => {
		const category = e.currentTarget.innerText;
		setOpenCategory(!openCategory);
		setPostData({...postData, category});
	};

	const onChangeInput = e => {
		const { name, value } = e.target;
		setPostData({...postData, [name]: value});
	};

	const onChangeQuill = (content, delta, source, editor) => {
		setPostData({...postData, content});
	};

	useEffect(() => {
		let fileReader, isCancel = false;

		if (file) {
			fileReader = new FileReader();

			fileReader.onload = e => {
				const { result } = e.target;
				const parseBase64 = result.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");

				if (result && !isCancel) {
					setPostData({...postData, image: {...postData.image, data: parseBase64 }});
					setPreview(result);
				};
			};

			fileReader.readAsDataURL(file);
		};

		return () => {
			isCancel = true;
			if (fileReader && fileReader.readyState === 1) fileReader.abort();
		};
	}, [ file ]);

	return (
		<div className='createPost__container'>
			<form onSubmit = { handleSubmit } ref = { formRef }>

				<div className="createPost__image">
					{
						postData.image.data ?
							<div className="createPost__image--container">
								<div className='image__change'>
									<FontAwesomeIcon icon = { icon({ name: "rotate", style: "solid" }) } />
									<span>Cambiar imagen</span>
								</div>
								<img src={preview} alt="preview" />
							</div>
						:
							<div className='createPost__image--placeholder'>
								<FontAwesomeIcon icon = { icon({ name: "file-arrow-up", style: "solid" }) } />
								<span>Subir imagen</span>
							</div>
					}
					<input type="file" onChange={imageHandler} title='' name="file" id="file" accept='.jpg, .jpeg, .png' multiple={false} required />
				</div>
	
				<div className="createPost__content">

					<div className='createPost__content--content'>
						<div className="input__field title">
							<div className='input__info'
								><label htmlFor="title">Título</label>
								<span className={`input__info--validity ${50 - postData.title.length === 0 ? 'invalid' : ''}`}>
									{ 50 - postData.title.length }/50
								</span>
							</div>
							<input type="text" placeholder='Escribe un título' value={postData.title} onChange={onChangeInput} name="title" id="title" maxLength={50} required />
						</div>
	
						<div className="input__field description">
							<div className="input__info">
								<label htmlFor="description">Descripción</label>
								<span className={`input__info--validity ${160 - postData.description.length === 0 ? 'invalid' : ''}`}>
									{ 160 - postData.description.length }/160
								</span>
							</div>
							<input type="text" placeholder='Escribe una descripción' value={postData.description} onChange={onChangeInput} name="description" id="description" maxLength={160} required />
						</div>
	
						<div className={`input__field category${openCategory ? ' expanded' : ''}`}>
							<div className="input__info">
								<label htmlFor="category">Categoría</label>
							</div>
							<span className='selected' title='Elije una categoría' onClick={() => setOpenCategory(!openCategory)}>{postData.category}</span>
							<div className="list">
								{
									categoryList.map(category => <span key={category} onClick={categoryHandler}>{category}</span>)
								}
							</div>
						</div>
	
						<div className="input__field content">
							<div className="input__info">
								<label htmlFor="content">Contenido</label>
							</div>
							<div className='text-editor'>
								<CustomToolbar />
								<ReactQuill placeholder='Escribe algo' value={postData.content} onChange={onChangeQuill} modules = { modules } formats={ formats }/>
							</div>
						</div>
					</div>

					<button type='submit' className={loading || !formValidity() ? 'disabled' : ''}>
						<span>
							{ loading ? <Ring size={18} lineWeight={5} speed={2} color="var(--white)" /> : null }
							{ loading ? 'Publicando' : 'Publicar' }
						</span>
					</button>
				</div>

			</form>
		</div>
	);
};

export default CreatePost;