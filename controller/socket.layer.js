const cronJob = require('../utils/scheduler');
const config = require('../config.json');
const socketIO = require('socket.io');
const { Logger } = require('../utils/logger');

exports.handleSocket = (server) => {

    /// Handle socket communication
    const client = socketIO(server);
    const dbLayer = require('./database.layer');
    client.on('connection', (socket) => {
        dbLayer.fetchGamesList()
            .then(res => {
                socket.emit('game-data', res);
            });
        
        socket.on('scan', () => {
            dbLayer.performScan(false)
                .then(res => {
                    socket.emit('scan-results', res);
                })
                .then(() => {
                    dbLayer.fetchGamesList();
                });
        });

        socket.on('fetch-list', () => {
            dbLayer.fetchGamesList()
                .then(res => {
                    socket.emit('game-data', res);
                });
        });

        socket.on('disconnect', () => {
            Logger.error('Socket closed.');
            socket.disconnect();
        });

        socket.on('error', () => {
            Logger.error('Socket closed.');
            socket.disconnect();
        });

        // Cron job
        const autoScan = Number(process.env.SCHEDULED_SCAN_TIME); // minute
        cronJob.scheduleScan(autoScan, dbLayer.performScan, socket);
        
    });
}
