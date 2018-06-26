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
    function refreshIndent($multiselect, indentPercent) {
        if(indentPercent == null) indentPercent = initIndentPercent;
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
            
            refreshIndent($multiselect, localIndentPercent);
            (function() {
                var $m = $multiselect;
                var iP =  localIndentPercent;
                $(window).resize(function(){
                    refreshIndent($m, iP);
                });
            }());
        },
        refresh: function() {
            $(window).trigger('resize');
        }
    };
});