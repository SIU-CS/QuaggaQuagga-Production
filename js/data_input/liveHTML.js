'use strict';

define(['require', 'jquery', 'data_store/new'], function(require) {
    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreNew = require('data_store/new');

    function recurseivlyProcessHTML(jqueryHTML) {

    }

    return function(nodeList) {
        if (!(nodeList instanceof jquery)) {
            nodeList = $(nodeList).clone();
        }
        var data = {};
        data['item 1'] = dataStoreNew.newMultiselectHeader(null, "search-1", false);
        data['item 1']['item 1-1'] = dataStoreNew.newMultiselectHeader(null, "search-1-1", false);
        data['item 1']['item 1-1']['item 1-1-1'] = dataStoreNew.newMultiselectItem("1-1-1", null, "search-1-1-1", false);
        data['item 1']['item 1-2'] = dataStoreNew.newMultiselectHeader(null, "search-1-2", false);
        data['item 1']['item 1-2']['item 1-2-1'] = dataStoreNew.newMultiselectItem("1-2-1", null, "search-1-2-1", false);
        data['item 2'] = dataStoreNew.newMultiselectItem("2", null, "search-2", false);

        return data;
    }
});