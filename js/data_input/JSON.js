define(['require', 'jquery', 'data_store/new', 'data_input/inputHelper'], function(require) {
    'use strict';
    
    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreNew = require('data_store/new');
    var helper = require('data_input/inputHelper');
    /**
     * This function is used to process the JSON data 
     * remove any null keys 
     * to distinguish between the special keys(@..)and the normal one
    */
    function ProcessJson(jsonData)
    {
        var rv = {};
        for(var name in jsonData) {
            if(typeof jsonData[name] =='object' && jsonData[name] != null) 
            {
                // get then delete object attributes here
                var values = helper.getJSONValues(jsonData[name]);

                if(values['@value'] == null) // is header
                {
                    var header = dataStoreNew.newMultiselectHeader(
                        null,
                        values['@searchable'], 
                        values['@selected'], 
                        values['@image'], 
                        values['@icon']
                    );
                    var children = ProcessJson(jsonData[name]);
                    if (children != null) //It is nested
                    {
                        rv[name] = $.extend(children, header);
                    }
                    
                } else 
                { // is item
                    rv[name] = dataStoreNew.newMultiselectItem(
                        values['@value'], 
                        null, 
                        values['@searchable'], 
                        values['@selected'], 
                        values['@image'], 
                        values['@icon']
                    );
                }
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
                console.warn("Data is not json or json parsable"); //Throw error if data is not JSON format
                return null;
            }
        }
        //merge the JSON data within another empty file or making a copy of the JSON data
        jsonData = $.extend(true, {}, jsonData);
        
        return ProcessJson(jsonData);
    };
});