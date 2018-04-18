define(['require', 
        'jquery', 
        'utility/getMultiselectName', 
        'data_store/get', 'data_store/set'], 
    function(require) {
    'use strict';

    var $, jquery;
    jquery = $ = require('jquery');
    var getMultiselectorName = require('utility/getMultiselectName');
    var getData = require('data_store/get');
    var setData = require('data_store/set');

    /**
     * Sets the on click event for the multiselect
     * @param {jquery element} $multiselect the targeted multiselect  
     */
    function registerCheckboxClick(name, $multiselect) {
        var key = "input.JSM-checkbox:checkbox";
        if (name == null) return;

        $multiselect.find(key).on('click', function() {
            event.stopPropagation(); // keep the drop down from expanding
        });

        getData.forEachItemInMutiselect(name, function(item) {
            // a colsure so we can keep the references variables
            (function() {
                var Item = item;
                var Name = name;
                if (Item["@isHeader"]) {
                    // finds all the checkboxes under the header
                    var childItems = $(Item["@element"].data("target"))
                                    .find(".list-group-item").not(".JSM-item-header").find(key);
                    // if any of them change, see if we need to change the header to unchecked
                    childItems.on('change', function(event) {
                        if (childItems.filter(":checked").length != childItems.length) {
                            setData.setSelectedForItem(Item, false);
                        } else {
                            setData.setSelectedForItem(Item, true);
                        }
                    });
                    // if we select a header, and that header has focus, then check the child items
                    Item["@element"].find(key).first().on('change', function(event) {
                        var isChecked = $(this).is(':checked');
                        if ($(this).is(":focus")) {
                            var setItems = null;
                            if (isChecked) {
                                setItems = childItems.not(":checked");
                            } else {
                                setItems = childItems.filter(":checked");
                            }
                            // its okay for us to set this here, because the individual items handle
                            // setting selected in the cache to true/false
                            if (setItems != null) setItems.prop('checked', isChecked).change();
                        }
                    });
                } else { // is an item
                    // find the checkbox and update the cache on change
                    Item['@element'].find(key).on('change', function(event) {
                        var isChecked = $(this).is(':checked');
                        setData.setSelectedForItem(Item, isChecked);
                    });
                }
            }());
        });
        var HeaderItems = $multiselect.find(".list-group-item.JSM-item-header").has(key + ":checked");
        HeaderItems.each(function() {
            $($(this).data("target")).find(".list-group-item:not(.JSM-header) " + key).prop('checked', true);
        });
        $multiselect.find(".list-group-item").find(key + ":checked").change();
    }

    return registerCheckboxClick;
});