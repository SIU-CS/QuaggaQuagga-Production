define(['require', 
        'jquery', 
        'utility/getMultiselectName', 
        'data_store/get', 'data_store/set'], 
    function(require) {
    'use strict';

    var $, jquery;
    jquery = $ = require('jquery');
    var getMultiselectorName = require('utility/getMultiselectName');
    var getData = require('data_store/get');
    var setData = require('data_store/set');

    var keyCheckbox = "input.JSM-checkbox:checkbox";
    var keyItem = ".list-group-item";
    var keyNonheaders = keyItem + ":not(.JSM-item-header)";
    var keyHeaders = keyItem + ".JSM-item-header";

    /**
     * Sets the on click event for the multiselect
     * @param {jquery element} $multiselect the targeted multiselect  
     */
    function registerCheckboxClick(name, $multiselect) {
        if (name == null) return;

        var selectItem = function(that, event) {
            $(that).parents(".list-group").each(function() {
                var $this = $(this);
                var id = $this.prop("id");
                var header = $this.siblings('[data-target="#'+id+'"]');
                var headerCheckbox = header.find(keyCheckbox);
                if ($this.find(keyNonheaders + " " + keyCheckbox).length === 
                    $this.find(keyNonheaders + " " + keyCheckbox + ":checked").length) {
                    if (headerCheckbox.prop('checked') != true)
                        headerCheckbox.prop('checked', true).change();
                } else {
                    if (headerCheckbox.prop('checked') != false)
                        headerCheckbox.prop('checked', false).change();
                }
            });
        };

        var selectHeader = function(that, event) {
            var $this = $(that);
            var isChecked = $this.is(':checked') === true;
            var item = $this.parent();
            var listId = item.data("target");
            var list = $(listId);
            var setItems = null;
            if (isChecked) {
                setItems = list.find(keyItem + " " + keyCheckbox + ":not(:checked)");
            } else {
                setItems = list.find(keyItem + " " + keyCheckbox + ":checked"); 
            }
            if (setItems != null)
                setItems.prop('checked', isChecked).change();
            selectItem(that, event);
        };

        $multiselect.on("click", keyHeaders + " " + keyCheckbox, function(event) {
            
            selectHeader(this, event);
            // keep the drop down from expanding
            event.stopPropagation();
        });
        $multiselect.on("keypress", keyHeaders + " " + keyCheckbox, function(event) {
            if (event.keyCode == 13)
                selectHeader(this, event);
        });

        
        $multiselect.on("click", keyNonheaders + " " + keyCheckbox, function(event) {
            selectItem(this, event);
        });

        $multiselect.on("keypress", keyHeaders + " " + keyCheckbox, function(event) {
            if (event.keyCode == 13)
                selectItem(this, event);
        });

        var HeaderItems = $multiselect.find(keyHeaders).has(keyCheckbox + ":checked");
        HeaderItems.each(function() {
            $($(this).data("target")).find(keyCheckbox + ":not(:checked)").trigger("click");
        });
        $multiselect.find(keyItem + " " + keyCheckbox + ":checked").change();
    }

    return registerCheckboxClick;
});