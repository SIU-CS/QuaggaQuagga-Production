'use strict';

define(['require', 'jquery'], function(require) {
    var $, jquery;
    jquery = $ = require('jquery');



    function textSearch() {
        var input, filter, items, a, i;
        input = document.getElementsByClassName("list-group-item");
        filter = input.value.toUpperCase();
        items = document.getElementsByClassName("list-group");

        for (i = 0; i < items.length; i++) {
            a = items[i].getElementsByTagName("a")[0];
            if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
                items[i].style.display = "";
            } else {
                items[i].style.display = "none";
            }
        }
    }
});


