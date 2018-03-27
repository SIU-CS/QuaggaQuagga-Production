define(['require', 'jquery'], function(require) {
    'use strict';
    
    var $, jquery;
    jquery = $ = require('jquery');

    /**
     * Finds either name or @ name within the jsonItem and returns it
     * NOTE: Preference is given to @ name
     * @param {String} name The name of the attribute
     * @param {Object} jsonItem The json object the value will be tried to pull from
     * @param {Bool} remove If true, removes that name from the jsonItem
     */
    function getAttributeFromJSON(name, jsonItem, remove) {
        remove = remove == null || remove == "true" || remove == true;
        var rv = null;
        if ($.isPlainObject(jsonItem) && $.type(name) == "string" && name.length > 0) {
            if(jsonItem['@' + name] != null) {
                rv = jsonItem['@' + name];
                if (remove) delete jsonItem['@' + name];
            } else if(jsonItem[name] != null) {
                rv = jsonItem[name];
                if (remove) delete jsonItem[name];
            }
            return rv;
        }
        return null;
    }

    /**
     * This function takes the object and strips out the data fields from it and returns in a standardized list
     * For gather @attr vs just attr items 
     * @param {Object} jsonItem 
     */
    function getJSONValues(jsonItem)
    {
        var valueNames = ['value', 'searchable', 'selected', 'image', 'icon'];
        var rv = {};

        for (var n in valueNames) {
            if (valueNames[n] != null) {
                rv['@' + valueNames[n]] = getAttributeFromJSON(valueNames[n], jsonItem, true);
            }
        }
        // any special processing we need to do
        rv['@selected'] =  rv['@selected'] == true ||  rv['@selected'] == "true";

        return rv;
    }


    return {
        getJSONValues: getJSONValues,
        getAttributeFromJSON: getAttributeFromJSON
    };
});