// defines the basic getters and setters of the data
define(['require',
    'jquery',
    'consts'],function (require, $, CONSTS) {
    'use strict';

    var jquery = $;

    // cached data
    var MultiselectList = {};

    /**
     * Returns true if the name exists in the datbase
     * @param {String} name the name of multiselector
     * @returns {Bool} true if the name exists in multiselector, false otherwise
     */
    function hasName(name) {
        
        if (typeof name == "undefined" ||
            name == null ||
            typeof MultiselectList[name] == "undefined" ||
            MultiselectList[name] == null) 
        {
            return false;
        }
        return true;
    }

    /**
     * Runs a function for each multiselector name
     * @param {Function} func the function to ran for each multiselector name 
     * @returns {Array} An array of outputs sepecifed by the function
     */
    function forEachName(func) {
        var returnArray = [];
        for (var key in MultiselectList) {
            if (MultiselectList.hasOwnProperty(key))
                returnArray.add(func(key));
        }
            
        return returnArray;
    }

    /**
     * Returns the whole multiselecotr data object by name
     * @param {String} name the name of multiselector
     * @return {MuliselectorData} Returns the multiselecotr data if key exists, null otherwise
     */
    function getMultiselect(name) {
        if (hasName(name)) {
            return MultiselectList[name];
        }
        return null;
    }

    /**
     * Adds a new multiselector
     * Note: will not delete previous multiselectors
     * @param {String} name the name of the new multiselector 
     * @param {Element} node the living page node for the element
     * @param {Array} data The data to add under the name of the multiselector
     * @param {object} settings the settings to be used by this multiselector
     * @returns {bool} Returns a true false depending on if the data was inserted
     */
    function addMultiselect(name, node, data, settings, title) {
        if (node == null) return false;
        if (!(node instanceof jquery)) {
            node = $(node);
        }
        if (node.length <= 0) return false;
        if (!hasName(name)) {
            MultiselectList[name] = {
                Data: data,
                Settings: settings,
                Element: node,
                Title: title
            };
            return true;
        }
        return false;
    }

    /**
     * Deletes the multiselector under the name
     * @param {String} name the name of multiselector
     */
    function removeMultiselect(name) {
        delete MultiselectList[name];
    }  

    return {
        forEachName: forEachName,
        getMultiselect: getMultiselect,
        addMultiselect: addMultiselect,
        removeMultiselect: removeMultiselect,
        hasName: hasName,
    };
});