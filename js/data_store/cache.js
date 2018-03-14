'use strict';

// defines the basic getters and setters of the data
define(['require',
    'jquery',
    'consts'],function (require) {
    var $, jquery;
    jquery = $ = require('jquery');
    var CONSTS = require('consts');

    // cached data
    var MultiselectList = {};

    /**
     * Runs a function for each multiselector name
     * @param {Function} func the function to ran for each multiselector name 
     * @returns {Array} An array of outputs sepecifed by the function
     */
    function forEachName(func) {
        var returnArray = [];
        for (var key in MultiselectList)
            returnArray.add(func(key));
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
     * @param {object} data The object to add under the name of the multiselector
     * @param {object} settings the settings to be used by this multiselector
     * @returns {bool} Returns a true false depending on if the data was inserted
     */
    function addMultiselect(name, node, data, settings) {
        if (typeof node == undefined || node == null || $(node).length <= 0) return false;
        if (!hasName(name)) {
            MultiselectList[name] = {
                Data: data,
                Settings: settings,
                Element: node
            };
            return true;
        }
        return false
    }

    /**
     * Deletes the multiselector under the name
     * @param {String} name the name of multiselector
     */
    function removeMultiselect(name) {
        delete MultiselectList[name];
    }

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
    // used by getUniqueNameNo
    var uniqueNameNo = 0;
    /** 
     * @returns {Number} returns a unique number based on how many time this function has been called
    */
    function getUniqueNameNo() {
        uniqueNameNo += 1;
        return uniqueNameNo;
    }

    

    return {
        forEachName: forEachName,
        getMultiselect: getMultiselect,
        addMultiselect: addMultiselect,
        removeMultiselect: removeMultiselect,
        hasName: hasName,
        setLastActive: setLastActive,
        getLastActive: getLastActive,
        getUniqueNameNo: getUniqueNameNo,
    };
});