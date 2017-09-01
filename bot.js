var twit = require('twit'),
    config_tw = require('./config');

var Twitter = new twit(config_tw);
var lastSupply = 0;


// ==========================================================================//
/*
        Post a tweet
*/
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


// ==========================================================================//
/*
        Get the most recent tweet, and extract the lastSupply
            (because Heroku have a cycling of 24hours,
                it means it restart the app each times,
                then, incrementing a variable is useless)
*/
var getInlastTweet = function () {
    var params = {
        count: 1
    }

    Twitter.get('statuses/user_timeline', params, function (error, data, responses) {
        if (error) {
            console.log('Erreur');
        }
        var a, b, c;
        // get the text property from the json
        a = data[0].text;
        // get the 10 last string from the text
        b = a.substr(a.length - 10);
        // delete the ',' and return just the entire number, in int
        c = parseInt(b.split(',').join(''));
        console.log('ici on a la valeur : ' + c);

        lastSupply = c;

    });
};




// ==========================================================================//
/*
        Function to format numbers
*/
var format = function (x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
};

/*
        This function is setting message and ordering to tweet it
*/
var differentSupply = function (currentSupply, difference, price) {
        var messages = " There's new " + format(difference) + " Bitcoin generated.\n \n It represents $" + format((difference * price)) + " (At $" + format(price) + " per $BTC #Bitcoin #BTC) \n New Supply : " + format(currentSupply) + "";

        postTweet(messages);
    }
    // ==========================================================================//





// ==========================================================================//
/*
        Coinmarketcap request (to get BTC supply)
*/
var makeRequest = function () {

    getInlastTweet()
    const https = require('https');
    const options = {
        host: 'api.coinmarketcap.com',
        port: 443,
        path: '/v1/ticker/bitcoin/',
        method: 'GET'
    };

    var callback = function (response) {
        var a = new Array();


        // Make a request to get the json
        response.on('data', function (d) {
            a += d;
        });

        // When the request is ended, format correctly and show the value.
        response.on('end', function () {
            b = JSON.parse(a);

            var newSupply = parseInt(b[0].total_supply); // Returned value from the request
            var priceUSD = parseInt(b[0].price_usd);

            if (lastSupply == 0) {
                setTimeout(function () {

                    if (newSupply >= lastSupply) {
                        console.log('NewSupply: ' + newSupply);
                        console.log('lastSupply: ' + lastSupply);
                        console.log('difference: ' + (newSupply - lastSupply));

                        // Call function and tweet about it
                        var difference;

                        difference = (newSupply - lastSupply);
                        lastSupply = 0; // initialize value for next tweet

                        differentSupply(newSupply, difference, priceUSD);
                    }

                }, 1500); 
            }
            
            
        });
    }

    var req = https.request(options, callback).end();
};

// Launch the Coinmarketcap request to get BTC supply each 6 hours (21600000 ms)
setInterval(makeRequest, 3600000);
