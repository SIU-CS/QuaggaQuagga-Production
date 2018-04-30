define(['require', 'jquery'], function (require, $) {
    'use strict';
    
    var jquery = $;

    /**
     * This function ensures we are getting proper settings for the multiselect
     * @param {Function} settingsFunction A function that returns the settings for the multiselect
     */
    function verifySettingsFunction(settingsFunction) {
        if (!$.isFunction(window[settingsFunction])) return null;
        var settings = window[settingsFunction]();
        return settings;
    }

    return verifySettingsFunction;
});