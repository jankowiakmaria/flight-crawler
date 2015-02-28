'use strict';

if (!global.__base) {
  global.__base = __dirname;
}

var Crawler = require("simplecrawler"),
    config = require(__base + "/config"),
    cheerio = require("cheerio");

var flightCrawler = new Crawler(config.ryanair.page);    //todo: parameter
flightCrawler.initialPath = config.ryanair.path;
flightCrawler.initialProtocol = config.ryanair.protocol;    //todo: -||-
flightCrawler.discoverResources = false;

flightCrawler.on("fetchcomplete", function(queueItem, responseBuffer, response){
  console.log("queueItem.url", queueItem.url);
  console.log("responseBuffer", responseBuffer.toString());
});

flightCrawler.on("fetcherror", function(queueItem, response){
  console.log(queueItem.url);
  console.log("error", response);
});

flightCrawler.start();
