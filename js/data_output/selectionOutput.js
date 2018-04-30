define(['require', 'jquery', 'data_store/get'], function (require) {
    'use strict';
    
    var $, jquery;
    jquery = $ = require('jquery');
    var get = require('data_store/get');


    function handler($multiselect, onSelect, onDeselect) 
    {
        if(onSelect != null || onDeselect != null)
        {
            $multiselect.on("change", ".JSM-list .JSM-checkbox", function() 
            {
                var $this = $(this);
                var name = $this.attr("name");
                var value = $this.attr("value");
                if (name != null && value != null) {
                    var rv = { name: name, value: value }
                    if (this.checked) 
                    {
                        onSelect(rv);
                    } else 
                    {
                        onDeselect(rv);
                    }
                }
            });
        }
        else
        {
            console.warn("The notification function which you defined is null.");
        }
    }
    return handler;

});