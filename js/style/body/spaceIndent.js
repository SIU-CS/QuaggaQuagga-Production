define(['require', 'jquery', 'utility/nestedDepth'], function(require) {
    'use strict';
    
    var $, jquery;
    jquery = $ = require('jquery');
    var nestedDepth = require('utility/nestedDepth');

    var indentPercent = 1/6;


    /**
     * Sets the sapce indentor for the specified multiselect
     * @param {Jquery element} $multiselect the multiselect 
     */
    function refresh($multiselect) {
        $multiselect.find(".list-group-root").children(".list-group").each(function(i, e) {
            var $ele = $(e);
            var maxDepth = nestedDepth($ele, ".list-group");
            var indentLength = Math.ceil($ele.width()/maxDepth*indentPercent);
            $ele.find(".list-group").css("margin-left", indentLength);
        }); 
    } 
    return {
        setInit: function($multiselect) {
            refresh($multiselect);
            (function() {
                var $m = $multiselect;
                $(window).resize(function(){
                    refresh($m);
                });
            }());
        },
        refresh: refresh
    };
});