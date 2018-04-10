define(['require', 'jquery', 'data_store/new'], function (require) {
    'use strict';

    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreNew = require('data_store/new');  

    function ProcessXML($parentXml) {
        // return object
        var rv = [];
        $parentXml.children("item").each(function () {
            var child = $(this);
            var name = child.children("name").first().text();
            var value = child.children("value").first().text();
            var searchable = child.children("searchable").first().text();
            var selected = child.children("selected").first().text() === "true";
            var iconClass = child.children("icon").first().text();
            var imagePath = child.children("image").first().text();

            if (child.children("item").length > 0) {// is header

                var children = ProcessXML(child);

                if (children == null || $.isEmptyObject(children)) return null;

                rv.push(dataStoreNew.newMultiselectHeader(
                    name, 
                    children, 
                    null, 
                    searchable, 
                    selected, 
                    imagePath, 
                    iconClass)
                );

            } else { // is item
                if (typeof value === 'undefined' || value === null) {
                    // we deffinitly have a name at this point
                    value = name;
                }
                // get the new data item and store under given name
                rv.push(dataStoreNew.newMultiselectItem(
                    name, 
                    value, 
                    null, 
                    searchable, 
                    selected, 
                    imagePath, 
                    iconClass)
                );
            } 
        });
        return rv;
    }

    return function (xmlString) {
        var parsedXML = null;
        try {
            parsedXML = $($.parseXML(xmlString));
        } catch (ex) {
            return null;
        }
        if (parsedXML == null) return null;
        return ProcessXML(parsedXML.children().first());
    };
});