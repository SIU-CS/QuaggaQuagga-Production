'use strict';

// defines the more advanced error checking getters of the data
define(['require', 
    'data_store/cache', 
    'jquery'],
function (require) {
    var $, jquery;
    jquery = $ = require('jquery');
    var cache = require('data_store/cache');

    function nameList() {
        var keyList = [];
        cache.forEachName(function(name) {
            keyList.push(name);
        });
        return keyList;
    }

    function getDataByName(name) {
        var multi =  cache.getMultiselect(name);
        if (multi !== null)
            return multi.Data;
        return null;
    }

    function getElementByName(name) {
        var multi =  cache.getMultiselect(name);
        if (multi != null) {
            return multi.Element
        }
        return null;
    }

    function getSettingsByName(name) {
        var multi =  cache.getMultiselect(name);
        if (multi !== null)
            return multi.Settings;
        return null;
    }

    function getTitleByName(name) {
        var multi =  cache.getMultiselect(name);
        if (multi !== null)
            return multi.Title == null ? name : multi.Title;
        return null; // multiselect doesn't exist
    }

    
    function getMultiselectItemKeys() {
        return ["@value", "@element", "@searchable", "@selected", "@isHeader"]
    }


    return {
        nameList: nameList,
        getDataByName: getDataByName,
        getElementByName: getElementByName,
        getSettingsByName: getSettingsByName,
        getMultiselectItemKeys: getMultiselectItemKeys,
        getTitleByName: getTitleByName
    }
});