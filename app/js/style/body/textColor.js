define(['require', 'jquery', 'utility/color'], function (require) {
    'use strict';

    var $, jquery;
    jquery = $ = require('jquery');
    var colorUtil = require('utility/color');

    /**
     * sets the color fade for the multiselect
     * @param {jquery element} $multiselect the multiselect targeted  
     */
    function setTextColor($multiselect, color) {
        $multiselect.find(".list-group-item").each(function (i, e) {
            var $ele = $(e);
            if (color != null) {
                $ele.css("color", color);
            }
            color = $ele.css("color");
        });
    }
    return setTextColor;
});
