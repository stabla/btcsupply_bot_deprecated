## /!\
## COINMARKETCAP API CHANGED THEREFORE THIS IS FULLY DEPRECATED
## TO SEE WORKING VERSION, SEE BOT.JS
## /!\

# bot.py - run with python bot.py
'''
    IMPORT WHAT WE NEED
'''
import requests ## to make a request through api
from threading import Timer ## for set_interval function
import tweepy ## twitter api for python
from twitter_access import * ## get identification for twitter

'''
    Initialize values
'''
global lastSupply
lastSupply = 0

'''
    timeOUt and Delay
'''

def set_interval(func, sec):
    def func_wrapper():
        set_interval(func, sec)
        func()
    t = threading.Timer(sec, func_wrapper)
    t.start()
    return t


'''
    TWITTER API
''' 
# Twitter use OAuth for authentication
auth = tweepy.OAuthHandler(consumer_key, consumer_secret) 

auth.set_access_token(access_token, access_token_secret)

 #Construct the API instance
Twitter = tweepy.API(auth)


'''
    FUNCTION TO POST A TWEET
'''
def tweet(message):
    if Twitter.update_status(message):
        print('correctly tweeted')
    else:
        print('error during tweeting')

'''
    MAKE A REQUEST AT COINMARKETCAP 
'''

host = 'api.coinmarketcap.com'
path = '/v2/ticket/1/'
method = 'GET'


def getInLastTweet():
    a = Twitter.me()
    b = a._json
    c = b['status']['text'][-30:-20]
    c = c.split(',')
    d = ''.join(c)
    return d
    
    
def formatIt(x):
    return '{:0,d}'.format(x)
    
def differentSupply(currentSupply, difference, price, percentage):
    message = formatIt(difference) + " #Bitcoin mined since last tweet.\n \n It represents $" + formatIt((difference * price)) + " (At $" + formatIt(price) + " per $BTC #BTC) \n New supply: " + formatIt(currentSupply) + " \n Progress: " + str(percentage) + " %"
    tweet(message)
    

def makeRequest():
    
    global lastSupply
    lastSupply = int(getInLastTweet())
    
    a = requests.get('https://api.coinmarketcap.com/v2/ticker/1')
    b = a.json()['data']

    newSupply = (b['total_supply'])
    priceUSD = (b['quotes']['USD']['price'])

    ## Create values
    if newSupply >= lastSupply:
        
        newSupply = float(newSupply)
        
        difference = int(float(newSupply - lastSupply))
        
        priceUSD = int(float(priceUSD))
        
        percentage = ((newSupply / 21000000) * 100)
        percentage = round(percentage, 2)
        
        ## int() for correct format when it will pass through formatIt()
        newSupply = int(newSupply)
        
        ## create the message and tweet it
        differentSupply(newSupply, difference, priceUSD, percentage)
    
    Timer(10800.0, makeRequest).start()



## Launch the coinmarketcap request to get BTC supply each 3 hours (10800000 ms or 10800 minutes)
Timer(10800.0, makeRequest).start()
