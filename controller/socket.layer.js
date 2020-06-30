const Game = require('../models/games.model');
const puppeteer = require('./puppeteer.layer');
const moment = require('moment');
const { Logger } = require('../utils/logger');
const generalUtils = require('../utils/general');

sendScanResults = (socket, discounts, scanResults, scanDuration) => {
    // Send scan data
    const res = {
        discounts: discounts,
        gamesScanned: scanResults.length,
        duration: scanDuration
    }
    
    socket.emit('scan-results', res);
}

exports.fetchGamesList = (socket) => {
    Game.find()
        .then(res => {
            // Emit message
            socket.emit('game-data', res);
        })
        .catch(err => {
            Logger.error('Could\'t fetch database information:', err);
        });
}

exports.performScan = async (client, socket) => {
    await puppeteer.launchPuppeteer();

    await puppeteer.navigateToUrl('https://www.epicgames.com/store/en-US/browse')
    
    await puppeteer.selectMoreButton();
    
    const {discounts, scanResults, scanDuration} = await puppeteer.selectAllDiscountGames();
    
    for(let i = 0; i < scanResults.length; i++) {
        const game = {
            image: scanResults[i].image,
            title: scanResults[i].title,
            url: scanResults[i].url,
            standardPrice: generalUtils.stripSymbol(scanResults[i].standardPrice),
            discount: scanResults[i].discount,
            discountPrice: generalUtils.stripSymbol(scanResults[i].discountPrice),
            historicalPrices: [
                {
                    date: moment(new Date()).format('DD/MM/YYYY'),
                    discountPrice: generalUtils.stripSymbol(scanResults[i].discountPrice)
                }
            ]
        }
        
        Game.findOneAndUpdate({'title': scanResults[i].title}, game, {useFindAndModify: false})
            .then(res => {
                Logger.silly(`New game updated: ${res.title}`);
            })
            .then(() => {
                if(i == (scanResults.length - 1)) {
                    if(i == (scanResults.length - 1)) {
                        sendScanResults(socket, discounts, scanResults, scanDuration);
                    }
                    Logger.info(`\u2714 ${scanResults.length} games were processed`);
                }
            })
            .catch((err) => {
                const newGame = new Game(game);
                newGame.save()
                    .then(() => {
                        Logger.info(`New game added: ${newGame.title}`)
                    })
                    .then(() => {
                        if(i == (scanResults.length - 1)) {
                            Logger.info(`\u2714 ${scanResults.length} games were processed`);
                            sendScanResults(socket, discounts, scanResults, scanDuration)
                        }
                    })
                    .catch((err) => Logger.error(`Unable to add game "${newGame.title}": ${err}`));
            })
        
    }

}