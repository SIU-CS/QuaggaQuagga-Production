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

    function newMultiselectWithOptions(ele, options, title) {
        return newMultiselect(ele, null, options, title);
    }
    function newMultiselectWithData(ele, data, title) {
        return newMultiselect(ele, data, null, title);
    }
    function newMultiselect(ele, data, options, title) {
        var name = $(ele).attr('name');
        if (typeof name === 'undefined' || name == null) return null;

        var ele = $(ele).first();
        if (!cache.addMultiselect(name, ele, data, options, title)) return null;
        return name;
    }
    // builds a new multiselect item
    function newMultiselectItem(value, element, searchable, selected) {
        if (!(element instanceof jquery) && element != null) {
            element = $(element);
        }
        if (element != null && element.length <= 0 ) return false;
        
        if (value == null || value === "") return false;
        return {
            "@value": value,
            "@element": element,
            "@searchable": (searchable == null ? "": searchable),
            "@selected": (selected == null ? false : selected),
            "@isHeader": false
        }
    }

    // builds a new multiselect item
    function newMultiselectHeader(element, searchable, selected) {
        if (!(element instanceof jquery) && element != null) {
            element = $(element);
            
        }
        if (element != null && element.length <= 0 ) return false;
        
        return {
            "@element": element,
            "@searchable": (searchable == null ? "": searchable),
            "@selected": (selected == null ? false : selected),
            "@isHeader": true
        }
    }

    return {
        newMultiselect: newMultiselect,
        newMultiselectWithOptions: newMultiselectWithOptions,
        newMultiselectWithData: newMultiselectWithData,
        newMultiselectHeader: newMultiselectHeader,
        newMultiselectItem: newMultiselectItem
    };
});