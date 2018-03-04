'use strict';

define(['require', 'jquery'], function(require) {
    var $, jquery;
    jquery = $ = require('jquery');
    // returns the depth
    /**
     * Retruns the number of "selectors" under the base element
     * Note: each element must be directly nested under the previous selecotr element
     * ---- Will not skip down to find the next selector if not among the children
     * @param $ele  the base jquery element you want to search from
     * @param selector the selector you want to search by
     * @param depth the depth you want to start from, defaults to zero if null
     * @return the integer value for the depth for each () 
     */
    function findDepth($ele, selector, depth) {
        if (typeof depth == "undefined" || depth == null) depth = 0;
        var $children = $ele.children(selector);
        var max = depth;
        $children.each(function (i, ele) {
            var d = findDepth($(ele), selector, depth + 1);
            if (d > max) max = d;
        });
        return max;
    }
    return findDepth;
});
