const puppeteer = require('puppeteer');
const { Logger } = require('../utils/logger');

let browser;
let page;

// Launch puppeteer
exports.launchPuppeteer = async () => {
    browser = await puppeteer.launch({headless: false}, {args: ['--no-sandbox', '--disable-setuid-sandbox']});
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
        Logger.silly('Clicked button!');
    } catch(err) {
        Logger.error(`Unable to click the 'Load More' button: `, err);
    }
}

// Select all games
exports.selectAllDiscountGames = async () => {
    try {
        await page.waitForNavigation();

        let gamesList = await page.evaluate(() => {
                let allGames = document.getElementsByClassName('css-1adx3p4-BrowseGrid-styles__card');
                let scannedGames = [];
                let discountGames = 0;
                let scanErrors = 0;
                for(let i = 0; i < allGames.length; i++) {
                    try {
                        const image = allGames[i].getElementsByTagName('img')[0].src;
                        const title = allGames[i].getElementsByClassName('css-tybchz-OfferTitleInfo__title')[0].textContent;
                        const url = allGames[i].getElementsByTagName('a')[0].href;
                        // let standardPrice = allGames[i].getElementsByClassName('css-1cxwn9g')[0].textContent;
                        let standardPrice = 0;
                        let discount = 0;
                        let findDiscountPrice = 0;
                        let discountPrice = 0;
                        // try {
                            
                        //     // Check if discounted
                        //     if(typeof allGames[i].getElementsByClassName('css-hxebnf-PurchaseTag__tag')[0] !== 'undefined') {
                        //         discount = allGames[i].getElementsByClassName('css-hxebnf-PurchaseTag__tag')[0].textContent;
                        //     }
                            
                        //     standardPrice = allGames[i].getElementsByClassName('css-1e017zm-Price__discount')[0].textContent;
                            
                        //     findDiscountPrice = allGames[i].getElementsByClassName('Price-discount_01260a89')[0].textContent;
                        //     discountGames++;
                        //     console.log(discountGames);
                            
                        // } catch(err) {
                        //     findDiscountPrice = standardPrice;
                        // } finally {                        
                        //     scannedGames.push({
                        //         image: image,
                        //         title: title,
                        //         url: url,
                        //         standardPrice: standardPrice === 'Free' ? 0 : standardPrice,
                        //         discount: discount,
                        //         discountPrice: findDiscountPrice === 'Free' ? 0 : findDiscountPrice
                        //     });
                        // }
                        let price1 = allGames[i].getElementsByClassName('css-1cxwn9g')[0];
                        let price2 = allGames[i].getElementsByClassName('css-1e017zm-Price__discount')[0];
                        let price3 = allGames[i].getElementsByClassName('css-hxebnf-PurchaseTag__tag')[0];

                        if(price2 !== undefined && price3 !== undefined) {
                            standardPrice = price2.textContent;
                            discount = price3.textContent;
                            discountPrice = price1.textContent;
                            discountGames++;
                        } else if(price2 !== undefined && price3 === undefined) {
                            standardPrice = price2.textContent;
                            discountPrice = price1.textContent;
                            discountGames++; 
                        } else {
                            standardPrice = price1.textContent;
                            discountPrice = standardPrice;
                        }

                        scannedGames.push({
                            image: image,
                            title: title,
                            url: url,
                            standardPrice: standardPrice === 'Free' ? 0 : standardPrice,
                            discount: discount,
                            discountPrice: discountPrice === 'Free' ? 0 : discountPrice
                        });
                        console.log(scannedGames);

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
        });
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