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
        var searchSettings = getData.getSettingByName("search", name);


        // if there is no filterInterval defined in the search settings, default it to 0 for the purposes of the function
        if (searchSettings.filterInterval == null || searchSettings.filterInterval == '') {
            searchSettings.filterInterval = 0.5;
        } else if (searchSettings.filterInterval > 1) {
            searchSettings.filterInterval /= 100;
        }


        if ($ele == null) return;

        if (searchSettings.type == "fuzzy") {
            fuzzySearch(name, $ele, searchSettings, searchSettings.filterInterval);
        } else {
            textSearch(name, $ele, searchSettings);
        }
    }

    return handler;
});