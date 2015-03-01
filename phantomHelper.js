'use strict';

var setFocus = function(page, selector){
  page.evaluate(function(selector){
      // focus on the text element before typing
      var element = document.querySelector(selector);
      element.click();
      element.focus();
  }, selector);
};

var setContent = function(page, selector, keys){
  setFocus(page, selector);

  page.sendEvent("keypress", keys);
};

var replaceCurrentContent = function(page, selector, keys){
  setFocus(page, selector);

  page.sendEvent("keypress", page.event.key.A, null, null, 0x04000000);
  page.sendEvent("keypress", page.event.key.Delete);
  page.sendEvent("keypress", keys);
};

module.exports = {
  set: setContent,
  replace: replaceCurrentContent
};
