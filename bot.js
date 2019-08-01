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
        status: messages
    }

    // Update status: post the tweet
    Twitter.post('statuses/update', params, function (error, tweet, response) {
        if (error) {
            console.log(error);
            console.log('Tweet already posted');
        } else {
		console.log('Tweeted correctly posted.');
	}
    });

};


// ==========================================================================//
/*
        Get the most recent tweet, and extract the lastSupply
            (because Heroku have a cycling of 24hours,
                it means it restart the app each times,
                then, incrementing a variable is useless)
*/
var getInlastTweet = function () {
    // get the last tweet (count 1)
    Twitter.get('statuses/user_timeline', 1, function (error, data, responses) {
        if (error) {
            console.log('Erreur');
        }
        var a, b;
        // get the text property from the json
        a = data[0].text;
        // get the 30 last string from the text, to extract last supply
        b = a.substr(a.length - 30);
        // delete the ',' and return just the entire number, in int
        lastSupply = parseInt(b.split(',').join(''));
    });
};




// ==========================================================================//
/*
        Function to format numbers
*/
var format = function (x) {
    parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
};

/*
        This function is setting message and ordering to tweet it
*/
var differentSupply = function (currentSupply, difference, price, percentage) {
        messages = format(difference) + " #Bitcoin mined since last tweet.\n \n It represents $" + format((difference * price)) + " (At $" + format(price) + " per $BTC #BTC) \n New Supply: " + format(currentSupply) + " \n Progress: " + percentage + " %";

        postTweet(messages);
};
 // ==========================================================================//


// ==========================================================================//
/*
        Coinmarketcap request (to get BTC supply)
*/
var makeRequest = function () {

    getInlastTweet();
    const https = require('https');
    const options = {
        host: 'api.coinmarketcap.com',
        port: 443,
        path: '/v2/ticker/1/',
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

            var newSupply = parseInt(b.data.total_supply); // Returned value from the request
            var priceUSD = parseInt(b.data.quotes.USD.price);

            if (lastSupply == 0) {
                setTimeout(function () {

                    if (newSupply >= lastSupply) {
                        console.log('NewSupply: ' + newSupply);
                        console.log('lastSupply: ' + lastSupply);
                        console.log('difference: ' + (newSupply - lastSupply));

                        // Call function and tweet about it
                        difference = (newSupply - lastSupply);

                        percentage = ((newSupply/21000000)*100).toFixed(2);

                        lastSupply = 0; // initialize value for next tweet
                        differentSupply(newSupply, difference, priceUSD, percentage);
                    }

                }, 10000);
            }
        }); // end of response
    };

    var req = https.request(options, callback).end();
};

// Launch the Coinmarketcap request to get BTC supply each 12 hours (43 200 000 ms)
setInterval(makeRequest, 43200000);
