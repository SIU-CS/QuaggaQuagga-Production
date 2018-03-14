'use strict';

define(['require', 'jquery', 'consts', 'data_store/new', 'data_input/load'], function(require) {
    var $, jquery;
    $ = jquery = require('jquery');
    var CONSTS = require('consts');
    var dataStoreNew = require('data_store/new');
    var loadData = require('data_input/load');

    var rootName = CONSTS.MULTISELECTOR_ROOT_NAME();
    $("." + rootName).each(function() {
        var loadType = $(this).data('load-type');
        var loadFunction = $(this).data('load');
        // do something to load the data here
        var data = loadData(loadFunction, loadType);
        dataStoreNew.newMultiselect(this, data);
    });
});