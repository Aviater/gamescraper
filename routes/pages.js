const router = require('express').Router();
const fs = require("fs");
const client = require('socket.io').listen(4000).sockets;
const Game = require('../models/games.model');
const generalUtils = require('../utils/general');
const { Logger } = require('../utils/logger');

const header = fs.readFileSync("./public/html/header.html", "utf8");
const footer = fs.readFileSync("./public/html/footer.html", "utf8");

router.get('/', (req, res) => {
    // Connect to socket.io
    client.on('connection', function(socket) {
        Game.find()
            .then(res => {
                
                // Logger.info('Response:', res);

                // Emit message
                socket.emit('response', res);
            })
            .catch(err => {
                Logger.error('Could\'t fetch database information:', err);
            });
        });

    const index = fs.readFileSync("./public/html/index.html", "utf8");
    return res.send(header + index + footer);
});

module.exports = router;