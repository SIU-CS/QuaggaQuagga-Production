/**
 * Procudes the displayed list for the data in the multiselect
 */
define(['require', 'jquery', 'data_store/get'], function(require) {
    'use strict';
    
    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreGet = require('data_store/get');

    // variables ensuring unique head ids
    var headCount = 0;

    /**
     * Returns a string that is a input type check
     * @param {Bool} checked Sets the input to checked or not
     * @param {String} name The name of the input
     * @param {*} value The value for the input field
     */
    function getCheckboxLayout(checked, name, value) {
        return `
        <input type="checkbox" class='checkbox JSM-checkbox' ` +
        (value != null ? "value=\""+ value +"\"": "") +
        // returns "on" if no value and a name
        (value != null && name != null ? "name=\""+ name +"\"": "") +
        (checked ? "checked=\"checked\"" : "") + `>`;
    }

    /**
     * Checks if a url holds a viable image
     * @param {String} url The image URL
     * @param {Function} callback Returns true if ir loaded fine, false otherwise
     */
    function imageExists(url, callback) {
        var img = new Image();
        img.onload = function() { callback(true); };
        img.onerror = function() { callback(false); };
        img.src = url;
     }

    /**
     * Gets the icon/image element and returns it in a callback function
     * Retuns null if no image/icon exists
     * @param {String} imagePath the path to the image
     * @param {String} icon the class to be applied to a icon tag
     * @param {Jquery Element} $elementP The parent element ot append the icon class to 
     */
    function displayIconImage(imagePath, icon, $elementP) {
        var $display = $elementP.find('.JSM-itemImage');
        if ($display.length <= 0) return;
        
        var displayIcon = function() {
            if ($.type(icon) == "string" && icon != "") {
                $display.empty();
                $display.append($('<i class="'+ icon +'" aria-hidden="true"></i>'));
            }
            return null;
        };
        if ($.type(imagePath) == "string" && imagePath != "") {
            imageExists(imagePath, function(exists) {
                if (exists) {
                    var $imgEle = $('<img src="'+imagePath+'">');
                    $display.empty();
                    $display.append($imgEle);
                } else {
                    console.warn('Error displaying Image: "'+ imagePath +'", will fall back to Icon if exists...');
                    displayIcon();
                }
            });

        } else {
            displayIcon();
        }
    }

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
                // gets the name for the data item
                var name = item["@name"];
                if (name == "") continue;

                var $ele;
                // gets the value if it is a header
                var isHeader = item["@isHeader"] == null ? false : item["@isHeader"];
                // the value for the data item
                var value = (item["@value"] == null ? "" : item["@value"]).trim();
                // extra searchable text
                var searchText = item["@searchable"] == null ? "" : item["@searchable"];
                // check if the data is already selected
                var isSelected = item["@selected"] == null ? false : item["@selected"];
                // gets the icon
                var icon = item["@icon"] == null ? "" : item["@icon"];
                // gets the image
                var image = item["@image"] == null ? "" : item["@image"];
                
                // if we have a header
                if (isHeader) {
                    // get the new group id
                    var groupId = "JSM-GroupID-" + headCount;
                    // update the unique count by 1
                    headCount += 1;
                    // this is the selectable item (expand button)
                    var itemStr = `
                        <a href="#` + groupId + `" class="list-group-item JSM-item-header collapsableIcon collapsed"
                                data-toggle="collapse" data-searchable="` + searchText + `">` +
                            getCheckboxLayout(isSelected, name) +
                            '<span class="JSM-itemImage"></span>' +
                            name + `
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
                        <span class="list-group-item" data-searchable="` + searchText + 
                            `" data-value="` + value + `">` +
                            getCheckboxLayout(isSelected, name, value) +
                            '<span class="JSM-itemImage"></span>' +
                            name + `
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
                displayIconImage(image, icon, $ele);
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