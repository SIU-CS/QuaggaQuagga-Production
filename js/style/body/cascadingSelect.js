'use strict';

define(['require', 'jquery'], function(require) {
    var $, jquery;
    jquery = $ = require('jquery');

    $(document).ready(function() {
        var key = ".JSM-checkbox";
        $(key).click(function(event) {
            event.stopPropagation(); // keep the drop down from expanding
            var $cbox = $(this);
            if (this.checked) {
                RecursivlyCheckParents($cbox.parent().parent())
            } else {

            }
        });
        /**
         * 
         * @param {Jquery element} $listGroup   
         */
        function RecursivlyCheckParents($listGroup) {
            var $cboxes = $listGroup.children(".list-group-item ").find(key);

            if($cboxes.length != 0 && $cboxes.length == $cboxes.filter(":checked").length) {
                var id = $listGroup.prop("id");
                $listGroup.siblings('a[href="#' + id + '"] ').find(key).prop('checked', true);
                RecursivlyCheckParents($listGroup.parent());
            }
        }

        function RecurseivlyUncheckParents($ele) {

        }
        function RecursivlyCheckChildren($ele) {

        }
        function RecursivlyUncheckChildren($ele) {

        }
    });
});