import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalState } from '../../../GlobalState';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';

const News = () => {
	const navigate = useNavigate();
	const state = useContext(GlobalState);
	const { newsAPI, picsAPI, userAPI, confirmModal } = state;
	const { isAdmin: adminTools } = userAPI;
	const [ isAdmin ] = adminTools;
	const { news: newsTools, addFeatured, delNews } = newsAPI;
	const { pics: picsTools } = picsAPI;
	const [ news, setNews, getNews ] = newsTools;
	const [ pics, setPics, getPics ] = picsTools;
	const [ modal, setModal ] = confirmModal;

	const forceRefreshContent = () => {
		getNews();
		getPics();
	};

	const deleteNews = id => {
		setModal({
			data: {
				title: "¿Estás seguro?",
				description: <span>Borrar esta publicación, eliminará la foto que le corresponde.</span>,
				next: () => delNews(id)
			},
			setConfirmModal: setModal,
			forceRefreshContent,
			toast: '¡Publicación borrada exitosamente!'
		});
	};

	return (
		<div className='news__container'>
			<div className="createPost" onClick={() => navigate("/createPost")}>Crear una publicación</div>
			{
				news.map(news =>
					<div 
						key={news._id} className='news__container--card'
						onClick={() => navigate(`/news/${news._id}`, {
							state: {
								post: news
							}
						})}
					>
						<div className="card__image">
							<img src={news.image.url} alt={news.title} />
						</div>
						<div className='card__content'>
							<div className="title">{news.title}</div>
							<div className="buttons" onClick={e => e.stopPropagation()}>
								<div title={news.featured ? 'Publicación destacada': 'Destacar publicación'} className={`highlight${isAdmin ? ' pointer': ''}${news.featured ? ' featured': ''}`} onClick={e => {
									if (!isAdmin) return e.preventDefault();
									if (news.featured) return e.preventDefault();
									addFeatured(news._id);
								}}>
									{
										news.featured ?
											<FontAwesomeIcon icon = { icon({ name: 'star', style: 'solid' }) }/>
										:
											<FontAwesomeIcon icon = { icon({ name: 'star', style: 'regular' }) }/>
									}
								</div>
								<div title='Eliminar publicación' className="delete pointer" onClick={() => deleteNews(news._id)}>
									<FontAwesomeIcon icon = { icon({ name: 'circle-minus', style: 'solid' }) }/>
								</div>
							</div>
						</div>
					</div>
				)
			}
		</div>
	);
};

export default News;