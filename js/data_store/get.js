'use strict';

// defines the more advanced error checking getters of the data
define(['require', 
    'data_store/cache', 
    'jquery'],
function (require) {
    var $, jquery;
    jquery = $ = require('jquery');
    var cache = require('data_store/cache');
    var selectorUtil
    var objectUtil

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

    function getDataItemByName(name, dotString) {
        var multi =  cache.getMultiselect(name);
        if (multi !== null)
            return objectUtil.getValueAtDotString(dotString ,multi.data);
        return null;
    }

    function getDataItemValueByName(name, dotString) {
        var item = getDataItemByName(name, dotString);
        if (item != null) {
            if (typeof item === 'object') {
                if (typeof item['@value'] !== 'undefined' && item['@value'] !== null)
                    return item['@value'];
                else if (typeof item['value'] !== 'undefined' && item['value'] !== null)
                    return item['value'];
                else
                    return null;
            }
            return item
        }
        return null;
    }

    function getDataItemSearchableByName(name, dotString) {
        var item = getDataItemByName(name, dotString);
        if (item != null) {
            if (typeof item === 'object') {
                if (typeof item['@searchable'] !== 'undefined' && item['@searchable'] !== null)
                    return item['@searchable'];
                else if (typeof item['searchable'] !== 'undefined' && item['searchable'] !== null)
                    return item['searchable'];
                else
                    return null;
            }
            return item
        }
        return null;
    }

    function getElementByName(name) {
        var elements = $(getPathByName(name));
        if (elements.length > 0) {
            return elements[0];
        }
        return null;
    }

    function getPathByName(name) {
        var multi =  cache.getMultiselect(name);
        if (multi !== null)
            return multi.path;
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
        getPathByName: getPathByName,
        getOptionsByName: getOptionsByName,
        getDataItemByName: getDataItemByName,
        getDataItemValueByName: getDataItemValueByName,
        getDataItemSearchableByName: getDataItemSearchableByName,
    }
});