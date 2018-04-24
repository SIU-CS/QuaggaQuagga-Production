/**
 * Produces the displayed list for the data in the multiselect
 */
define(['require', 'jquery', 'data_store/get', 'data_store/set', 'display/displayHelper'], 
function(require, $, dataStoreGet, setData, displayHelper) {
    'use strict';
    
    var jquery = $;
    var getHeaderHTML;
    var getItemHTML;

    // variables ensuring unique head ids
    var headCount = 0;

    /**
     * This function iterates through a set of data setting the expected values and producing
     * an appendable jquery list
     * @param {Array} data Standard data format for this project
     * @param {jquery element} $parent A jquery element that will be appended to and searched from
     * @returns jquery nodelist that is formated against the multiselect data
     */
    function ConvertDataToHTML(data, $parent) {
        // if data is not an array
        if (!$.isArray(data)) return null;
        var appender = function(ele) {
            $parent.append(ele);
        };
        // for each multislect name in the data
        for (var i in data) {
            // ensure the name is not part of the multislectItemKeys (i.e. @searchable)
            if (data[i] != null) 
            {
                var item = data[i];
                
                var displayData = displayHelper.getDisplayData(item);
                if(displayData == null) continue;
                
                // if we have a header
                if (displayData.isHeader) {
                    item = getHeaderHTML(item, displayData, appender);
                } else { // else is just a selectable item
                    item = getItemHTML(item, displayData, appender);
                }
                // finds the icon and sets it
                displayHelper.displayImageOrIcon(displayData.image, displayData.icon, item['@element']);
            }
        }
    }

    getHeaderHTML = function(item, displayData, appendFunction) {
        // get the new group id
        var groupId = "JSM-GroupID-" + headCount;
        // update the unique count by 1
        headCount += 1;
        // this is the selectable item (expand button)
        var itemStr = `
            <a data-target="#` + groupId + 
                    `" class="list-group-item JSM-item-header collapsableIcon collapsed"
                    data-toggle="collapse" data-searchable="` + displayData.searchable + `">` +
                    displayHelper.getCheckboxLayout(displayData.selected, displayData.name) +
                '<span class="JSM-itemImage"></span>' +
                displayData.name + `
                <span class="drop-icon"></span>
            </a>
        `;
        // this is the group the above button expands
        var groupStr = `
            <div class="list-group collapse" id="` + groupId + `">
            </div>
        `;
        // get the jquery elements from the above strings
        var $ele = $(itemStr);
        var $group = $(groupStr);// the list group under the header

        // set the element portion of the data item
        setData.setElementForItem(item, $ele);
        // set all the inner data for the group
        ConvertDataToHTML(item['@children'], $group);
        // add the button and the group
        appendFunction([$ele, $group], item);
        return item;
    };

    getItemHTML = function(item, displayData, appendFunction) {
        // string format
        var eleString = `
        <span class="list-group-item" data-searchable="` + displayData.searchable + 
            `" data-value="` + displayData.value + `">` +
            displayHelper.getCheckboxLayout(displayData.selected, displayData.name, displayData.value) +
            '<span class="JSM-itemImage"></span>' +
            displayData.name + `
        </span>
        `;
        // get the jquery element
        var $ele = $(eleString);
        // set the element portion in the data cache
        setData.setElementForItem(item, $ele);
        // add it to the parent element
        appendFunction($ele, item);
        return item;
    };

    
    /**
     * Function finds the multiselect, takes the cached data and turns it into html
     * @param {String} multiselectName Name of the multiselect with data
     * @returns {Jquery HTML elements} A html list, but does already append it to the element
     */
    function init($ele, multiselectName) {
        // gets the multiselect data and elements
        var multiselectData = dataStoreGet.getDataByName(multiselectName);
        // finds the root of the list so we can append to it
        var $listRoot = $ele.find('.list-group-root').first();
        if ($listRoot == null || $listRoot.length <= 0) return null;
        // this is the starting node we are appending to
        var $html = $('<div class="list-group in"></div>');
        // recursivly append data to the html node list
        ConvertDataToHTML(multiselectData, $html);
        // add the list items to the list root
        $listRoot.append($html);
        // return the list item (non-null) to the caller
        return $html;
    }

    // finds the elements that are not displayed and shows them
    function displayMissing(multiselectName) {
        // check if data has previously been loaded
        var $multiselect = dataStoreGet.getElementByName(multiselectName);
        // if not will run init
        if ($multiselect.find(".list-group-root .list-group").length < 0) {
            return init($multiselect, multiselectName);
        }
        var appender = function($ele, item) {
            if (item == null) return;

            var myItemList = item["@parent"] != null ? item["@parent"]["@children"] : null;
            var parentElement = item["@parent"] != null ? item["@parent"]["@element"] : null;
            if (myItemList == null || parentElement == null) { // if parent is null then we are at the root
                myItemList = dataStoreGet.getDataByName(multiselectName);
                parentElement = dataStoreGet.getElementByName(multiselectName).find(".list-group-root > .list-group");
            }
            for (var i = 0; i < myItemList.length; i += 1) {
                if (myItemList[i] == item) {
                    if (i == 0) {
                        parentElement.prepend($ele);
                    } else if (myItemList[i - 1]['@element'] != null) {
                        var insertAfter = myItemList[i - 1]['@element'];
                        if (myItemList[i - 1]['@isHeader']) {
                            insertAfter = $(myItemList[i - 1]['@element'].data("target"));
                        }
                        $ele.insertAfter(insertAfter);
                    } else {
                        parentElement.append($ele);
                    }
                    break;
                }
            }
        };
        dataStoreGet.forEachItemInMutiselect(multiselectName, function(item) {
            if (item['@element'] == null) {
                var displayData = displayHelper.getDisplayData(item);
                if(displayData == null) return;
                if (item['@isHeader']) {
                    getHeaderHTML(item, displayData, appender);
                    return false;
                } else {
                    getItemHTML(item, displayData, appender);
                }
            }
        });
    }

    return {
        init: init,
        displayMissing: displayMissing
    };
});