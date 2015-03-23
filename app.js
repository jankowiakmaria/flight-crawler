'use strict';

var config = require("./config"),
    ph = require("./Helpers/phantomHelper"),
    input = require("./Helpers/parametersHelper"),
    moment = require("moment"),
    webPage = require("webpage");

/*function waitFor(testFx, onReady, flightPage, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false;

        console.log(start, maxtimeOutMillis);

    var interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                console.log("check");
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    console.log(flightPage.content);
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 500); //< repeat check every 250ms
};*/

var crawl = function(error, parameters){
  if(error){
    console.log(error);
    phantom.exit();
    return;
  }

  var providerConfig = config[parameters.provider];
  var flightsLeft = 0;

console.log("start");

  function proc(providerConfig, parameters, currentDay, origin, destination) {
    flightsLeft++;
    processOneDay(providerConfig, parameters, currentDay.format(providerConfig.dateFormat), origin, destination, function(error, data){
      if(error){
        console.log('error', error);
      }
      else{
        console.log(JSON.stringify(data, undefined, 4));
      }
      flightsLeft--;
      currentDay.add(1, "days");
      if(currentDay <= parameters.endDate){
        proc(providerConfig, parameters, currentDay, origin, destination);
      }else{
        if(flightsLeft === 0){
          console.log("end");
          phantom.exit();
        }
      }
    });
  };

  proc(providerConfig, parameters, moment(parameters.startDate), parameters.origin, parameters.destination);
  //proc(providerConfig, parameters, moment(parameters.startDate), parameters.destination, parameters.origin);
};

//for ryanair
var processOneDay = function(providerConfig, parameters, currentDay, origin, destination, callback){
  var flightPage = webPage.create();
  var loadTimeout;
  var maxTimeout = 5000;
  var done = false;

  flightPage.onResourceReceived = function (response) {
    if(flightPage.url === providerConfig.resultPage && !done){
      done = true;
      clearTimeout(loadTimeout);
      getResults(flightPage);
    }
  };

  flightPage.onConsoleMessage = function(msg) {
      console.log('console: ' + msg);
  };

//todo: what if more than one flight in a day
  var getResults = function(flightPage) {
    var result = flightPage.evaluate(function(currentDay){
      var result = [];
      $("article.selectFlights:not(#businessPlusBannerOffer)").each(function(index, element){
        var flight = $(element).find("a.active");
        result.push({
          flight: $(element).children("h1").text(),
          date: currentDay,
          price: flight.find("div:not(.ng-hide)").text(),
          currency: flight.children("span").text()
        });

        console.log($(element).text());
      });
      return result;
    }, currentDay);

    flightPage.close();
    callback(null, result);
  };

  flightPage.open(providerConfig.searchPage, function (status) {
    console.log(providerConfig.searchPage);
    if(status === "success") {
      var selectors = providerConfig.selectors;

      //waitFor(function(){
      //  return flightPage.evaluate(function(selectors){
      //    return document.querySelector(selectors.oneWay) && document.querySelector(selectors.search);
      //  }, selectors);
      //}, function(){
        ph.set(flightPage, selectors.origin, origin);
        ph.set(flightPage, selectors.destination, destination);
        ph.replace(flightPage, selectors.departureDate, currentDay);

        flightPage.evaluate(function(selectors) {
          $(selectors.oneWay).click();
          $(selectors.search).click();
        }, selectors);

        loadTimeout = setTimeout(function(){  //wait until page is loaded
          getResults(flightPage);
        }, maxTimeout);
      //},flightPage, maxTimeout);
    }
    else{
      flightPage.close();
      callback('Unable to load page!', null);
    }
  });
};

input.getParameters(crawl);
