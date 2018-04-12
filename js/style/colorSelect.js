define(['require', 'jquery', 'data_store/get'], function(require) {
    'use strict';

    function lightDisplay(){
        setColorRecursively($ele, colorArray, hsl(261, 44, 6));
    }

    function darkDisplay(){
        setColorRecursively($ele, colorArray, hsl(261, 5, 64));
    }

    function customFadeDisplay(ccolor){
        setColorRecursively($ele, colorArray, ccolor);
    }
    
    var $, jquery;
    jquery = $ = require('jquery');
    var getData = require('data_store/get');
    function handler(multiName, $multiselect, displaySettings) {

        if (displaySettings.lightDisplay == true) lightDisplay();
        if (displaySettings.darkDisplay == true) darkDisplay();
        if (displaySettings.customFadeDisplay == true) customFadeDisplay(color);
    }
    return handler;
});