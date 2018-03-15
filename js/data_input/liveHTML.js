'use strict';

define(['require', 'jquery', 'data_store/new'], function(require) {
    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreNew = require('data_store/new');

    // private function for recursion
    function recurseivlyProcessHTML(jqueryHTML) {

    }

    /**
     * This function processes a live nodelist or jquery node list into
     * a data format that can be stored by the multiselect
     * @param {Jquery or HTML nodelist} nodeList data will be extracted from this item
     */
    return function(nodeList) {
        // checks to make sure the list is jquery
        if (!(nodeList instanceof jquery)) {
            nodeList = $(nodeList);
        }
        // clones the list so we don't mess it up
        nodeList = nodeList.clone();

        // test data
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