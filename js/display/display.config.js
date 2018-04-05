define(['require',
        'consts',
        'data_store/get',
        'jquery',
        'display/list',
        'display/title'
    ], 
function(require, CONSTS, getData, $, displayList, displayTitle) {
    'use strict';
    var jquery = $;

    var displayClasses = ['popoverSelect', 'multiColumn', 'singleColumn'];
    
    function removeDisplayClasses($ele) {
        for (var i in displayClasses) {
            if ($ele.hasClass(displayClasses[i]))
                $ele.removeClass(displayClasses[i]);
        }
    }

    /**
     * Handles the style part of the multiselect, selecting the apprpriate styles
     * For each based upon optons/multiselect type
     * @param {jquery element} $multiselect the targeted multiselect
     */
    function handler(name) {
        var $ele = getData.getElementByName(name);
        var settings = getData.getSettingsByName(name);

        if (settings == null) settings = {};
        if (settings.display == null || !$.isPlainObject(settings.display) || !settings.hasOwnProperty("display")) {
            settings.display = {
                "type": "singleColumn"
            };
        }
        if (!settings.display.hasOwnProperty("type"))
        {
            settings.display.type = "singleColumn";
        }

        if ($ele == null) return;

        // empty the element
        $ele.empty();

        removeDisplayClasses($ele);

        if (settings.display.type == "popover") {
            // get the basic layout
            $ele.html(CONSTS.CONST_POPOVER_LAYOUT());
            $ele.addClass("popoverSelect");
        } else if (settings.display.type == "multiColumn") {
            $ele.html(CONSTS.CONST_MULTICOLUMN_LAYOUT());
            $ele.addClass("multiColumn");
        } else {
            $ele.addClass("singleColumn");
            $ele.html(CONSTS.CONST_SINGLECOLUMN_LAYOUT());
        }

        displayList($ele, name);

        displayTitle($ele, name);
    }
    return handler;
});