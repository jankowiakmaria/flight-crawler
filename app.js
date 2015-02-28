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

flightPage.open(config.ryanair.page, function (status) {
  console.log(status);
  if(status === "success") {
    sendKeys(flightPage, ".stations select[title='Origin']", "London (Stansted)");
    sendKeys(flightPage, ".stations select[title='Destination']", "Pozna");

    flightPage.evaluate(function() {
      $("#SearchInput_ButtonSubmit").click();
    });

    setTimeout(function() {
      flightPage.render('afterclick.png');
      console.log(flightPage.url);
      phantom.exit();
    }, 5000);
  }

  //phantom.exit();
});

/*flightPage.onResourceRequested = function (request) {
  if(flightPage.url === "https://www.bookryanair.com/SkySales/Booking.aspx#Select")
    console.log('Request', isReady(flightPage), flightPage.url, JSON.stringify(request, undefined, 4));
};*/
flightPage.onResourceReceived = function (response) {
  if(flightPage.url === "https://www.bookryanair.com/SkySales/Booking.aspx#Select"){
    isReady = true;
    console.log('Receive', flightPage.url, JSON.stringify(response, undefined, 4));
  }
};
