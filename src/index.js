const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const videoRoutes = require('./routes/videoRoutes');
const listRoutes = require('./routes/listRoutes');
// const emailMsgRoutes = require('./routes/emailMsgRoutes');
// const categoryRoutes = require('./routes/categoryRoutes');
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URL, {
	// useCreateIndex: true,
	// useFindAndModify: true,
	useUnifiedTopology: true,
	useNewUrlParser: true,
});

mongoose.connection.on('connected', () => {
	console.log('Connected to mongo instance.');
});
mongoose.connection.on('error', (err) => {
	console.error('Error connecting to mongo.', err);
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/lists', listRoutes);
// app.use(emailMsgRoutes);
// app.use(categoryRoutes);

app.listen(process.env.PORT || 3005, () => {
	console.log('Listening on port 3005');
});
