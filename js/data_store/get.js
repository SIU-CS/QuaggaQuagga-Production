// defines the more advanced error checking getters of the data
define(['require', 
    'data_store/cache', 
    'jquery'],
function (require) {
    'use strict';
    var $, jquery;
    jquery = $ = require('jquery');
    var cache = require('data_store/cache');

    /**
     * Returns a list of multiselector names registed with the cache
     * @returns {String Array} and array of names
     */
    function nameList() {
        var keyList = [];
        cache.forEachName(function(name) {
            keyList.push(name);
        });
        return keyList;
    }

    /**
     * Returns the data for the multiselect specified by the name
     * @param {String} name
     * @returns {JSON Object} the data associated with the multiselect
     */
    function getDataByName(name) {
        var multi =  cache.getMultiselect(name);
        if (multi !== null)
            // returns a copy of the data
            return multi.Data;
        return null;
    }

    /**
     * Gets the jquery element reference for the multiselect specified by the name
     * @param {String} name 
     * @returns {Jquery Element} the element associated with the multiselect
     */
    function getElementByName(name) {
        var multi =  cache.getMultiselect(name);
        if (multi != null) {
            return multi.Element;
        }
        return null;
    }

    /**
     * Gets the settings for the multiselect specified by the name
     * @param {String} name
     * @returns {JSON Object} the settings associated with the multiselect
     */
    function getSettingsByMultiselectName(name) {
        var multi =  cache.getMultiselect(name);
        if (multi !== null) {
            if (multi.Settings == null || !$.isPlainObject(multi.Settings)) {
                multi.Settings = {};
            }
            return multi.Settings;
        }
        console.warn("An error occured getting settings, multiselect not loaded");
        return {};
    }

    /**
     * Gets the settings for the multiselect specified by the name
     * @param {String} settingName
     * @param {String} multiName
     * @returns {JSON Object} the settings associated with the multiselect
     */
    function getSettingByName(settingName, multiName) {
        var settings =  getSettingsByMultiselectName(multiName);
        if (!settings.hasOwnProperty(settingName) || 
            settings[settingName] == null || 
            !$.isPlainObject(settings[settingName])
        ){
            settings[settingName] = {};
        }
        return settings[settingName];
    }

    /**
     * Gets the title for the multiselect specified by the name
     * @param {String} name
     * @returns {String} the title
     */
    function getTitleByName(name) {
        var multi =  cache.getMultiselect(name);
        if (multi !== null)
            return multi.Title == null ? name : multi.Title;
        return null; // multiselect doesn't exist
    }

    /**
     * Returns a list of item keys (special meaning behind these keys)
     * @returns {String Array} and array of Item keys
     */
    function getMultiselectItemKeys() {
        return ["@value", "@element", "@searchable", "@selected", "@isHeader", "@icon", "@image"];
    }


    return {
        nameList: nameList,
        getDataByName: getDataByName,
        getElementByName: getElementByName,
        getSettingsByMultiselectName: getSettingsByMultiselectName,
        getSettingByName: getSettingByName,
        getMultiselectItemKeys: getMultiselectItemKeys,
        getTitleByName: getTitleByName
    };
});