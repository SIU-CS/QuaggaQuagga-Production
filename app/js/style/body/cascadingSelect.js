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

        $multiselect.on('click', keyCheckbox, function() {
            event.stopPropagation(); // keep the drop down from expanding
        });

        $multiselect.on("change", keyNonheaders + " " + keyCheckbox, function() {
            $(this).parents(".list-group").each(function() {
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
        });

        var selectHeader = function(event) {
            var $this = $(this);
            var isChecked = $this.is(':checked');
            var item = $this.parent();
            var listId = item.data("target");
            var list = $(listId);
            var setItems = null;
            if (isChecked) {
                setItems = list.find(keyNonheaders + " " + keyCheckbox + ":not(checked)");
            } else {
                setItems = list.find(keyNonheaders + " " + keyCheckbox + ":checked");
            }
            if (setItems != null) setItems.prop('checked', isChecked).change();
        };


        $multiselect.on("click", keyHeaders + " " + keyCheckbox, selectHeader);
        $multiselect.on("keypress", keyHeaders + " " + keyCheckbox, function(event) {
            if (event.keyCode == 13)
                selectHeader(event);
        });

        var HeaderItems = $multiselect.find(keyHeaders).has(keyCheckbox + ":checked");
        HeaderItems.each(function() {
            $($(this).data("target")).find(keyNonheaders + " " + keyCheckbox).prop('checked', true);
        });
        $multiselect.find(keyItem).find(keyCheckbox + ":checked").change();
    }

    return registerCheckboxClick;
});