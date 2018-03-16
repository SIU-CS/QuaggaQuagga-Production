'use strict';

define(['require', 'jquery', 'data_store/new', 'logger', 'data_input/liveHTML'], function(require) { 
    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreNew = require('data_store/new');
    var logger = require('logger');
    var liveHTML = require('data_input/liveHTML');

    return function loadHTML(strHTML) {
        try { // try to parse html
            var html = $.parseHTML(strHTML.trim());
            // process using liveHTML and return
            return liveHTML(html);
        } catch (ex) {
            // give some warning to the user
            console.warn("Not a valid HTML");
        }
        return null;
    };
});