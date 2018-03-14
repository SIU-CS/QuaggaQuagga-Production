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
            return multi.data;
        return null;
    }

    function getElementByName(name) {
        var multi =  cache.getMultiselect(name);
        if (multi != null) {
            return multi.Element
        }
        return null;
    }

    function getOptionsByName(name) {
        var multi =  cache.getMultiselect(name);
        if (multi !== null)
            return multi.options;
        return null;
    }


    return {
        nameList: nameList,
        getDataByName: getDataByName,
        getElementByName: getElementByName,
        getOptionsByName: getOptionsByName
    }
});