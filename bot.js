var twit = require('twit'),
    config_tw = require('./config');
var rp = require('request-promise');

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
            console.log("Tweet correctly.");
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
        console.log("getInLastTweet.");
        var a, b;
        // get the text property from the json
        a = data[0].text;
        // get the 30 last string from the text, to extract last supply
        b = a.substr(a.length - 84, a.length - 125);
        // delete the ',' and return just the entire number, in int
        lastSupply = parseInt(b.split(',').join(''));
        console.log(lastSupply);
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

        //postTweet(messages);
};
// ==========================================================================//

// ==========================================================================//
/*
        Coinmarketcap request (to get BTC supply)
*/
var makeRequest = function () {

        getInlastTweet();
        const https = require('https');
        /* Example in Node.js ES6 using request-promise */
        const requestOptions = {
                method: 'GET',
                uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=1&convert=USD',
                headers: {
                        'X-CMC_PRO_API_KEY': config_tw.token_coinmarketcap_api
                },
                json: true,
                gzip: true
        };
      
        var callCoinmarketcap = function() {
                rp(requestOptions).then(response => {
                        var new_supply = response.data[1].total_supply;
                        var current_price = response.data[1].quote.USD.price;

                        if (lastSupply == 0) {
                                console.log("lastSupply === 0.");
                                setTimeout(function () {

                                if (new_supply >= lastSupply) {
                                        console.log("new_supply >= lastSupply ");
                                        console.log('new_supply: ' + new_supply);
                                        console.log('lastSupply: ' + lastSupply);
                                        console.log('difference: ' + (new_supply - lastSupply));

                                        // Call function and tweet about it
                                        difference = (new_supply - lastSupply);

                                        percentage = ((new_supply/21000000)*100).toFixed(2);

                                        lastSupply = 0; // initialize value for next tweet
                                        differentSupply(new_supply, difference, current_price, percentage);
                                }

                                }, 10000);
                        }
                }).catch((err) => {
                console.log('API call error:', err.message);
                });
        };
    
        callCoinmarketcap();
    };
    
// Launch the Coinmarketcap request to get BTC supply each 12 hours (43200000 ms)
console.log("Runned.");
setInterval(makeRequest, 43200000);
