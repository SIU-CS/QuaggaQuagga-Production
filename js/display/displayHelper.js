define(['require',
        'jquery'
    ], 
function(require, $) {
    'use strict';
    var jquery = $;

    /**
     * Returns a string that is a input type check
     * @param {Bool} checked Sets the input to checked or not
     * @param {String} name The name of the input
     * @param {*} value The value for the input field
     */
    function getCheckboxLayout(checked, name, value) {
        return `
        <input type="checkbox" class='checkbox JSM-checkbox' ` +
        "value=\"" + (value != null ? value: "") + "\"" +
        // returns "on" if no value and a name
        "name=\""+ (name != null && value != null ?  name : "")+"\"" +
        (checked ? "checked=\"checked\"" : "") + `>`;
        
    }

     /**
      * Gets and returns a json item with the correct formatted data
      * @param {JSON} item the object you want to get the data from
      */
    function getDisplayData(item) {
        var name = item["@name"];
        if (name == "") return null;
        // gets the value if it is a header
        var isHeader = item["@isHeader"] == null ? false : item["@isHeader"];
        // the value for the data item
        var value = (item["@value"] == null ? "" : item["@value"]).trim();
        // extra searchable text
        var searchable = item["@searchable"] == null ? "" : item["@searchable"];
        // check if the data is already selected
        var selected = item["@selected"] == null ? false : item["@selected"];
        // gets the icon
        var icon = item["@icon"] == null ? "" : item["@icon"];
        // gets the image
        var image = item["@image"] == null ? "" : item["@image"];
        return {
            name: name,
            isHeader: isHeader,
            value: value,
            searchable: searchable,
            selected: selected,
            icon: icon,
            image: image
        };
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
    function displayImageOrIcon(imagePath, icon, $elementP) {
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

    return {
        displayImageOrIcon: displayImageOrIcon,
        getDisplayData: getDisplayData,
        getCheckboxLayout: getCheckboxLayout
    };
});