// defines the more advanced error checking getters of the data
define(['require',
    'data_store/get',
    'data_store/cache', 
    'logger',
    'jquery'],
function (require) {
    'use strict';

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
        var multi = cache.getMultiselect(name);
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
        var multi = cache.getMultiselect(name);
        if (multi !== null) {
            if (force)
                multi.data = $.extend(multi.data, items);
            else
                multi.data = $.extend(items, multi.data);
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
    function setSettingsByName(name, options) {
        var multi = cache.getMultiselect(name);
        if (multi !== null) {
            // will overrnamee any other objects
            multi.options = $.extend(multi.options, options);
            return true;
        }
        return false;
    }

    /**
     * sets the element for the item as well as sets up handlers
     * @param {JSON item} item the item to add the element to 
     * @param {Jquery element} $ele the jquery element to set for the item   
     */
    function setElementForItem(item, $ele) {
        if ($ele == null || $ele.length <= 0) return;
        if (item == null) return;
        item['@element'] = $ele.first();
    }

    /**
     * Sets the selected option for this item and checks the element
     * @param {Object} item a data item from the cache 
     * @param {Bool} selected true if selected false otherwise
     * @param {Bool} preventChange if true, will not call the on change event
     */
    function setSelectedForItem(item, selected, preventChange) {
        if (item == null) return false;
        // ensure this is a bool
        selected = selected == true || selected == "true";
        var checkbox;
        if (item['@selected'] != selected) {
            item['@selected'] = selected;
            if (item['@element'] != null) {
                checkbox = item['@element'].find('.JSM-checkbox');
                checkbox.prop('checked', selected);
                if (preventChange !== true) {
                    checkbox.change();
                }
            }
        }
        return true;
    }

    return {
        replaceDataByName: replaceDataByName,
        extendDataItemsByName: extendDataItemsByName,
        setSettingsByName: setSettingsByName,
        setSelectedForItem: setSelectedForItem,
        setElementForItem: setElementForItem
    };
});
