'use strict';

// defines the more advanced error checking getters of the data
define(['require',
    'data_store/get',
    'data_store/cache', 
    'logger',
    'jquery'],
function (require) {
    var $, jquery;
    $ = jquery = require('jquery');
    var cache = require('data_store/cache');
    var getCache = require('data_store/get');
    var logger = require('logger');

    /**
     * deletes the old data for a multiselect and specifies new data
     * @param {String} name Multiselect Name
     * @param {Object} data The new data object to associate with the multiselects
     * @returns {Bool} True if successful, false otherwise
     */
    function replaceDataByName(name, data) {
        var multi = dataObj.getMultiselect(name);
        if (multi !== null) {
            multi.data = data;
            return true;
        }
        return false;
    }

    /**
     * Extends the data associated with a multiselect
     * @param {String} name The multiselect name
     * @param {Object} items The items to add/replace with
     * @param {Bool} force if force is specified, the new items will overwrite any existing items
     * @returns {Bool} True if successful, false otherwise
     */
    function extendDataItemsByName(name, items, force) {
        var multi = dataObj.getMultiselect(name);
        if (multi !== null) {
            if (force)
                multi.data = $.extend(multi.data, data);
            else
                multi.data = $.extend(data, multi.data);
            return true;
        }
        return false;
    }

    /**
     * Sets optiosn by name, Hint always extends with current options (force replaces)
     * @param {String} name The multiselect name
     * @param {Object} options The new optiosn to replace the old
     * @returns {Bool} True if successful, false otherwise
     */
    function setOptionsByName(name, options) {
        var multi = dataObj.getMultiselect(name);
        if (multi !== null) {
            // will overrnamee any other objects
            multi.options = $.extend(multi.options, options);
            return true;
        }
        return false;
    }

    return {
        replaceDataByName: replaceDataByName,
        extendDataItemsByName: extendDataItemsByName,
        setOptionsByName: setOptionsByName
    }
});
