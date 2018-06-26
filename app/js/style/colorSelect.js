define(['require', 'jquery', 'data_store/get', 'style/body/colorIndent'], function(require, $, dataStoreGet, colorIndent) {
    'use strict';

    function lightDisplay($multiselect) {
        var color = "#a29fa8";
        colorIndent($multiselect, color);
    }

    function darkDisplay($multiselect) {
        var color = "#0d0916";
        colorIndent($multiselect, color);
    }

    function customFadeDisplay(ccolor){
        colorIndent.setColorRecursively($ele, colorArray, ccolor);
    }
    
    var $, jquery;
    jquery = $ = require('jquery');
    var getData = require('data_store/get');
    function handler(multiName, $multiselect, displaySettings) {

        if (displaySettings.lightDisplay == true) lightDisplay($multiselect);
        if (displaySettings.darkDisplay == true) darkDisplay($multiselect);
        if (displaySettings.customFadeDisplay == true) customFadeDisplay(color);
    }
    return handler;
});