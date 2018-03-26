'use strict';

define(['require', 'jquery', 'data_store/new'], function (require) {
    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreNew = require('data_store/new');
    

    function ProcessXML(xmlFile) {
        if (!$.isXMLDoc(xmlFile)) return null;
        var rv = {};
        var parser, xmlDoc;

        parser = new DOMParser();
        xmlDoc = parser.parseFromString(xmlFile, "text/xml");
        // checks for nodes past the first and treats those as suboptions
        var options = xmlDoc.documentElement.childNodes[0];
        console.log(options);
        for (var i = 0; i < options.length; i++) {
            var name = options[i].textContent;
            var selected = options.nodeType == "selected";
            var searchable = options.nodeType == "searchable";

            if (options.childNodes.length == 0) { // if an option doesn't have suboptions
                rv[name] = dataStoreNew.newMultiselectItem(options[i].textContent, null, searchable, selected);
            } else if (options.childNodes.length > 0) { // if an option has suboptions
                header = dataStoreNew.newMultiselectHeader(null, searchable, selected);
                header = $.extend(ProcessXML(options[i].childNodes), header);
                rv[name] = header;
            }
        }
        return rv;
    }
});