define(['require', 'jquery', 'utility/nestedDepth'], function(require) {
    'use strict';
    
    var $, jquery;
    jquery = $ = require('jquery');
    var nestedDepth = require('utility/nestedDepth');

    var initIndentPercent = 1/6;


    /**
     * Sets the sapce indentor for the specified multiselect
     * @param {Jquery element} $multiselect the multiselect 
     */
    function refresh($multiselect, indentPercent) {
        $multiselect.find(".list-group-root > .list-group").each(function() {
            var $ele = $(this);
            var bodyWidth = $multiselect.find(".JSM-body").width();
            var maxDepth = nestedDepth($ele, ".list-group");
            var indentLength = Math.ceil(bodyWidth/maxDepth*indentPercent);
            $ele.find(".list-group").css("margin-left", indentLength);
        }); 
    } 
    return {
        setInit: function($multiselect, localIndentPercent) {
            if(localIndentPercent == null) localIndentPercent = initIndentPercent;
            refresh($multiselect, localIndentPercent);
            (function() {
                var $m = $multiselect;
                var iP =  localIndentPercent;
                $(window).resize(function(){
                    refresh($m, iP);
                });
            }());
        },
        refresh: refresh
    };
});