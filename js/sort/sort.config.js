define(['require',
        'data_store/get',
        'jquery', 
        'sort/sortByAlpha', 
        'sort/sortByNumeric',
        'sort/sortByCustom', 
    ], 
function(require, getData, $, sortByAlpha, sortByNumeric, sortByCustom) {
    'use strict';
    var jquery = $;

    /**
     * Handles the style part of the multiselect, selecting the apprpriate styles
     * For each based upon optons/multiselect type
     * @param {jquery element} $multiselect the targeted multiselect
     */
    function handler(name) {
        var sortSettings = getData.getSettingByName("sort", name);

        if (sortSettings.type == "numeric") {
            sortByNumeric(name);
        } else if(sortSettings.type == "custom") {
            sortByCustom(name, userFunction);
        } else { // default is alpha
            sortByAlpha(name);
        }
    }

    return handler;
});