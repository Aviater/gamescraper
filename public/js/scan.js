// Fetch api data (last scan)
fetch('/api')
    .then(res => {
        res.json()
            .then((data) => {
                document.getElementById('last-scanned').innerHTML = data.updatedAt;
            });
    })
    .catch(err => {
        console.log(`Unable to fetch api data: ${err}`);
    });

// Get elements
element = (element) => {
    console.log('Found it!');
    return document.getElementsByClassName(element);
}

// Change text for certain discounts
handleDiscountText = (res) => {
    let standardPrice;
    let discount;
    let discountPrice;

    if(res.standardPrice === 0) {
        standardPrice = 'Free'
    } else {
        standardPrice = `${res.standardPrice}€`;
    }

    if(res.discountPrice === 0) {
        discountPrice = 'Free'
    } else {
        discountPrice = `${res.discountPrice}€`;
    }

    if(res.discountPrice == 0 && res.standardPrice !== 0) {
        discount = '-100%'
    } else {
        discount = `${res.discount}`
    }

    return {
        standardPrice,
        discount,
        discountPrice
    };
}

// Style discounts in colors
handleStyles = (res) => {
    if(res.standardPrice !== res.discountPrice) {
        return 'class="discount-style"';
    }
}

// Sort list
sortList = (res) => {
    let sortedList = [];
    res.forEach((item) => {
        if(item.standardPrice !== item.discountPrice) {
            sortedList.unshift(item);
        } else {
            sortedList.push(item);
        }
    });

    return sortedList
}

// Connect to socket.io
let socket = io.connect(window.location.href);

if (socket !== 'undefined') {
    console.log('Connected to socket...');

    try {
        performScan = () => {
            socket.emit('scan');
            $('.scan-loader').css('display', 'block');
        }
    } catch(err) {
        console.log('Unable to send socket request:', res);
    }


    try {
        socket.on('game-data', (res) => {
            console.log('Game data response:', res);
            $('.scan-loader').css('display', 'none');
            let gamesList = sortList(res);
            let tableBody = [];
            for(let i = 0; i < gamesList.length; i++) {
                tableBody.push(`<tr> <td>${gamesList[i].title}</td> <td>${handleDiscountText(gamesList[i]).standardPrice}</td> <td ${handleStyles(gamesList[i])}>${handleDiscountText(gamesList[i]).discount}</td> <td ${handleStyles(gamesList[i])}>${handleDiscountText(gamesList[i]).discountPrice}</td> <td><a href=${gamesList[i].url} target="_blank" class="btn btn-outline-info url">Visit</a></td> </tr>`);
            }

            let htmlMarkup =    `<thead>
                                    <th>Name</th>
                                    <th>Price Before</th>
                                    <th>Discount</th>
                                    <th>Price After</th>
                                    <th></th>
                                </thead>
                                <tbody class="found-games">
                                ${tableBody}
                                </tbody>`
                                
            $('.bm-games-list').empty().append(htmlMarkup);
            
        });
    } catch(err) {
        $('.scan-loader').css('display', 'none');
        console.log('Unable to receive game-data response:', err);
    }

    try {
        socket.on('scan-results', (res) => {
            console.log('Scan results response:', res);
            let htmlMarkup = `<li>Discounts found: <span>${res.discounts}</span></li> <li>Games scanned: <span>${res.gamesScanned}</span></li> <li>Scan duration: <span>${res.duration[0]}s ${res.duration[1] / 1000000}ms</span></li>`
            $('.scan-results').empty().append(htmlMarkup);
            socket.emit('fetch-list');
        })
        
    } catch(err) {
        console.log('Unable to receive scan-results response:', err);
    }

} else {
    $('.scan-loader').css('display', 'none');
    console.log('Socket connection problem');
}