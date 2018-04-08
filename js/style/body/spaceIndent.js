define(['require', 'jquery', 'utility/nestedDepth'], function(require) {
    'use strict';
    
    var $, jquery;
    jquery = $ = require('jquery');
    var nestedDepth = require('utility/nestedDepth');

    var indentPercent = 1/6;


    // sets the color for all list groups
    function setIndentRecursivly($ele, indent) {
        $ele.children(".list-group").each(function (i, e) {
            var $e = $(e);
            $e.css("margin-left", indent);
            setIndentRecursivly($e, indent);
        });
    }

    /**
     * Sets the sapce indentor for the specified multiselect
     * @param {Jquery element} $multiselect the multiselect 
     */
    function setSpaceIndent($multiselect) {
        $multiselect.find(".list-group-root > .list-group").each(function(i, e) {
            var $ele = $(e);
            
            var maxDepth = nestedDepth($ele, ".list-group");
            var indentLength = Math.ceil($ele.width()/maxDepth*indentPercent);
            setIndentRecursivly($ele, indentLength, 0);
        }); 
    } 
    return function($multiselect) {
        setSpaceIndent($multiselect);
        (function() {
            var $m = $multiselect;
            $(window).resize(function(){
                setSpaceIndent($m);
            });
        }());
    }
});