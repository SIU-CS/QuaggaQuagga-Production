'use strict';

define(['require', 'jquery', 'consts', 'data_store/new', 'data_input/load', 'data_store/get', 'display/list'], function(require) {
    var $, jquery;
    $ = jquery = require('jquery');
    var CONSTS = require('consts');
    var dataStoreNew = require('data_store/new');
    var dataStoreGet = require('data_store/get');
    var loadData = require('data_input/load');
    var listDisplay = require('display/list');
    // for each multiselect on the screen
    $("." + CONSTS.MULTISELECTOR_ROOT_NAME()).each(function() {
        var $this = $(this);
        var loadType = $this.data('load-type');
        var loadFunction = $this.data('load');
        // parse data
        var data = loadData(loadFunction, loadType);
        // set new data store for multiselect
        var name = dataStoreNew.newMultiselect(this, data);
        if (name == null) return;
        $this.empty();
        $this.html(CONSTS.CONST_LAYOUT());
        listDisplay(name , $this.find('.list-group-root'));
    });
});