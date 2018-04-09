define(['require',
        'data_store/get',
        'jquery', 
        'sort/sortByAlpha', 
        'sort/sortByCustom', 
    ], 
function(require, getData, $, sortByAlpha, sortByCustom) {
    'use strict';
    var jquery = $;

    /**
     * Handles the style part of the multiselect, selecting the apprpriate styles
     * For each based upon optons/multiselect type
     * @param {jquery element} $multiselect the targeted multiselect
     */
    function handler(name) {
        var sortSettings = getData.getSettingByName("sort", name);

        if (sortSettings != null) {
            var isReverse = (sortSettings.reverse === true || sortSettings.reverse === "true");

            if(sortSettings.type == "custom") {
                if ($.isFunction(sortSettings['sortDefine'])) {
                    sortByCustom(name, sortSettings['sortDefine'], isReverse);
                } else {
                    console.warn("custom for was not passed a function, refer to documentation");
                }
            } else { // default is alpha
                
                sortByAlpha(name, isReverse);
            }
        }
    }

    return handler;
});