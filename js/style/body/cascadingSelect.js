define(['require', 
        'jquery', 
        'utility/getMultiselectName', 
        'data_store/get', 'data_store/set', 
        'style/body/checkSelected'], 
    function(require) {
    'use strict';

    var $, jquery;
    jquery = $ = require('jquery');
    var getMultiselectorName = require('utility/getMultiselectName');
    var getData = require('data_store/get');
    var setData = require('data_store/set');
    var checkSelected = require('style/body/checkSelected');

    function SelectAllUnderSelected(cachedSelected, isChecked) {
        for (var key in cachedSelected) {
            // make sure the key is a object, ie not @element or some other
            if ($.isPlainObject(cachedSelected[key]) && cachedSelected[key] != null) {
                var child = cachedSelected[key];
                setData.setSelectedForItem(child, isChecked);
                if (child['@isHeader']) { // if is header check those under it as well
                    SelectAllUnderSelected(child['@children'], isChecked);
                }
            }
        }
    }

    function FindSelectedData(cachedData, callingElement) {
        // if no calling element return null
        if (callingElement == null) return null;
        // try to find the element among the cached data
        for (var key in cachedData) {
            // make sure the key is a object, ie not @element or some other
            if ($.isPlainObject(cachedData[key]) && cachedData[key] != null) {
                var data = cachedData[key];
                // get the elemnt, and if null continue
                if (data['@element'] == null) continue;
                // if the two elements match, return that data
                if(callingElement[0] == data['@element'][0]) {
                    return data;
                }
                // if we have a header, try to recursivly call
                if (data['@isHeader'] == true) {
                    var find = FindSelectedData(data['@children'], callingElement);
                    if (find != null) return find;
                }
            }
        }
        return null;
    }

    /**
     * Sets the on click event for the multiselect
     * @param {jquery element} $multiselect the targeted multiselect  
     */
    function registerCheckboxClick($multiselect) {
        var key = "input.JSM-checkbox:checkbox";

        $multiselect.find(key).on('click', function() {
            event.stopPropagation(); // keep the drop down from expanding
        });
        $multiselect.find(key).on('change', function(event) {
            // find the item
            var $cbox = $(this);
            // if no selected item
            if ($cbox.length <= 0) return;
            // get weather the box is checked or not
            var isChecked = $cbox.is(':checked');

            // get the multiselect name from the item under it
            var multiselectName = getMultiselectorName.byChildElement($cbox);

            if (multiselectName == null) return;
            // get the multiselect data
            var cachedData = getData.getDataByName(multiselectName);
            // find the selected data
            var selectedElement = FindSelectedData(cachedData, $cbox.parent());
            // sets the selected property in the data cache
            setData.setSelectedForItem(selectedElement, isChecked);
            // selects or deselectes all those under the selected element
            SelectAllUnderSelected(selectedElement['@children'], isChecked);
            // checks the whole dataset for those needing to be sleected/deselected
            checkSelected(multiselectName);
        });
    }

    return registerCheckboxClick;
});