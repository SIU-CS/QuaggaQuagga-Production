define(['require', 'jquery', 'utility/color'], function (require) {
    'use strict';

    var $, jquery;
    jquery = $ = require('jquery');
    var colorUtil = require('utility/color');

    /**
     * sets the color fade for the multiselect
     * @param {jquery element} $multiselect the multiselect targeted  
     */
    function setBGColor($multiselect, color) {
        $multiselect.css("background-color", color);
    }
    return setBGColor;
});
