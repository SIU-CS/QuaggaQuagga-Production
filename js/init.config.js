'use strict';

define(['require', 'jquery', 'consts', 'data_store/new', 'data_input/load', 'data_store/get', 'display/list', 'display/title'], function(require) {
    var $, jquery;
    $ = jquery = require('jquery');
    var CONSTS = require('consts');
    var dataStoreNew = require('data_store/new');
    var dataStoreGet = require('data_store/get');
    var loadData = require('data_input/load');
    var listDisplay = require('display/list');
    var titleDisplay = require('display/title');

    // for each multiselect on the screen
    $("." + CONSTS.MULTISELECTOR_ROOT_NAME()).each(function() {
        var $this = $(this);
        var loadType = $this.data('load-type');
        var loadFunction = $this.data('load');
        // parse data
        var data = loadData(loadFunction, loadType);


        
        // set new data store for multiselect
        var title = $this.data('title');
        var name = dataStoreNew.newMultiselectWithData(this, data, title);
        if (name == null) return;
        $this.empty();
        $this.html(CONSTS.CONST_LAYOUT());
        titleDisplay(name);
        listDisplay(name , $this.find('.list-group-root'));
    });
});