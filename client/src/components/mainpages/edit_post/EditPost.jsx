import React, { useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { GlobalState } from '../../../GlobalState';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import CustomToolbar, { modules, formats } from '../utils/custom_toolbar/CustomToolbar';
import { toast } from 'react-toastify';
import { Ring } from '@uiball/loaders';

const EditPost = () => {
	const location = useLocation();
	const params = useParams();
	const navigate = useNavigate();
	const [ localState, setLocalState ] = useState(location.state || {});
	const { post } = localState;
	const state = useContext(GlobalState);
	const { newsAPI, picsAPI } = state;
	const { news: newsTools, updateNews } = newsAPI;
	const { pics: picsTools } = picsAPI;
	const [ news, setNews, getNews ] = newsTools;
	const [ pics, setPics, getPics ] = picsTools;
	const [ loading, setLoading ] = useState(false);
	
	if (!Object.keys(localState).length) return navigate('/news');
	
    const [ preview, setPreview ] = useState(post.image.url);
	const [file, setFile] = useState(null);
	const [ openCategory, setOpenCategory ] = useState(false);

	const [ postData, setPostData ] = useState({
		_id: post._id,
		title: post.title,
		description: post.description,
		category: post.category,
		content: post.body,
		image: {
			data: post.image.url,
			type: ''
		}
	});
	const formRef = useRef(null);

	const bodyEmpty = value => value.replace(/<(.|\n)*?>/g, '').trim().length === 0 && !value.includes("<img");

	const formValidity = () => {
		const updateData = {
			...postData
		};

		const { title, description, category, content: updateDataContent, image } = updateData;

		if (title === post.title) delete updateData["title"];
		if (description === post.description) delete updateData["description"];
		if (category === post.category) delete updateData["category"];
		if (updateDataContent === post.body) delete updateData["content"];
		if (image.data === post.image.url) delete updateData["image"];

		return formRef.current && formRef.current.checkValidity() && postData.content && !bodyEmpty(postData.content) && Object.keys(updateData).length >= 2 && updateData.hasOwnProperty("_id");
	};
	
	const handleSubmit = async e => {
		e.preventDefault();

		if (loading) return e.preventDefault();

		const updateData = {
			...postData
		};

		const { title, description, category, content: updateDataContent, image } = updateData;

		if (title === post.title) delete updateData["title"];
		if (description === post.description) delete updateData["description"];
		if (category === post.category) delete updateData["category"];
		if (updateDataContent === post.body) delete updateData["content"];
		if (image.data === post.image.url) delete updateData["image"];

		if (Object.keys(updateData).length < 2 && updateData.hasOwnProperty("_id")) return toast.error("No hay nuevos campos para actualizar");

		if (formRef.current && !formRef.current.checkValidity()) return e.preventDefault();

		if (postData.content && bodyEmpty(postData.content)) return toast.error("El contenido de la publicación es obligatorio.");

		setLoading(true);

		const { success, content } = await updateNews(updateData);

		if (!success) {
			setLoading(false);
			return toast.error(content);
		};

		if (success) {
			getNews();
			getPics();
			navigate('/news');
			setLoading(false);
			return toast.success("¡Publicación editada exitosamente!");
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
		const category = e.target.innerText;
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
			<form onSubmit = { handleSubmit } ref = { formRef } >

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
					<input type="file" onChange={imageHandler} title='' name="file" id="file" accept='.jpg, .jpeg, .png' multiple={false} />
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
								<ReactQuill placeholder='Escribe algo' name='content' id='content' value={postData.content} onChange={onChangeQuill} modules = { modules } formats={ formats }/>
							</div>
						</div>
					</div>

					<button type='submit' className={loading || !formValidity() ? 'disabled' : ''}>
						<span>
							{ loading ? <Ring size={18} lineWeight={5} speed={2} color="var(--white)" /> : null }
							Actualizar
						</span>
					</button>
				</div>

			</form>
		</div>
	);
};

export default EditPost;