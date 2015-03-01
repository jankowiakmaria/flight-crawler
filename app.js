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
  var currentDay = parameters.startDate;
  var flightPage = webPage.create();

  function proc(providerConfig, parameters, currentDay) {
    processOneDay(flightPage, providerConfig, parameters, currentDay.format(providerConfig.dateFormat), function(error, data){
      if(error){
        console.log("----",'error', error);
      }
      else{
        console.log("----",JSON.stringify(data, undefined, 4));
      }
      currentDay.add(1, "days");
      if(currentDay <= parameters.endDate){
        console.log("----", "next day", currentDay.format(providerConfig.dateFormat))
        setTimeout(function(){
          proc(providerConfig, parameters, currentDay);
        }, 1000);
      }else{
        phantom.exit();
      }
    });
  };

  proc(providerConfig, parameters, currentDay);
};

var processOneDay = function(flightPage, providerConfig, parameters, currentDay, callback){
  var loadTimeout;
  var maxTimeout = 5000;
  var t;

  flightPage.onResourceReceived = function (response) {
    if(flightPage.url === providerConfig.resultPage){
      clearTimeout(loadTimeout);
      getResults(flightPage, t);
    }
  };

  flightPage.onConsoleMessage = function(msg) {
      console.log('console: ' + msg);
  };

//todo: what if more than one flight in a day
  var getResults = function(flightPage, t) {
    console.log(currentDay, "afterTimeout", Date.now() - t);
    var result = flightPage.evaluate(function(){
      var result = [];
      $("article.selectFlights:not(#businessPlusBannerOffer)").each(function(index, element){
        var flight = $(element).find("a.active");
        result.push({
          flight: $(element).children("h1").text(),
          date: $(element).find("caption").text().trim(),
          price: flight.find("div:not(.ng-hide)").text(),
          currency: flight.children("span").text()
        });
      });
      return result;
    });

    flightPage.close(function(){
      console.log("closed?!");
    });
    console.log(currentDay, JSON.stringify(result, undefined, 4));
    callback(null, result);
  };

  flightPage.open(providerConfig.searchPage, function (status) {
    if(status === "success") {
      console.log(currentDay, 0);//.format(providerConfig.dateFormat));
      setTimeout(function(){  //temporary fix
      //todo: wait until loaded!!!!
  console.log(currentDay, 1);
        ph.set(flightPage, ".stations select[title='Origin']", parameters.origin);
        ph.set(flightPage, ".stations select[title='Destination']", parameters.destination);
        ph.replace(flightPage, "[name='SearchInput$DeptDate']", currentDay);//.format(providerConfig.dateFormat));
        //ph.replace(flightPage, "[name='SearchInput$RetDate']", parameters.endDate.format(providerConfig.dateFormat));
    //$("#SearchInput_RoundTrip").click();
    //$("#SearchInput_OneWay").click();
  console.log(currentDay, 2);
        //todo: add the rest of parameters

        flightPage.evaluate(function() {
          $("#SearchInput_OneWay").click();
          $("#SearchInput_ButtonSubmit").click(); //todo: also wait
        });
        t = Date.now();
  console.log(currentDay, 3);
        loadTimeout = setTimeout(function(){  //wait until page is loaded
          getResults(flightPage, t);
        }, maxTimeout);
      }, 0);
    }
    else{
      //flightPage.close();
      callback('Unable to load page!', null);
    }
  });
};

input.getParameters(crawl);
