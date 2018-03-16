'use strict';

define(['require', 'jquery', 'data_store/new'], function(require) {
    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreNew = require('data_store/new');

    function ProcessJson(jsonData)
    {
        var rv = {};
        for(var name in jsonData) {
            var obj = jsonData[name];
            if(typeof obj !='object' || obj == null) continue;
            // get then delete object attributes here
            var value = null;
            if(obj['@value'] != null) {
                value = obj['@value'];
                delete obj['@value'];
            } else if(obj['value'] != null) {
                value = obj['value'];
                delete obj['value'];
            }
            var searchable = "";
            if(obj['@searchable'] != null) {
                searchable = obj['@searchable'];
                delete obj['@searchable'];
            } else if(obj['searchable'] != null) {
                searchable = obj['searchable'];
                delete obj['searchable'];
            }
            var selected = false;
            if(obj['@selected'] != null) {
                selected = obj['@selected'] == true || obj['@selected'] == "true";
                delete obj['@selected'];
            } else if(obj['selected'] != null) {
                selected = obj['selected'] == true || obj['selected'] == "true";
                delete obj['selected'];
            }

            if(value == null) // is header
            {
                var header = dataStoreNew.newMultiselectHeader(null, searchable, selected);
                var children = ProcessJson(obj);
                if (children != null) {
                    rv[name] = $.extend(children, header);
                }
                
            } else { // is item
                rv[name] = dataStoreNew.newMultiselectItem(value, null, searchable, selected);
            }
        }

        if ($.isEmptyObject(rv)) return null;
        return rv;
    }
    return function(jsonData) 
    {
        if(typeof jsonData !='object') {
            try {
                jsonData = $.parseJSON(jsonData);
            } catch(err) {
                console.warn("Data is not json or json parsable")
                return null;
            }
        }
        jsonData = $.extend(true, {}, jsonData);
        return ProcessJson(jsonData);
    }
});