'use strict';


define(['require', 'jquery', 'data_store/get'], function (require) {
    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreGet = require('data_store/get');

    function returnData(data) {
        var xmlHttpReq = new XMLHttpRequest();
        var fd = new FormData();

        // pushes data into the FormData object
        for (name in data) {
            fd.append(name, data[name]);
        }

        // successful data submission
        xmlHttpReq.addEventListener('load', function (event) {
            alert('Data successfully sent!');
        });

        // if there is an error
        xmlHttpReq.addEventListener('error', function (event) {
            alert('Error, data not sent.');
        });

        // sets up the request (not sure what to put for the URL where the data would be sent)
        xmlHttpReq.open('POST', 'https://somesite.com');

        // sends the FormData object
        xmlHttpReq.send(fd);
    }
});