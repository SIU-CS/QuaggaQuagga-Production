/**
 * Produces the displayed list for the data in the multiselect
 */
define(['require', 'jquery', 'data_store/get', 'display/displayHelper'], 
function(require, $, dataStoreGet, displayHelper) {
    'use strict';
    
    var jquery = $;

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
        // for each multislect name in the data
        for (var i in data) {
            // ensure the name is not part of the multislectItemKeys (i.e. @searchable)
            if (data[i] != null) 
            {
                var item = data[i];

                var $ele;
                
                var displayData = displayHelper.getDisplayData(item);
                if(displayData == null) continue;
                
                // if we have a header
                if (displayData.isHeader) {
                    // get the new group id
                    var groupId = "JSM-GroupID-" + headCount;
                    // update the unique count by 1
                    headCount += 1;
                    // this is the selectable item (expand button)
                    var itemStr = `
                        <a href="#` + groupId + `" class="list-group-item JSM-item-header collapsableIcon collapsed"
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
                    $ele = $(itemStr);
                    var $group = $(groupStr);// the list group under the header

                    // add the button
                    $parent.append($ele);
                    // set all the inner data for the group
                    ConvertDataToHTML(item['@children'], $group);
                    // add the group
                    $parent.append($group);
                    // set the element portion of the data item
                    item["@element"] = $ele;
                } else { // else is just a selectable item
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
                    $ele = $(eleString);
                    // add it to the parent element
                    $parent.append($ele);
                    // set the element portion in the data cache
                    item["@element"] = $ele;
                }
                // finds the icon and sets it
                displayHelper.displayImageOrIcon(displayData.image, displayData.icon, $ele);
            }
        }
    }
    /**
     * Function finds the multiselect, takes the cached data and turns it into html
     * @param {String} multiselectName Name of the multiselect with data
     * @returns {Jquery HTML elements} A html list, but does already append it to the element
     */
    function listFunction($ele, multiselectName) {
        // gets the multiselect data and elements
        var multiselectData = dataStoreGet.getDataByName(multiselectName);s
        var $ele = dataStoreGet.getElementByName(multiselectName);
        onsearchDo($ele);
        // finds the root of the list so we can append to it
        var $listRoot = $ele.find('.list-group-root').first();
        if ($listRoot == null || $listRoot.length <= 0) return null;
        // this is the starting node we are appending to
        var $html = $('<div class="list-group"></div>');
        // recursivly append data to the html node list
        ConvertDataToHTML(multiselectData, $html);
        // add the list items to the list root
        $listRoot.append($html);
        // return the list item (non-null) to the caller
        return $html;
    }

    function onsearchDo($ele) {
        $ele.find(".JSM-head .JSM-search .JSM-searchbar").on('input', function() {
            $('.JSM-body').collapse()
        });
    }

    return listFunction;
});