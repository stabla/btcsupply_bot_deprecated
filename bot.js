var twit = require('twit'),
    config_tw = require('./config_tw_local');
    
var Twitter = new twit(config_tw);



// Post a tweet ==================
var postTweet = function () {
    var params = {
        status: 'messages' // Tweet to post
    }

    // Update status: post the tweet
    Twitter.post('statuses/update', params, function (error, tweet, response) {
        if (error) {
            console.log(error);
        }
        console.log(tweet); // Tweet body.
        console.log('Tweeted correctly posted.');
    });
}

// tweet immediatly when program is running...
//postTweet();

// retweet in every 50 secs
//setInterval(postTweet, 50000);




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

    response.on('data', function(d) {
        a += d; 
    });
    
    response.on('end', function() {
        b = JSON.parse(a);
        return b[0].total_supply;
    });
    
}

var req = https.request(options, callback).end();