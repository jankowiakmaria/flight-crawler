'use strict';

var config = require("./config");

var sendKeys = function(page, selector, keys){
    page.evaluate(function(selector){
        // focus on the text element before typing
        var element = document.querySelector(selector);
        element.click();
        element.focus();
    }, selector);
    page.sendEvent("keypress", keys);
};

var isReady = false;

var flightPage = require('webpage').create();

flightPage.onConsoleMessage = function(msg) {
    console.log('console: ' + msg);
};

flightPage.open(config.ryanair.page, function (status) {
  if(status === "success") {
    sendKeys(flightPage, ".stations select[title='Origin']", "London (Stansted)");
    sendKeys(flightPage, ".stations select[title='Destination']", "Pozna");

    //todo: add the rest of parameters

    flightPage.evaluate(function() {
      $("#SearchInput_ButtonSubmit").click();
    });

    setTimeout(function() {                                           //todo: setInterval - polling
      flightPage.render('afterclick.png');
      var result = flightPage.evaluate(function(){
        var result = [];
        $("article.selectFlights:not(#businessPlusBannerOffer)").each(function(index, element){
          var flight = $(element).find("a.active");
          result.push({
            h1: $(element).children("h1").text(),
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
  }
});

flightPage.onResourceReceived = function (response) {
  if(flightPage.url === "https://www.bookryanair.com/SkySales/Booking.aspx#Select"){
    isReady = true;
    //console.log('Receive', flightPage.url, JSON.stringify(response, undefined, 4));
  }
};
