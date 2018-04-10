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
        var rv = [];
        for(var name in jsonData) {
            if(typeof jsonData[name] =='object' && jsonData[name] != null) 
            {
                // get then delete object attributes here
                var values = helper.getJSONValues(jsonData[name]);

                if(values['@value'] == null) // is header
                {
                    var children = ProcessJson(jsonData[name]);
                    if (children == null) continue;
                    var header = dataStoreNew.newMultiselectHeader(
                        name,
                        children,
                        null,
                        values['@searchable'], 
                        values['@selected'], 
                        values['@image'], 
                        values['@icon']
                    );
                    rv.push(header);             
                } else 
                { // is item
                    var item = dataStoreNew.newMultiselectItem(
                        name,
                        values['@value'], 
                        null, 
                        values['@searchable'], 
                        values['@selected'], 
                        values['@image'], 
                        values['@icon']
                    );
                    if (item == null) continue;
                    rv.push(item);
                }
            }
        }
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