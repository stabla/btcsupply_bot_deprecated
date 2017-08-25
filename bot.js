var twit = require('twit'),
    config_tw = require('./config');

var Twitter = new twit(config_tw);
var lastSupply = 0;

// Post a tweet ==================
var postTweet = function (messages) {
    var params = {
        status: messages // Tweet to post
    }

    // Update status: post the tweet
    Twitter.post('statuses/update', params, function (error, tweet, response) {
        if (error) {
            console.log(error);
            console.log('Tweet already posted');
        }

        console.log('Tweeted correctly posted.');
    });
}


var getInlastTweet = (function selfInvoking() {
    var params = {
        count: 1
    }

    Twitter.get('statuses/user_timeline', params, function (error, data, responses) {
        if (error) {
            console.log('bonjour y a error');
        }

        var a = data[0].text;
        var b = a.substr(a.length - 10);

        lastSupply = parseInt(b.split(',').join(''));

    });

    return selfInvoking;
}());


var format = function (x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
};


var differentSupply = function (difference, price) {
    var messages = " There's new " + format(difference) + " Bitcoin generated.\n \n It represents $" + format((difference * price)) + " (At $" + format(price) + " per $BTC #Bitcoin #BTC) \n New Supply : " + format(lastSupply) + "";

    // postTweet(messages);
}


var makeRequest = function selfInvoking() {


    const https = require('https');
    const options = {
        host: 'api.coinmarketcap.com',
        port: 443,
        path: '/v1/ticker/bitcoin/',
        method: 'GET'
    };

    var callback = function (response) {
        var a = new Array(),
            ourReponse;

        getInlastTweet();

        // Make a request to get the json 
        response.on('data', function (d) {
            a += d;
        });

        // When the request is ended, format correctly and show the value.
        response.on('end', function () {
            b = JSON.parse(a);
            newSupply = parseInt(b[0].total_supply); // Returned value from the request
            priceUSD = parseInt(b[0].price_usd);

            if (newSupply >= lastSupply) {
                // Call function and tweet about it
                var difference = (newSupply - lastSupply);

                differentSupply(difference, priceUSD);
            }
        });
    }

    var req = https.request(options, callback).end();
};


// Relaunch the main function each 6 hours (21600000 ms)
setInterval(makeRequest, 21600000);
