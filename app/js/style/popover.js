define(['require', 'jquery', 'data_store/get', 'data_store/set', 'style/body/spaceIndent', 'searching/searchHelper'], 
function(require, $, getData, setData, spaceIndent, searchHelper) {
    'use strict';
    
    var jquery = $;
    var isPopped = [];

    // Function to Display popovers after selection
    function Popup(item, $multiselect){
        // Popover Basic style
        var poppedItem = $(            
            '<span class="JSM-popover">'+
                item["@name"] +
                '<span class="fa fa-times JSM-closePopover" style="margin-left: 10px"aria-hidden="true"></span>' +
            '</span>'
        );
        $multiselect.find(".JSM-popoverDisplay").append(poppedItem);

        isPopped.push({
            remove: (function() {
                var Item = item;
                var ItemCheckbox = item['@element'].find(".JSM-checkbox");
                var PoppedItem = poppedItem;

                var remove = function(event) {
                    if (PoppedItem != null && Item != null) {
                        PoppedItem.remove();
                        if (Item['@isHeader'] || event != null)
                            setData.setSelectedForItem(Item, false);

                        var items = isPopped.map(function(p) { return p.item; });
                        var itemIndex = items.indexOf(Item);
                        if (itemIndex >= 0)
                            isPopped.splice(itemIndex, 1);
                    }
                };
                PoppedItem.find(".JSM-closePopover").on("click", remove);
                return remove;
            }()),
            item: item
        });
    }

    //Handler function to retrieve data
    function handler(multiName, $multiselect, settings) {
        var onCheckboxChange = function() {
            var data = getData.getDataByName(multiName);
            var shouldBePopped = [];
            var recurseChildren = function(data) {
                if (data == null) return [];
                var rv = [];
                for (var i in data) {
                    if (data[i] != null && data[i]['@selected']) {
                        rv.push(data[i]);
                    } else if (data[i]['@isHeader']) {
                        rv = rv.concat(recurseChildren(data[i]['@children']));
                    }
                }
                return rv;
            };
            shouldBePopped = recurseChildren(data);

            var i;
            for (i = 0 ; i < isPopped.length; i += 1) {
                var index = -1;
                // finds the index for those that should be popped
                for (var should = 0; should < shouldBePopped.length; should += 1) {
                    if (shouldBePopped[should]['@element'] == isPopped[i]['item']['@element']) {
                        index = should;
                    }
                }
                // if already popped, don't pop again
                if (index >= 0) {
                    shouldBePopped.splice(index, 1);
                } else { // if isPopped should not be, remove it
                    isPopped[i].remove();
                    i -= 1; // adjusts the index
                }
            }
            // all those that should be popped but are not need to be displayed
            for (i = 0; i < shouldBePopped.length; i += 1) {
                Popup(shouldBePopped[i], $multiselect);
            }
        }
        $multiselect.on("change", ".JSM-list .JSM-checkbox", onCheckboxChange);
        onCheckboxChange();
    }

    return handler;
});