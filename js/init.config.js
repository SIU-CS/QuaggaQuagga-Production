define(['require', 
        'jquery', 
        'consts', 
        'data_store/new', 
        'data_input/load', 
        'data_store/get', 
        'display/list', 
        'display/title',
        'style/style.config'
    ], function(require, $, CONSTS, dataStoreNew, loadData, dataStoreGet, listDisplay, titleDisplay, styleConfig) {
    'use strict';
    var jquery = $;

    // for each multiselect on the screen
    $("." + CONSTS.MULTISELECTOR_ROOT_NAME()).each(function() {
        var $this = $(this);
        // get the data items from the list
        var loadType = $this.data('load-type'); // the type of data the developer is giving
        var loadFunction = $this.data('load'); // the function to call to get the data
        var title = $this.data('title'); // the title of the multiselect, defaults to name if not set
        // parse the data from the above function
        var data = loadData(loadFunction, loadType);

        // set new data store for multiselect
        var name = dataStoreNew.newMultiselect(this, data, null, title);
        // if we couldn't set a new data store, error here
        if (name == null) return;
        // empty the element
        $this.empty();
        // get the basic layout
        $this.html(CONSTS.CONST_LAYOUT());
        // display the title
        titleDisplay(name);
        // display the data list
        listDisplay(name);
        // check those selected in the list
        styleConfig($this);
    });
});