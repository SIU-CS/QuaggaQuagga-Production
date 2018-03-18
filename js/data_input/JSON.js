'use strict';

define(['require', 'jquery', 'data_store/new'], function(require) {
    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreNew = require('data_store/new');
    /**
     * This function is used to process the JSON data 
     * remove any null keys 
     * to distinguish between the special keys(@..)and the normal one
    */
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
                if (children != null) //It is nested
                {
                    rv[name] = $.extend(children, header);
                }
                
            } else 
            { // is item
                rv[name] = dataStoreNew.newMultiselectItem(value, null, searchable, selected);
            }
        }

        if ($.isEmptyObject(rv)) 
            return null;//The ibject is empty
        return rv;
    }
    /**
     * this function takes the JSON data as a parameter
     * checks whether the data is JSON or not
     * clone the JSON data
     * process the JSON data
    */
    return function(jsonData) 
    {
        if(typeof jsonData !='object') //Checking whether the data read is object 
        {
            try {
                jsonData = $.parseJSON(jsonData);//Ot takes the JSON data nd return the JavaScript value
            } catch(err) {
                console.warn("Data is not json or json parsable")//Throw error if data is not JSON format
                return null;
            }
        }
        //merge the JSON data within another empty file or making a copy of the JSON data
        jsonData = $.extend(true, {}, jsonData);
        
        return ProcessJson(jsonData);
    }
});