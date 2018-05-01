define(['require',
        'data_store/get',
        'jquery', 
        'data_output/interface', 
        'data_output/selectionOutput', 
    ], 
function(require, getData, $, outInterface, selectionOut) {
    'use strict';
    var jquery = $;

    /**
     * Handles the style part of the multiselect, selecting the apprpriate styles
     * For each based upon optons/multiselect type
     * @param {jquery element} $multiselect the targeted multiselect
     */
    function handler($multiselect, name) {
        var outputSettings = getData.getSettingByName("output", name);

        if (outputSettings != null) {
            selectionOut($multiselect, outputSettings.onSelect, outputSettings.onDeselect);
        }
    }

    return handler;
});