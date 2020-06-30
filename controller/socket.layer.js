const Game = require('../models/games.model');
const puppeteer = require('./puppeteer.layer');
const moment = require('moment');
const { Logger } = require('../utils/logger');
const generalUtils = require('../utils/general');

sendScanResults = (discounts, scanResults, duration, scanErrors) => {
    // Send scan data
    const results = {
        discounts,
        gamesScanned: scanResults.length,
        duration,
        scanErrors
    }
    console.log('SCAN FINISHED');
    console.log(results);
    return results;
}

exports.fetchGamesList = async () => {
    let games = await Game.find()
        .then(res => {
            return res
        })
        .catch(err => {
            Logger.error('Could\'t fetch database information:', err);
        });
    return games;
}

exports.performScan = async () => {
    await puppeteer.launchPuppeteer();
    await puppeteer.navigateToUrl('https://www.epicgames.com/store/en-US/browse')
    await puppeteer.selectMoreButton();
    
    const {discounts, scanResults, scanDuration, scanErrors} = await puppeteer.selectAllDiscountGames();
    
    let scan;
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

        scan = await Game.findOneAndUpdate({'title': scanResults[i].title}, game, {useFindAndModify: false})
            .then(res => {
                Logger.silly(`New game updated: ${res.title}`);
            })
            .then(() => {
                if(i == (scanResults.length - 1)) {
                    Logger.info(`\u2714 ${scanResults.length} games were updated`);
                    return sendScanResults(discounts, scanResults, scanDuration, scanErrors);
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
                            Logger.info(`\u2714 ${scanResults.length} games were added`);
                            return sendScanResults(discounts, scanResults, scanDuration, scanErrors);
                        }
                    })
                    .catch((err) => Logger.error(`Unable to add game "${newGame.title}": ${err}`));
            })
        }
        return scan;
}