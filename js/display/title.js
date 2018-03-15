'use strict';

define(['require', 'jquery', 'data_store/get'], function(require) {
    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreGet = require('data_store/get');

    return function(multiName) {
        var $ele = dataStoreGet.getElementByName(multiName);
        if ($ele == null) return;
        var title = dataStoreGet.getTitleByName(multiName);
        if (title == null) return;
        $ele.find(".JSM-head .JSM-title").text(title);
    };
});