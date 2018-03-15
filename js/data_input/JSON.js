'use strict';

define(['require', 'jquery', 'data_store/new'], function(require) {
    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreNew = require('data_store/new');

    function ProcessJson(jsonData)
    {
        var rv = {};
        for(var name in jsonData) {
            console.log(name);
            var obj = jsonData[name];
            var isHeader = false;
            if(obj.value != null)
            {
                isHeader = false;
            }
            else
            {
                isHeader = true;
            }
            if (isHeader) 
            {
                rv[name]= dataStoreNew.newMultiselectHeader(null, obj.searchable, obj.selected);
            } else { // is item
                rv[name] = dataStoreNew.newMultiselectItem(obj.value, null, obj.searchable, obj.selected);
            }
        }
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
        //jsonData = jsonData.clone()
        return ProcessJson(jsonData);
    }
});