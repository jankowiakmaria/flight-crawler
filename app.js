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
  var flightPage = webPage.create();
  var loadTimeout;
  var maxTimeout = 5000;
  var t;


  flightPage.onResourceReceived = function (response) {
    if(flightPage.url === providerConfig.resultPage){
      clearTimeout(loadTimeout);
      getResults(flightPage, t);
    }
  };

  var getResults = function(flightPage, t) {
    console.log("afterTimeout", Date.now() - t);
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
  };

  flightPage.open(providerConfig.searchPage, function (status) {
    if(status === "success") {
      //todo: wait until render?
      ph.set(flightPage, ".stations select[title='Origin']", parameters.origin);
      ph.set(flightPage, ".stations select[title='Destination']", parameters.destination);
      ph.replace(flightPage, "[name='SearchInput$DeptDate']", parameters.startDate.format(providerConfig.dateFormat));
      ph.replace(flightPage, "[name='SearchInput$RetDate']", parameters.endDate.format(providerConfig.dateFormat));
  //$("#SearchInput_RoundTrip").click();
  //$("#SearchInput_OneWay").click();

      //todo: add the rest of parameters

      flightPage.evaluate(function() {
        $("#SearchInput_ButtonSubmit").click(); //todo: also wait
      });
      t = Date.now();

      loadTimeout = setTimeout(function(){  //wait until render
        getResults(flightPage, t);
      }, maxTimeout);
    }
    else{
      phantom.exit();
    }
  });
};

input.getParameters(crawl);





/*var isReady = false;

flightPage.onConsoleMessage = function(msg) {
    console.log('console: ' + msg);
};
*/
