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

    function newMultiselectWithOptions(ele, options) {
        return newMultiselect(ele, null, options);
    }
    function newMultiselectWithData(ele, data) {
        return newMultiselect(ele, data, null);
    }
    function newMultiselect(ele, data, options) {
        var name = $(ele).prop('name');
        var ele = $(ele).first();
        cache.addMultiselect(name, ele, data, options);
        return name;
    }
    // builds a new multiselect item
    function newMultiselectItem(value, element, searchable, selected) {
        if (element == null) return false;
        if (!(element instanceof jquery)) {
            element = $(element);
        }
        if (element.length <= 0) return false;
        if (value == null || value === "") return false;
        return {
            "@value": value,
            "@element": element,
            "@searchable": (searchable == null ? "": searchable),
            "@selected": (selected == null ? false : selected)
        }
        return name;
    }

    return {
        newMultiselect: newMultiselect,
        newMultiselectWithOptions: newMultiselectWithOptions,
        newMultiselectWithData: newMultiselectWithData,
    };
});