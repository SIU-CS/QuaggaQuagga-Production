define(['require', 'jquery', 'data_store/new', 'logger', 'data_input/inputHelper'], function(require) { 
    'use strict';

    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreNew = require('data_store/new');
    var logger = require('logger');
    var helper = require('data_input/inputHelper');

    /**
     * An internal function that recurses over the input array data and builds 
     * the Multiselect data cache 
     * @param {type} array array inputted data 
     * @return {object} the multiselect formatted data in JSON object
     */
    function ProcessArray(array) {
        if(!$.isArray(array)) return null; // if the input is not an array 
        var rv = []; // returnvalue
        for (var i in array) { // for every item in the array check 
            if ($.isPlainObject(array[i])) {

                //get attributes associated with the object
                var name = helper.getAttributeFromJSON('name', array[i], true);
                if (name == null) continue;

                var items = helper.getAttributeFromJSON('items', array[i], true);

                var values = helper.getJSONValues(array[i]);

                //  If items length is greater than 0 , it is a header else it is an item
                if ($.isArray(items) && items.length > 0) { // is header
                    var header = dataStoreNew.newMultiselectHeader(
                        name,
                        ProcessArray(items), // Recursive processing
                        null, 
                        values['@searchable'], 
                        values['@selected'], 
                        values['@image'], 
                        values['@icon']
                    );
                    if (header == null) continue;
                    
                    rv.push(header); 

                } else { // is item
                    if (values['@value'] == null) continue;
                    // get the item and store under the given name
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

   return function(arrayData) {
        var clonedArrayData = JSON.parse(JSON.stringify(arrayData));
        return ProcessArray(clonedArrayData);
   };
});