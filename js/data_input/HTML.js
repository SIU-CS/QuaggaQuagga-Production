define(['require', 'jquery', 'data_store/new', 'logger', 'data_input/liveHTML'], function(require) {
    'use strict';

    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreNew = require('data_store/new');
    var logger = require('logger');
    var liveHTML = require('data_input/liveHTML');

    return function loadHTML(strHTML) {
        var html = null;
        try { // try to parse html
            html = $.parseHTML(strHTML.trim());
            
        } catch (ex) {
            // give some warning to the user
            console.warn("Not a valid HTML");
            return null;
        }
        // process using liveHTML and return
        if (html != null) return liveHTML(html);
        return null;
    };
});