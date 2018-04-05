define(['require', 
        'jquery',  
        'data_store/new', 
        'data_input/load',
        'utility/verifySettings',
        'data_store/get', 
        'display/display.config', 
        'style/style.config',
        'data_output/interface',
        'searching/searching.config',
        'consts'
    ], function(require, $, dataStoreNew, loadData, verifySettings,
         dataStoreGet, displayConfig, styleConfig, outputModule, searchConfig) {
    'use strict';
    var jquery = $;
    var CONSTS = require("consts");

    // for each multiselect on the screen
    $("." + CONSTS.MULTISELECTOR_ROOT_NAME()).each(function() {
        var $this = $(this);
        // get the data items from the list
        var loadType = $this.data('load-type'); // the type of data the developer is giving
        var loadFunction = $this.data('load'); // the function to call to get the data
        var settings = verifySettings($this.data('settings')); // the type of data the developer is giving
        var title = $this.data('title'); // the title of the multiselect, defaults to name if not set
        // parse the data from the above function
        var data = loadData(loadFunction, loadType);
        // set new data store for multiselect
        var name = dataStoreNew.newMultiselect(this, data, settings, title);
        // if we couldn't set a new data store, error here
        if (name == null) return;
        // display list and title
        displayConfig(name);
        // configure the searching
        searchConfig(name);
        // check those selected in the list
        styleConfig($this, name);
    });
});