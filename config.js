'use strict';

var config = {
  ryanair: {
    searchPage: "https://www.bookryanair.com/SkySales/Booking.aspx#Search",
    resultPage: "https://www.bookryanair.com/SkySales/Booking.aspx#Select",
    dateFormat: "DD/MM/YYYY",
    selectors: {
      origin: ".stations select[title='Origin']",
      destination: ".stations select[title='Destination']",
      departureDate: "[name='SearchInput$DeptDate']",
      oneWay: "#SearchInput_OneWay",
      search: "#SearchInput_ButtonSubmit"
    }
  }
};

module.exports = config;
