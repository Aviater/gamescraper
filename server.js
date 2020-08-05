const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Logger } = require('./utils/logger');
const handler = require('./utils/loggerHandler');
const mongoose = require('mongoose');
const socketHandler = require('./controller/socket.layer');

require('dotenv').config();
const app = express();

// Set middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
const uri = process.env.MONGODB_URI;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }, (err, db) => {
    if(err) {
        Logger.error('Could\'t connect to database:', err);
    }
    Logger.info('MongoDB connection successful...');
});

// Custom route logging handler
app.use(handler);

// Set path
app.use(express.static(__dirname + '/public'));

// Use routes
const userRoutes = require('./routes/main');
const apiRoutes = require('./routes/api');
app.use(userRoutes);
app.use(apiRoutes);

// Start server
const port = process.env.PORT || 5000;
const server = app.listen(port, (err) => {
    if(err) {
        Logger.error(`Couldn't start server on port ${port}:`, err);
        return err;
    }
    Logger.info(`Server started in port ${port}...`);
});

// Socket communication
socketHandler.handleSocket(server);