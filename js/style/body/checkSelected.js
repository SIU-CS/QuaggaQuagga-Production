define(['require', 'jquery', 'utility/getMultiselectName', 'data_store/get', 'data_store/set'], function(require) {
    'use strict';
    
    var $, jquery;
    jquery = $ = require('jquery');
    var getMultiselectorName = require('utility/getMultiselectName');
    var setData = require('data_store/set');
    var getData = require('data_store/get');

    /**
     * Goes through the multiselect and selects/deselects those that need to be based on their children
     * @param {Object} cachedData the multiselect data
     */
    function RecursivelyCheck(cachedData) {
        // if no data return
        if (cachedData == null) return true;
        // a bool checking if all the children are selected
        var isAllSelected = true;
        for (var key in cachedData) {
            // make sure the key is a object, ie not @element or some other
            if ($.isPlainObject(cachedData[key]) && cachedData[key] != null) {
                var child = cachedData[key];
                // if the element is a header, use recursion
                if (child['@isHeader']) {
                    if (!RecursivelyCheck(child)) {
                        isAllSelected = false;
                        setData.setSelectedForItem(child, false);
                    } else {
                        setData.setSelectedForItem(child, true);
                    }
                } else { // otherwise just check if it is selected
                    if (!child['@selected']) isAllSelected = false;
                }
            }
        }
        // return
        return isAllSelected;
    }
    /**
     * Will loop over the data and check any fields that need to be checked based
     * On the children of that data
     * @param {String} name the name of the multiselect
     * @returns {Bool} returns true if success false is failure
     */
    return function(name) {
        var data = getData.getDataByName(name);
        if (data == null) return false;
        RecursivelyCheck(data);
        return true;
    };
});