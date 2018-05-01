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
                var Index = isPopped.length;
                var ItemCheckbox = item['@element'].find(".JSM-checkbox");
                var PoppedItem = poppedItem;

                var remove = function() {
                    if (PoppedItem != null) {
                        PoppedItem.remove();
                        setData.setSelectedForItem(Item, false);
                        isPopped.splice(Index, 1);
                    }
                }
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
                    if (data[i] == null) continue;
                    if (data[i]['@selected']) {
                        rv.push(data[i]);
                    } else if (data[i]['@isHeader']) {
                        rv = rv.concat(recurseChildren(data[i]['@children']));
                    }
                }
                return rv;
            };
            shouldBePopped = recurseChildren(data);

            var shouldElements = shouldBePopped.map(function(item) {
                return item['@element'];
            });
            var isElements = isPopped.map(function(item) {
                return item['item']['@element'];
            });
            for (var i = 0 ; i < isElements.length; i += 1) {
                var index = shouldElements.indexOf(isElements[i]);
                if (index >= 0) {
                    shouldBePopped.splice(index, 1);
                } else {
                    isPopped[i].remove();
                }
            }
            for (var i = 0; i < shouldBePopped.length; i += 1) {
                Popup(shouldBePopped[i], $multiselect);
            }
        }
        $multiselect.on("change", ".JSM-list .JSM-checkbox", onCheckboxChange);
        onCheckboxChange();
    }

    return handler;
});