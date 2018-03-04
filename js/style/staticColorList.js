'use strict';

define(['require', 'jquery', 'utility/color'], function(require) {
    var $, jquery;
    jquery = $ = require('jquery');
    var colorUtil = require('utility/color');
    $().ready(function() {
        $(".list-group-root.list-group").each(function(i, e) {
            var $ele = $(e);
            var color = $ele.css("background-color");
            var rgbA = colorUtil.RgbStringToArray(color);
            console.log(rgbA)
            var maxDepth = findDepth($ele, 0)
            var fadeArray = colorUtil.fadeRgbToWhite(rgbA[0], rgbA[1], rgbA[2], maxDepth);
            console.log(fadeArray);
            $ele.css("background-color", colorUtil.RgbArrayToString(fadeArray[0]));
            setColorRecursivly($ele, fadeArray, 1);
        });
        // returns the depth
        function findDepth($ele, depth) {
            var $children = $ele.children(".list-group");
            var max = depth;
            $children.each(function (i, ele) {
                var d = findDepth($(ele), depth + 1);
                if (d > max) max = d;
            });
            return max;
        }

        // sets the color for all list groups
        function setColorRecursivly($ele, colorArray, colorI) {
            $ele.children(".list-group").each(function (i, e) {
                var $e = $(e);
                $e.css("background-color", colorUtil.RgbArrayToString(colorArray[colorI]));
                setColorRecursivly($e, colorArray, colorI + 1);
            });
        }
    });
});