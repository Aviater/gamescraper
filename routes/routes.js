const router = require('express').Router();
const fs = require('fs');
const Game = require('../models/games.model');
const moment = require('moment');
const { Logger } = require('../utils/logger');

const header = fs.readFileSync('./public/html/header.html', 'utf8');
const footer = fs.readFileSync('./public/html/footer.html', 'utf8');

router.get('/', (req, res) => {
    const index = fs.readFileSync('./public/html/index.html', 'utf8');
    return res.send(header + index + footer);
});

router.get('/api', (req, res) => {
    Game.find()
        .then((game) => {
            const updatedAt = moment(game[0].updatedAt).format('DD/MM/YYYY HH:mm:ss');
            return res.json({updatedAt});
        })
        .catch(() => {
            return res.json({updatedAt: 'Not scanned yet'});
        })
});

// let gameId;
router.get('/game/:id', (req, res) => {
    const gamePage = fs.readFileSync('./public/html/gamePage.html');
    return res.send(header + gamePage + footer);
});

router.get(`/api/game/:id`, async (req, res) => {
    const gameInfo = Game.findById(req.params.id)
        .then(res => {
            Logger.verbose('Requested game:', res._doc);
            return res;
        })
        .catch(err => {
            Logger.error(`Couldn't find ${req.params.id}: ${err}`)
        });
    return res.json({data: await gameInfo});
});

module.exports = router;