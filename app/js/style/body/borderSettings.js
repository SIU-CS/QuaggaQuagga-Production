define(['require', 'jquery', 'utility/color'], function (require) {
    'use strict';

    var $, jquery;
    jquery = $ = require('jquery');
    var colorUtil = require('utility/color');

    //can also use this to just set the borders to all one color
    function setBorderColor($multiselect, color) {
        $multiselect.find(".list-group-item").each(function (i, e) {
            var $ele = $(e);
            if (color != null) {
                $ele.css("border-color", color);
            }
            color = $ele.css("border-color");
        });
    }

    function setBorderWidth($multiselect, widthInPixels) {
        $multiselect.find(".list-group-item").each(function (i, e) {
            var $ele = $(e);
            if (widthInPixels != null) {
                $ele.css("border-width", widthInPixels)
            }
            widthInPixels = $ele.css("border-width");
        });
    }

    return {
        setBorderColor: setBorderColor,
        setBorderWidth: setBorderWidth
    };
});
