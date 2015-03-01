'use strict';

var config = require("./config"),
    ph = require("./Helpers/phantomHelper"),
    input = require("./Helpers/parametersHelper"),
    moment = require("moment");

input.getParameters(function(error, parameters){
  if(error){
    console.log(error);
    phantom.exit();
    return;
  }
  phantom.exit();
});



/*var isReady = false;

var flightPage = require('webpage').create();

flightPage.onConsoleMessage = function(msg) {
    console.log('console: ' + msg);
};

//todo: parameters
flightPage.open(config.ryanair.searchPage, function (status) {
  if(status === "success") {
    ph.set(flightPage, ".stations select[title='Origin']", "London (Stansted)");
    ph.set(flightPage, ".stations select[title='Destination']", "Pozna");
    ph.replace(flightPage, "[name='SearchInput$DeptDate']", "08/03/2015");
    ph.replace(flightPage, "[name='SearchInput$RetDate']", "08/04/2015");
//$("#SearchInput_RoundTrip").click();
//$("#SearchInput_OneWay").click();


    flightPage.render("replacedDates.png");
    //todo: add the rest of parameters

    flightPage.evaluate(function() {
      $("#SearchInput_ButtonSubmit").click(); //todo: also wait
    });

    setTimeout(function() {                                           //todo: setInterval - polling
      flightPage.render('afterclick.png');
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
      console.log(JSON.stringify(result, undefined, 4));
      phantom.exit();
    }, 5000);
    //phantom.exit();
  }
});

flightPage.onResourceReceived = function (response) {
  if(flightPage.url === config.ryanair.resultPage){
    isReady = true;
  }
};*/
