const puppeteer = require('puppeteer');
const { Logger } = require('../utils/logger');

let browser;
let page;

// Launch puppeteer
exports.launchPuppeteer = async () => {
    browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    page = await browser.newPage();
}

// Navigate to Url
exports.navigateToUrl = async (url) => {
    try {
        await page.goto(url, {waitUntil: 'networkidle2'})
    } catch(err) {
        Logger.error(`Unable to navigate to ${url}:`, err);
    }
}

// Click the 'Select More' button
exports.selectMoreButton = async (selector) => {
    try {
        await page.click(selector, {waitUntil: 'networkidle2'})
        Logger.silly('Clicked button!');
    } catch(err) {
        Logger.error(`Unable to click the 'Load More' button: `, err);
    }
}

// Select all games
exports.selectAllDiscountGames = async (config) => {
    try {
        await page.waitForNavigation();

        let gamesList = await page.evaluate((config) => {
                let allGames = document.getElementsByClassName(config.allGames);
                let scannedGames = [];
                let discountGames = 0;
                let scanErrors = 0;

                for(let i = 0; i < allGames.length; i++) {
                    try {
                        const title = allGames[i].getElementsByClassName(config.title)[0].textContent;
                        const url = allGames[i].getElementsByTagName('a')[0].href;
                        let standardPrice = 0;
                        let discount = 0;
                        let discountPrice = 0;

                        let price1 = allGames[i].getElementsByClassName(config.priceLeft)[0];
                        let price2 = allGames[i].getElementsByClassName(config.priceCenter)[0];
                        let price3 = allGames[i].getElementsByClassName(config.priceRight)[0];


                        if(price2 !== undefined && price3 !== undefined) {
                            standardPrice = price3.textContent;
                            discount = price1.textContent;
                            discountPrice = price2.textContent;
                            discountGames++;
                        } else if(price2 !== undefined && price3 === undefined) {
                            standardPrice = price3.textContent;
                            discountPrice = price2.textContent;
                            discountGames++;
                        } else {
                            standardPrice = price3.textContent;
                            discountPrice = standardPrice;
                        }

                        scannedGames.push({
                            title: title,
                            url: url,
                            standardPrice: standardPrice === 'Free' ? 0 : standardPrice,
                            discount: discount,
                            discountPrice: discountPrice === 'Free' ? 0 : discountPrice
                        });

                    } catch(err) {
                        console.log('A game couldn\'t be scanned:', err);
                        scanErrors++;
                        continue;
                    }
                    
                }
            return {
                discountGames,
                scannedGames,
                scanErrors,
            };
        }, config);
        Logger.warn(`${gamesList.scanErrors} scan errors.`);

        return {
            discounts: gamesList.discountGames,
            scanResults: gamesList.scannedGames,
            scanErrors: gamesList.scanErrors
        }
    } catch(err) {
        Logger.error('Unable to scan games:', err);
    }
}

exports.closeBrowser = async () => {
    await browser.close();
}