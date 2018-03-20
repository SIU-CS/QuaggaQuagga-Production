define(['require', 'jquery', 'data_store/new', 'logger'], function(require) { 
    'use strict';

    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreNew = require('data_store/new');
    var logger = require('logger');

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
                if (array[i]['name'] == null) {
                    continue;
                }
                //get attributes associated with the object 
                var name = array[i]['name'];
                var selected = array[i]['selected'] === true || array[i]['selected'] === "true";
                var searchable = array[i]['searchable'];
                if (searchable == null) 
                { 
                    searchable = '';
                }
                var isHeader = false; //initialize isHeader to false 
                //  If an array has items and items length is greater than 0 , it is a header else it is an item
                if ($.isArray(array[i]['items']) && array[i]['items'].length > 0) {
                    isHeader = true;
                }

                if (isHeader) { // is header
                    var header = dataStoreNew.newMultiselectHeader(null, searchable, selected);
                    // We know it's an array; just double cheking  
                    header = $.extend(ProcessArray(array[i]['items']), header);
                    rv[name] = header; 

                } else { // is item
                    if (array[i]['value'] == null) continue;
                    var value = array[i]['value']; //get the value 
                    // get the item and store under the given name 
                    rv[name] = dataStoreNew.newMultiselectItem(value, null, searchable, selected);
                }
            }
        }
        return rv;
    }

   return function(arrayData) {
        return ProcessArray(arrayData);
   };
});