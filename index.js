require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/userRouter');
const newsRouter = require('./routes/newsRouter');
const picsRouter = require('./routes/picsRouter');
const bodyParser = require('body-parser');
const app = express();

// SETTINGS
const { PORT = 8080 } = process.env;

// MIDDLEWARES
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit:50000 }));
app.use(express.json({ limit: '50mb' }));
app.use(morgan('dev'));
app.use(cors());
app.use(cookieParser());
app.use(fileUpload({
	useTempFiles: true
}));

// CONNECT TO MONGODB
const { DATABASE: URI } = process.env;

const connectMongo = async () => {
	try {
		await mongoose.connect(URI);
		console.log('Database connected.');
	} catch (err) {
		console.log(err);
	};
};

connectMongo();

mongoose.connection.on('error', err => {
	console.error(err.message);
});

// ROUTES
app.use('/user', userRouter)
app.use('/api', newsRouter);
app.use('/api', picsRouter);

if (process.env.NODE_ENV === 'production') {
	app.use(express.static("client/dist"));
	app.get("*", (req, res) => {
		res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'))
	});
};

// STARTING SERVER
app.listen(PORT, () => {
	console.log(`Server at port ${PORT}`);
});