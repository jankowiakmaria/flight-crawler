'use strict';

var system = require("system"),
    moment = require("moment");

var get = function(callback){
  if (system.args.length < 5) {
    var error = 'phantomjs app.js origin destination startDate endDate [oneWay=false]';
    callback(error, null);
  } else {                            //todo: validation
    var args = system.args;
    var data = {};

    data.origin = args[1];
    data.destination = args[2];
    data.startDate = moment(args[3], "DD/MM/YYYY"); //todo: extract date format
    data.endDate = moment(args[4], "DD/MM/YYYY");
    data.oneWay = args.length === 6 ? args[5] : false;

    callback(null, data);
  }
};

module.exports = {
  getParameters: get
};
