define(["require", "jquery"], function (require) {
    var $ = require("jquery");
    // dropdown is the element that will have its icon switched
    $(document).ready(function() {
        $(".collapsableIcon").on('click', function() {
            var $ele = $(this)
            $ele.find('.fa-chevron-right, .fa-chevron-down')
                .toggleClass('fa-chevron-right')
                .toggleClass('fa-chevron-down');
            if ($ele.hasClass('fa-chevron-right') || $ele.hasClass('fa-chevron-down'))
                $ele.toggleClass('fa-chevron-right').toggleClass('fa-chevron-down');
        });
    });
});