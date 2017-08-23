var twit = require('twit'),
    config_tw = require('./config');
    
var Twitter = new twit(config_tw);



const getLastSupplyValue = function() {
    fs = require('fs')
    fs.readFile('lastSupply.txt', 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      console.log(data);
    });
}

var lastSupply = getLastSupplyValue();


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
        console.log(tweet); // Tweet body.
        console.log('Tweeted correctly posted.');
    });
}


var differentSupply = function(difference) {
    var messages = " There's new " + difference + " Bitcoin generated since the last tweet. $Bitcoin $BTC #Bitcoin #BTC.";
    
    postTweet(messages);
    
    var fs = require('fs'); 
    var wstream = fs.createWriteStream('lastSupply.txt');
    wstream.write(lastSupply.toString());
    wstream.end();


}


var makeRequest = (function selfInvoking() {

    const https = require('https');
    const options = {
        host : 'api.coinmarketcap.com', 
        port : 443,
        path : '/v1/ticker/bitcoin/', 
        method : 'GET'
    };

    var callback = function(response) {
        var a = new Array(),
            ourReponse;

        // Make a request to get the json 
        response.on('data', function(d) {
            a += d; 
        });

        // When the request is ended, format correctly and show the value.
        response.on('end', function() {
            b = JSON.parse(a);
            newSupply = parseInt(b[0].total_supply); // Returned value from the request

            if (newSupply >== lastSupply) {
                // Call function and tweet about it
                var difference = ( newSupply - lastSupply );
                lastSupply = newSupply;
                
                differentSupply( difference );
                
                console.log('in difference'); /* only for debugging */
            }

            console.log('run correctly' + newSupply); /* only for debugging */
        });

    }

    var req = https.request(options, callback).end();
    return selfInvoking;
    
} ())


// Relaunch the main function each hour
setInterval(makeRequest, 3600000);