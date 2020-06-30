const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Logger } = require('./utils/logger');
const handler = require('./utils/loggerHandler');
const client = require('socket.io').listen(4000).sockets;
const mongoose = require('mongoose');
const Game = require('./models/games.model');

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

// Custom route logging handler (Must change)
app.use(handler);

// Set path
app.use(express.static(__dirname + '/public'));

// Use routes
const routes = require('./routes/routes');
app.use(routes);

// Test
const socketHandler = require('./controller/socket.layer');
client.on('connection', (socket) => {
    socketHandler.fetchGamesList(socket);

    socket.on('scan', () => {
        socketHandler.performScan(client, socket).then(() => {
            socketHandler.fetchGamesList(socket);
        });
    });

    socket.on('fetch-list', () => {
        console.log('Fetched List');
        socketHandler.fetchGamesList(socket);
    });

    socket.on('disconnect', () => {
        Logger.error('Socket closed.');
        socket.disconnect();
    });

});

const port = process.env.PORT || 5000;
app.listen(port, (err) => {
    if(err) {
        Logger.error(`Couldn't start server on port ${port}:`, err);
        return err;
    }
    Logger.info(`Server started in port ${port}...`);
});