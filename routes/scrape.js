const router = require('express').Router();
const fs = require("fs");
const puppeteer = require('../controller/puppeteer.layer');
const moment = require('moment');
const Game = require('../models/games.model');
const generalUtils = require('../utils/general');
const { Logger } = require('../utils/logger');
const mongoose = require('mongoose');

const header = fs.readFileSync("./public/html/header.html", "utf8");
const footer = fs.readFileSync("./public/html/footer.html", "utf8");

router.get('/scan', async (req, res) => {

    await puppeteer.launchPuppeteer();

    await puppeteer.navigateToUrl('https://www.epicgames.com/store/en-US/browse')
    
    await puppeteer.selectMoreButton();
    
    const gamesList = await puppeteer.selectAllDiscountGames();
    
    for(let i = 0; i < gamesList.length; i++) {
        const game = {
            image: gamesList[i].image,
            title: gamesList[i].title,
            url: gamesList[i].url,
            standardPrice: generalUtils.stripSymbol(gamesList[i].standardPrice),
            discount: gamesList[i].discount,
            discountPrice: generalUtils.stripSymbol(gamesList[i].discountPrice),
            historicalPrices: {
                date: moment(new Date()).format('DD/MM/YYYY'),
                discountPrice: generalUtils.stripSymbol(gamesList[i].discountPrice)
            }
        }
        
        Game.findOneAndUpdate({'title': gamesList[i].title}, game)
            .then(() => {
                Logger.silly(`New game updated:`, res.title);
            })
            .catch((err) => {
                Logger.warn(`Game not found: ${err}`)
                const newGame = new Game(game);
                newGame.save()
                    .then(() =>  console.log(`New game added:`, newGame.title))
                    .catch((err) => Logger.error('Unable to add game:', newGame.title));
            })
    }
    Logger.info(`\u2714 ${gamesList.length} games were processed`);
    
    
    const index = fs.readFileSync("./public/html/index.html", "utf8");
    return res.redirect('/');
});

module.exports = router;

// 1. Fix discounts not calculating properly.
// 2. Get documents with discount.
// 3. Render those discounts in a separate list.