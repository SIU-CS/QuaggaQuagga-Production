'use strict';

define(['require', 'jquery', 'utility/nestedDepth'], function(require) {
    var $, jquery;
    jquery = $ = require('jquery');
    var nestedDepth = require('utility/nestedDepth');

    var indentPercent = 1/6;

    $().ready(function() {

        // sets the color for all list groups
        function setIndentRecursivly($ele, indent) {
            $ele.children(".list-group").each(function (i, e) {
                var $e = $(e);
                $e.css("margin-left", indent);
                setIndentRecursivly($e, indent);
            });
        }

        /**
         * search through the children of the root listgroup and sets the indent level
         * @param String baseSelector, the string that will be search for whe trying to set the indent
         */
        function setSpaceIndent(baseSelector) {
            $(baseSelector + ".list-group-root > .list-group").each(function(i, e) {
                var $ele = $(e);
                
                var maxDepth = nestedDepth($ele, ".list-group");
                var indentLength = Math.ceil($ele.width()/maxDepth*indentPercent);
                setIndentRecursivly($ele, indentLength, 0);
            }); 
        } setSpaceIndent("");

        $(window).resize(function(){
            setSpaceIndent("");
        });
    });
});