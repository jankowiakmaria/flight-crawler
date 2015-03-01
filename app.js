'use strict';

var config = require("./config"),
    ph = require("./Helpers/phantomHelper"),
    input = require("./Helpers/parametersHelper"),
    moment = require("moment"),
    webPage = require("webpage");

var crawl = function(error, parameters){
  if(error){
    console.log(error);
    phantom.exit();
    return;
  }

  var providerConfig = config[parameters.provider];
  var flightsLeft = 0;

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
  proc(providerConfig, parameters, moment(parameters.startDate), parameters.destination, parameters.origin);
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
          date: currentDay,//$(element).find("caption").text().trim(),
          price: flight.find("div:not(.ng-hide)").text(),
          currency: flight.children("span").text()
        });
      });
      return result;
    }, currentDay);

    flightPage.close();
    callback(null, result);
  };

  flightPage.open(providerConfig.searchPage, function (status) {
    if(status === "success") {
      setTimeout(function(){  //temporary fix
      //todo: wait until loaded!!!!
        ph.set(flightPage, ".stations select[title='Origin']", origin);
        ph.set(flightPage, ".stations select[title='Destination']", destination);
        ph.replace(flightPage, "[name='SearchInput$DeptDate']", currentDay);

        flightPage.evaluate(function() {
          $("#SearchInput_OneWay").click();
          $("#SearchInput_ButtonSubmit").click(); //todo: also wait
        });

        loadTimeout = setTimeout(function(){  //wait until page is loaded
          getResults(flightPage);
        }, maxTimeout);
      }, 1000);
    }
    else{
      flightPage.close();
      callback('Unable to load page!', null);
    }
  });
};

input.getParameters(crawl);
