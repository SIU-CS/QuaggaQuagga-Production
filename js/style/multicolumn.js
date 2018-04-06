define(['require',
        'jquery', 
    ], 
function(require, $) {
    'use strict';
    var jquery = $;

    /**
     * Turns the multiselect into a responsize multicolumn select
     * @param {jquery element} $multiselect the targeted multiselect
     * @param {JSON} settings the settings of the target multiselect
     */
    function handler($multiselect, settings) {
        var $jsmBody = $multiselect.find(".JSM-body");
        var $jsmList = $jsmBody.find(".JSM-list");
        var $jsmFirstGroup = $jsmList.children(".list-group");
        var currentNumColumns = -1;
        var switchTimer = null;

        var maxColumns = settings['numColumns'] = $.isNumeric(settings['numColumns']) ? settings['numColumns'] : 3;
        if (maxColumns <= 0) maxColumns = 3;

        function toggleCSS() {
            console.log("a")
            var visableItems = $jsmList.find(".list-group-item:visible");
            var maxHeight = $jsmBody.css('max-height').replace('px', '');
            var estimateHeight = 0;
            visableItems.each(function() {
                estimateHeight += $(this).outerHeight(); 
            });
            var currentNumColumns = Math.ceil(estimateHeight/maxHeight);
            console.log(currentNumColumns);

            if (currentNumColumns > maxColumns) currentNumColumns = maxColumns;
            if (currentNumColumns < 1) currentNumColumns = 1;

            var columnsCSS = currentNumColumns;
            $jsmFirstGroup.css({
                '-webkit-column-count': columnsCSS,
                'moz-column-count': columnsCSS,
                'column-count': columnsCSS
            });

            // adds and removes space as needed to keep the list balanced
            var spacerHeight =  Math.floor(estimateHeight/visableItems.length);
            var numCurrSpace = $jsmFirstGroup.children(".JSM-spacer").length;
            var neededSpace = currentNumColumns - visableItems.length % currentNumColumns - numCurrSpace;
            if (neededSpace + numCurrSpace == currentNumColumns) neededSpace = -numCurrSpace;
            if (neededSpace > 0)
                for(var i = 0; i < neededSpace; i += 1) {
                    $jsmFirstGroup.append('<div class="JSM-spacer" style="height: '+spacerHeight+'px"></div>');
                }
            else if (neededSpace < 0)
                $jsmFirstGroup.children(".JSM-spacer").slice(0,-neededSpace).remove();
        }
        
        $jsmList.find(".list-group").on('shown.bs.collapse', toggleCSS);
        $jsmList.find(".list-group").on('hidden.bs.collapse', toggleCSS);
        toggleCSS();
    }
    
    return handler;
});