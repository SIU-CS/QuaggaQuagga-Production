define(['require',
        'data_store/get',
        'jquery', 
        'searching/fuzzySearch', 
        'searching/plainTextSearch'
    ], 
function(require, getData, $, fuzzySearch, textSearch) {
    'use strict';
    var jquery = $;

    /**
     * Handles the style part of the multiselect, selecting the apprpriate styles
     * For each based upon optons/multiselect type
     * @param {jquery element} $multiselect the targeted multiselect
     */
    function handler(name) {
        var $ele = getData.getElementByName(name);
        var settings = getData.getSettingsByName(name);
        if (settings == null) settings = {};
        if (settings.search == null || !$.isPlainObject(settings.search) || !settings.hasOwnProperty("search")) {
            settings.search = {
                "type": "text"
            };
        }
        if (!settings.search.hasOwnProperty("type"))
        {
            settings.search.type = "text";
        }

        if ($ele == null) return;

        if (settings.search.type == "fuzzy") {
            fuzzySearch($ele);
        } else {
            textSearch($ele);
        }
    }

    return handler;
});