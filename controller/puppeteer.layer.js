const puppeteer = require('puppeteer');
const { Logger } = require('../utils/logger');

let browser;
let page;

// Launch puppeteer
exports.launchPuppeteer = async () => {
    browser = await puppeteer.launch({headless: false});
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
exports.selectMoreButton = async () => {
    try {
        await page.click('#browse-pagination', {waitUntil: 'networkidle2'})
        console.log('clicked!');
    } catch(err) {
        Logger.error(`Unable to click the 'Load More' button: `, err);
    }
}

// Select all games
exports.selectAllDiscountGames = async () => {
    try {
        await page.waitForNavigation();

        let gamesList = await page.evaluate(() => {
                console.log('evaluating');
                let allGames = document.getElementsByClassName('BrowseGrid-card_9f6a50fb');
                
                console.log('All games:', allGames);
                let scannedGames = [];
                let scanErrors = 0;
                for(let i = 0; i < allGames.length; i++) {
                    try {
                        const image = allGames[i].getElementsByTagName('img')[0].src;
                        const title = allGames[i].getElementsByClassName('OfferTitleInfo-title_abc02a91')[0].textContent;
                        const url = allGames[i].getElementsByTagName('a')[0].href;
                        const standardPrice = allGames[i].getElementsByClassName('Price-original_a6834d25')[0].textContent;
                        let discount = 0;
                        let findDiscountPrice = 0;
                        try {
                            // Check if discounted
                            if(allGames[i].getElementsByClassName('PurchaseTag-tag_452447bf')[0] !== null) {
                                discount = allGames[i].getElementsByClassName('PurchaseTag-tag_452447bf')[0].textContent;
                            }

                            standardPrice = allGames[i].getElementsByClassName('Price-discount_01260a89')[0].textContent;
                            findDiscountPrice = allGames[i].getElementsByClassName('Price-original_a6834d25')[0].textContent;
                            
                        } catch(err) {
                            findDiscountPrice = standardPrice;
                        } finally {
                            console.log('Title:', title);
                            console.log('Image', image);
                            console.log('Url:', url);
                            console.log('Standard Price:', standardPrice);
                            console.log('Discount:', discount);
                            console.log('Discount Price:', findDiscountPrice);
                            
                            scannedGames.push({
                                image: image,
                                title: title,
                                url: url,
                                standardPrice: standardPrice === 'Free' ? 0 : standardPrice,
                                discount: discount,
                                discountPrice: findDiscountPrice === 'Free' ? 0 : findDiscountPrice
                            });
                        }

                    } catch(err) {
                        console.log('A game couldn\'t be scanned:', err);
                        scanErrors++;
                        continue;
                    }
                    
                }
                console.log('Errors:', scanErrors);
                console.log('GAMES:', scannedGames);
            return {
                scannedGames: scannedGames,
                scanErrors: scanErrors
            };
        });

        Logger.info(`${gamesList.scannedGames[1]} games scanned.`);
        Logger.warn(`${gamesList.scanErrors} scan errors.`);

        return gamesList.scannedGames;
    } catch(err) {
        Logger.error('Unable to scan games:', err);
    }

    
}