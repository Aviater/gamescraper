const Game = require('../models/games.model');
const puppeteer = require('./puppeteer.layer');
const moment = require('moment');
const { Logger } = require('../utils/logger');
const generalUtils = require('../utils/general');
const config = require('../config.json');

sendScanResults = (discounts, scanResults, duration, scanErrors) => {
    // Send scan data
    const results = {
        discounts,
        gamesScanned: scanResults.length,
        duration,
        scanErrors
    }

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

exports.performScan = async (scheduled) => {
    const scanTimerStart = process.hrtime();
    await puppeteer.launchPuppeteer();
    await puppeteer.navigateToUrl(process.env.EPIC_GAMES_URL);
    await puppeteer.selectMoreButton(process.env.EPIC_GAMES_MORE_BUTTON);
    
    const {discounts, scanResults, scanErrors} = await puppeteer.selectAllDiscountGames();

    let scan;
    for(let i = 0; i < scanResults.length; i++) {
        const game = {
            title: scanResults[i].title,
            url: scanResults[i].url,
            standardPrice: generalUtils.stripSymbol(scanResults[i].standardPrice),
            discount: scanResults[i].discount,
            discountPrice: generalUtils.stripSymbol(scanResults[i].discountPrice),
            historicalPrices: [{
                    date: moment(new Date()).format('DD/MM/YYYY'),
                    discountPrice: generalUtils.stripSymbol(scanResults[i].discountPrice)
                }]
        }

        if(scheduled) {
            update = {
                $set: {title: scanResults[i].title},
                $set: {url: scanResults[i].url},
                $set: {standardPrice: generalUtils.stripSymbol(scanResults[i].standardPrice)},
                $set: {discount: scanResults[i].discount},
                $set: {discountPrice: generalUtils.stripSymbol(scanResults[i].discountPrice)},
                $push: {historicalPrices: 
                    {
                        date: moment(new Date()).format('DD/MM/YYYY'),
                        discountPrice: generalUtils.stripSymbol(scanResults[i].discountPrice)
                    }
                }
            }
        } else {
            update = {
                $set: {title: scanResults[i].title},
                $set: {url: scanResults[i].url},
                $set: {standardPrice: generalUtils.stripSymbol(scanResults[i].standardPrice)},
                $set: {discount: scanResults[i].discount},
                $set: {discountPrice: generalUtils.stripSymbol(scanResults[i].discountPrice)}
            }
        }
        

        scan = await Game.findOneAndUpdate({'title': scanResults[i].title}, update, {useFindAndModify: false})
            .then(res => {
                Logger.info(`Game updated: ${res.title}`);
            })
            .then(() => {
                if(i == (scanResults.length - 1)) {
                    Logger.info(`\u2714 ${scanResults.length} games were updated`);
                    return sendScanResults(discounts, scanResults, process.hrtime(scanTimerStart), scanErrors);
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
                            return sendScanResults(discounts, scanResults, process.hrtime(scanTimerStart), scanErrors);
                        }
                    })
                    .catch((err) => Logger.error(`Unable to add game "${newGame.title}": ${err}`));
            })
        }
        
        await puppeteer.closeBrowser();

        // Returns scan results
        return scan;
}