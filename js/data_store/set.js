'use strict';

// defines the more advanced error checking getters of the data
define(['require',
    'data_store/get',
    'data_store/cache', 
    'logger',
    'jquery'],
function (require) {
    var $, jquery;
    $ = jquery = require('jquery');
    var cache = require('data_store/cache');
    var getCache = require('data_store/get');
    var logger = require('logger');

    // replaces the whole data object
    function replaceDataByName(name, data) {
        var multi = dataObj.getMultiselect(name);
        if (multi !== null) {
            multi.data = data;
            return true;
        }
        return false;
    }

    // force if you want to erase previous data if specified
    function extendDataItemsByName(name, items, force) {
        var multi = dataObj.getMultiselect(name);
        if (multi !== null) {
            if (force)
                multi.data = $.extend(multi.data, data);
            else
                multi.data = $.extend(data, multi.data);
            return true;
        }
        return false;
    }

    // will extend the options object replacing any you specify
    function setOptionsByName(name, options) {
        var multi = dataObj.getMultiselect(name);
        if (multi !== null) {
            // will overrnamee any other objects
            multi.options = $.extend(multi.options, options);
            return true;
        }
        return false;
    }

    return {
        replaceDataByName: replaceDataByName,
        extendDataItemsByName: extendDataItemsByName,
        setOptionsByName: setOptionsByName,
        deleteDataItemByName: deleteDataItemByName
    }
});
