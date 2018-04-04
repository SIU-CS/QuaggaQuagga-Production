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
        var rv = {}; // returnvalue
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
                        null, 
                        values['@searchable'], 
                        values['@selected'], 
                        values['@image'], 
                        values['@icon']
                    );
                    // Recursive processing
                    header['@children'] = ProcessArray(items);
                    rv[name] = header; 

                } else { // is item
                    if (values['@value'] == null) continue;
                    // get the item and store under the given name 
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
        return rv;
    }

   return function(arrayData) {
        return ProcessArray(arrayData);
   };
});