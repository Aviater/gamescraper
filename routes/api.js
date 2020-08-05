const router = require('express').Router();
const Game = require('../models/games.model');
const moment = require('moment');
const { Logger } = require('../utils/logger');

// Last scanned
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

// Game information
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