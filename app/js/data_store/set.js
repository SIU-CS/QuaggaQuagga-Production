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
            multi.Data = data;
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
                multi.Data = $.extend(multi.Data, items);
            else
                multi.Data = $.extend(items, multi.Data);
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
     * Sets the selected option for this item and checks the element
     * @param {Object} item a data item from the cache 
     * @param {Bool} selected true if selected false otherwise
     * @param {Bool} preventChange if true, will not call the on change event
     */
    function setSelectedListenerForItem(item) {
        if (item == null) return false;
        // ensure this is a bool
        (function() {
            var Item = item;
            Item['@element'].find(".JSM-checkbox").on('change', function() {
                if (Item != null)
                    Item['@selected'] = this.checked;
            });
        }());
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
        setSelectedListenerForItem(item);
    }

    /**
     * sets the selected value for the ckeckboxs
     * @param {JSON item} item the item find the checkbox for
     * @param {BOOL} checked the vaue to set the checkbox tos
     */
    function setSelectedForItem(item, checked) {
        checked = checked === true;
        if (item['@selected'] === checked) return;
        var ItemCheckbox = item['@element'].find(".JSM-checkbox");

        if (item['@isHeader']) {
            ItemCheckbox.trigger("click");
        } else {
            ItemCheckbox.prop("checked", checked);
            ItemCheckbox.change();
        }
    }

    return {
        replaceDataByName: replaceDataByName,
        extendDataItemsByName: extendDataItemsByName,
        setSettingsByName: setSettingsByName,
        setElementForItem: setElementForItem,
        setSelectedForItem: setSelectedForItem
    };
});
