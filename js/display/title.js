'use strict';

define(['require', 'jquery', 'data_store/get'], function(require) {
    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreGet = require('data_store/get');

    /**
     * Finds the data store and pulls the title and element,
     * The find the title-header and adds it to the element
     * @param {String} multiName The name of the multiselect
     */
    return function(multiName) {
        var $ele = dataStoreGet.getElementByName(multiName);
        if ($ele == null) return;
        var title = dataStoreGet.getTitleByName(multiName);
        if (title == null) return;
        $ele.find(".JSM-head .JSM-title").text(title);
    };
});