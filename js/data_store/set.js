'use strict';

// defines the more advanced error checking getters of the data
define(['require',
    'data_store/get',
    'data_store/cache', 
    'logger',
    'utils/object'],
function (require) {
    var cache = require('data_store/cache');
    var getCache = require('data_store/get');
    var logger = require('logger');
    var objectUtils = require('utils/object');
    
    // sets last active to be name specied if name is a object
    function setLastActive(name) {
        if (!cache.hasName(name)) {
            logger.warn("Last Active Multiselect cannot be set. Name: \"" + name + "\" is not registered. Clearning Last Active");
            cache.setLastActive(null);
            return false;
        } else {
            cache.setLastActive(name);
            return true;
        }
    }
    // replaces the whole data object
    function replaceDataByName(name, data) {
        var multi = dataObj.getMultiselect(name);
        if (multi !== null) {
            multi.data = objectUtils.trimEmptyObjects(data);
            return true;
        }
        return false;
    }

    // force if you want to erase previous data if specified
    function extendDataItemsByName(name, items, force) {
        var multi = dataObj.getMultiselect(name);
        if (multi !== null) {
            multi.data = objectUtils.extend(multi.data, items, force);
            return true;
        }
        return false;
    }

    // accepts a dot string and delete the specifed item
    function deleteDataItemByName(name, dotString) {
        var multi = dataObj.getMultiselect(name);
        if (multi !== null) {
            var deleteItem = objectUtils.dotStringToObject(dotString, null);
            multi.data = objectUtils.extend(multi.data, deleteItem, true);
            return true;
        }
        return false;
    }

    // will extend the options object replacing any you specify
    function setOptionsByName(name, options) {
        var multi = dataObj.getMultiselect(name);
        if (multi !== null) {
            // will overrnamee any other objects
            multi.options = objectUtils.extend(multi.options, options, true);
            return true;
        }
        return false;
    }

    function replaceLastActiveData(data) {
        return setDataByName(getCache.getLastActiveName(), data);
    }

    function setLastActiveOptions(options) {
        return getOptionsByName(getCache.getLastActiveName(), options);
    }

    function extendLastActiveDataItems(items, force) {
        return extendDataItemsByName(getCache.getLastActiveName(), items, force);
    }

    function deleteLastActiveDataItem(dotString) {
        return deleteDataItemByName(getCache.getLastActiveName(), dotString);
    }

    return {
        replaceDataByName: replaceDataByName,
        extendDataItemsByName: extendDataItemsByName,
        setOptionsByName: setOptionsByName,
        deleteDataItemByName: deleteDataItemByName,
        // last active
        setLastActive: setLastActive,
        replaceLastActiveData: replaceLastActiveData,
        setLastActiveOptions: setLastActiveOptions,
        extendLastActiveDataItems: extendLastActiveDataItems,
        deleteLastActiveDataItem: deleteLastActiveDataItem
    }
});
