const router = require('express').Router();
const fs = require("fs");
const Game = require('../models/games.model');
const moment = require('moment');

const header = fs.readFileSync("./public/html/header.html", "utf8");
const footer = fs.readFileSync("./public/html/footer.html", "utf8");

router.get('/', (req, res) => {
    const index = fs.readFileSync("./public/html/index.html", "utf8");
    return res.send(header + index + footer);
});

router.get('/api', (req, res) => {
    Game.find()
        .then((game) => {
            const updatedAt = moment(game[0].updatedAt).format('DD/MM/YYYY');
            return res.json({updatedAt});
        })
        .catch(() => {
            return res.json({updatedAt: 'Not scanned yet'});
        })
    
})


module.exports = router;

// 1. Fix discounts not calculating properly. DONE
// 2. Add historical data to each game.
// 3. Get documents with discount. DONE
// 4. Render those discounts in a separate list. DONE
// 5. Do scan statistics. (In memory)