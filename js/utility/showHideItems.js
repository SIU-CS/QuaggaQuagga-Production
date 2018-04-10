
define(['require',
    'jquery'
],
    function (require, $) {
        'use strict';
        var jquery = $;

        function hideItem(item) {
            if (item['@element'] != null) {
                item['@element'].hide();
                if (item['@isHeader']) {
                    $(item['@element'].data('target')).collapse(true);
                }
            }
        }

        function showItem(item) {
            if (item['@element'] != null) {
                item['@element'].show();
                if (item['@isHeader']) {
                    $(item['@element'].data('target')).collapse(true);
                }
            }
        }

        function showAllChildren(item) {
            if (item != null && item['@isHeader']) {
                for (var i in item['@children']) {
                    showItem(item['@children'][i]);
                    showAllChildren(item['@children'][i]);
                }
            }
        }



        return {
            hideItem: hideItem,
            showItem: showItem,
            showAllChildren: showAllChildren
        };
    });
