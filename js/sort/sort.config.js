define(['require',
        'data_store/get',
        'jquery', 
        'searching/fuzzySearch', 
        'searching/plainTextSearch'
    ], 
function(require, getData, $, SortByNumeric, SortByUser, SortByAlphabatical) {
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

        if ($ele == null) return;

        if (searchSettings.type == "fuzzy") {
            fuzzySearch($ele);
        } else {
            textSearch($ele);
        }
    }

    return handler;
});