// Fetch api data (game information)
fetch(`/api${window.location.pathname}`)
    .then(res => {
        res.json()
            .then((payload) => {
                console.log('Data:', payload);
                renderData(payload.data);
            });
    })
    .catch(err => {
        console.log(`Unable to fetch api data: ${err}`);
    });

renderData = (data) => {
    document.querySelector('.game-title').innerHTML = data.title;
    document.querySelector('.game-url').href = data.url;
    document.querySelector('.standard-price').innerHTML = data.standardPrice + 'DKK';
    document.querySelector('.discount').innerHTML = data.discount;
    document.querySelector('.discount-price').innerHTML = data.discountPrice + 'DKK';

    let xAxis = [];
    let yAxis = [];
    for(let i = 0; i < data.historicalPrices.length; i++) {
        xAxis.push(data.historicalPrices[i].date);
        yAxis.push(data.historicalPrices[i].discountPrice);
    }

    var options = {
        chart: {
            type: 'line'
        },
        series: [{
            name: 'Price',
            data: yAxis
        }],
        xaxis: {
            categories: xAxis
        }
    }
        
        var chart = new ApexCharts(document.querySelector("#chart"), options);
        
        chart.render();

}

