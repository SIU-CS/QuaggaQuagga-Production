'use strict';

/**
 * Produces the displayed list for the data in the multiselect
 */
define(['require', 'jquery', 'data_store/get'], function(require) {
    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreGet = require('data_store/get');

    // variables ensuring unique head ids
    var headCount = 0;

    /**
     * This function iterates through a set of data setting the expected values and producing
     * an appendable jquery list
     * @param {JSON object} data Standard JSON data format for this project
     * @param {jquery element} $parent A jquery element that will be appended to and searched from
     * @returns jquery nodelist that is formated against the multiselect data
     */
    function ConvertDataToHTML(data, $parent) {
        // if data is not an object
        if (!$.isPlainObject(data)) return null;
        // for each multislect name in the data
        for (var name in data) {
            // ensure the name is not part of the multislectItemKeys (i.e. @searchable)
            if (dataStoreGet.getMultiselectItemKeys().indexOf(name) >= 0) continue;
             if(data[name] == null) continue;
            
            // gets the value if it is a header
            var isHeader = data[name]["@isHeader"] == null ? false : data[name]["@isHeader"];
            // the value for the data item
            var value = (data[name]["@value"] == null ? "" : data[name]["@value"]).trim();
            // extra searchable text
            var searchText = data[name]["@searchable"] == null ? "" : data[name]["@searchable"];
            // check if the data is already selected
            var isSelected = data[name]["@selected"] == null ? false : data[name]["@selected"];
            
            // if we have a header
            if (isHeader) {
                // get the new group id
                var groupId = "JSM-GroupID-" + headCount;
                // update the unique count by 1
                headCount += 1;
                // this is the selectable item (expand button)
                var itemStr = `
                    <a href="#` + groupId + `" class="list-group-item JSM-item-header collapsableIcon collapsed" data-toggle="collapse" data-searchable="` + searchText + `">
                        <input type="checkbox" class='checkbox JSM-checkbox' ` + (isSelected ? "checked" : "") + `>
                        ` + name + `
                        <span class="drop-icon"></span>
                    </a>
                `;
                // this is the group the above button expands
                var groupStr = `
                    <div class="list-group collapse" id="` + groupId + `">
                    </div>
                `;
                // get the jquery elements from the above strings
                var $item = $(itemStr);
                var $group = $(groupStr);

                // add the button
                $parent.append($item);
                // set all the inner data for the group
                ConvertDataToHTML(data[name], $group);
                // add the group
                $parent.append($group);
                // set the element portion of the data item
                data[name]["@element"] = $item;
            } else { // else is just a selectable item
                // string format
                var eleString = `
                    <span class="list-group-item" data-searchable="` + searchText + ` data-value="` + value + `">
                    <input type="checkbox" class='checkbox JSM-checkbox' ` + (isSelected ? "checked" : "") + ` name="`+ name +`" value="` + value + `">
                    ` + name + `
                    </span>
                `;
                // get the jquery element
                var $ele = $(eleString);
                // add it to the parent element
                $parent.append($ele);
                // set the element portion in the data cache
                data[name]["@element"] = $ele;
            }
        }
    }
    /**
     * Function finds the multiselect, takes the cached data and turns it into html
     * @param {String} multiselectName Name of the multiselect with data
     * @returns {Jquery HTML elements} A html list, but does already append it to the element
     */
    function listFunction(multiselectName) {
        // gets the multiselect data and elements
        var multiselectData = dataStoreGet.getDataByName(multiselectName);
        var $ele = dataStoreGet.getElementByName(multiselectName);
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
    return listFunction;
});