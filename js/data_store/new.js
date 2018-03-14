'use strict';

// defines the consructors for the data object
define(['require',
    'data_store/cache',
    'data_store/set',
    'jquery'],
function (require) {
    var jquery, $;
    jquery = $ = require('jquery');
    var cache = require('data_store/cache');
    var cacheSet = require('data_store/set');

    // public
    function newMultiselect(ele) {
        return newMultiselectSetAll(ele, null, null);
    }
    function newMultiselectWithOptions(ele, options) {
        return newMultiselectSetAll(ele, null, options);
    }
    function newMultiselectWithData(ele, data) {
        return newMultiselectSetAll(ele, data, null);
    }
    function newMultiselectSetAll(ele, data, options) {
        var name = getUniqueNameFromEle(ele);
        var obj = initMultiselectItem(name);
        cache.addMultiselect(name, obj);
        if (data != null)
            cacheSet.replaceDataByName(name, data);
        if (options != null)
            cacheSet.setOptionsByName(name, options);
        return name;
    }

    return {
        newMultiselect: newMultiselect,
        newMultiselectWithOptions: newMultiselectWithOptions,
        newMultiselectWithData: newMultiselectWithData,
        newMultiselectSetAll: newMultiselectSetAll
    };
});