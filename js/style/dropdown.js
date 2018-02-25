define(["require", "jquery"], function (require) {
    var $ = require("jquery");
    // dropdown is the element that will have its icon switched
    $(document).ready(function() {
        var $ele = $(".collapsableIcon");
        $ele.on('click', function() {
            $(this).find('.fa-chevron-right, .fa-chevron-down')
            .toggleClass('fa-chevron-right')
            .toggleClass('fa-chevron-down');
            $(this)
            .toggleClass('fa-chevron-right')
            .toggleClass('fa-chevron-down');
        });
    });
});