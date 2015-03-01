'use strict';

var system = require("system"),
    moment = require("moment");

var get = function(callback){
  if (system.args.length < 6) {
    var error = 'phantomjs app.js provider origin destination startDate endDate [oneWay=false]';
    callback(error, null);
  } else {                            //todo: validation
    var args = system.args;
    var data = {};

    data.provider = args[1],
    data.origin = args[2];
    data.destination = args[3];
    data.startDate = moment(args[4], "DD/MM/YYYY"); //todo: extract date format
    data.endDate = moment(args[5], "DD/MM/YYYY");
    data.oneWay = args.length === 7 ? args[6] : false;

    callback(null, data);
  }
};

module.exports = {
  getParameters: get
};
