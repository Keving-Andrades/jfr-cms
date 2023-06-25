import React, { useContext, useEffect } from 'react';
import { createBrowserRouter, Outlet, RouterProvider, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DataProvider, GlobalState } from './GlobalState';
import Header from './components/header/Header';
import Home from './components/mainpages/homepage/Home';
import News from './components/mainpages/news/News';
import CreatePost from './components/mainpages/create_post/CreatePost';
import Pics from './components/mainpages/pics/Pics';
import Collaborators from './components/mainpages/collaborators/Collaborators';
import Login from './components/mainpages/auth/Login';
import Register from './components/mainpages/auth/Register';
import Protected from './components/mainpages/utils/protected_routes/Protected';
import NotFound from './components/mainpages/utils/not_found/NotFound';
import PostDetails from './components/mainpages/postDetails/PostDetails';
import EditPost from './components/mainpages/edit_post/EditPost';

const ScrollToTop = ({ children }) => {
	const location = useLocation();
	
	useEffect(() => {
		window.scrollTo({
			top: 0,
			behavior: "instant"
		});
	}, [location]);

	return <>
		{ children }
	</>;
};

const CustomOutlet = () => {
	const state = useContext(GlobalState);
	const { confirmModal } = state;
	const [ modal, setModal, ConfirmModal ] = confirmModal;

	return (
		<>
			{
				modal ?
					<ConfirmModal modalTools = { modal } />
				:
					null
			}
			<Outlet />
		</>
	);
};

const AppLayout = () => {
	const location = useLocation();
	const { pathname } = location;
	let page = pathname === "/" ? "home" : pathname.replace("/", "");
	if (pathname.includes("news/")) page = "postDetails";
	if (page === 'editPost') page = 'createPost';

	return (
		<DataProvider>
			<ScrollToTop>
				<Header />
				<ToastContainer
					position="bottom-right"
					autoClose={5000}
					limit={3}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick={false}
					rtl={false}
					pauseOnFocusLoss
					draggable={false}
					pauseOnHover
					theme="colored"
				/>
				<main className={page}>
					<CustomOutlet key={pathname} />
				</main>
			</ScrollToTop>
		</DataProvider>
	);
};

const router = createBrowserRouter([
	{
		element: (<AppLayout />),
		children: [
			{
				path: '/',
				element: <Protected to="/news" auth={false} admin={false}> <Home /> </Protected>
			},
			{
				path: '/login',
				element: <Protected to="/news" auth={false} admin={false}> <Login /> </Protected>
			},
			{
				path: '/register',
				element: <Protected to="/news" auth={false} admin={false}> <Register /> </Protected>
			},
			{
				path: '/news',
				element: <Protected to="/login" auth={true} admin={false}> <News /> </Protected>
			},
			{
				path: '/news/:id',
				element: <Protected to="/login" auth={true} admin={false}> <PostDetails /> </Protected>
			},
			{
				path: '/createPost',
				element: <Protected to="/login" auth={true} admin={false}> <CreatePost /> </Protected>
			},
			{
				path: '/editPost',
				element: <Protected to="/login" auth={true} admin={false}> <EditPost /> </Protected>
			},
			{
				path: '/pics',
				element: <Protected to="/login" auth={true} admin={false}> <Pics /> </Protected>
			},
			{
				path: '/collaborators',
				element: <Protected to="/login" auth={true} admin={true}> <Collaborators /> </Protected>
			},
			{
				path: '*',
				element: <NotFound />
			}
		]
	}
]);

function App() {
	return <RouterProvider router={router} />;
};

export default App;