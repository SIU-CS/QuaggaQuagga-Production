
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
                    $(item['@element'].data('target')).css({"display": "none"});
                }
            }
        }

        function showItem(item) {
            if (item['@element'] != null) {
                item['@element'].show();
                if (item['@isHeader']) {
                    $(item['@element'].data('target')).css({"display": ""});
                }
            }
        }

        function showAllChildren(item) {
            if (item != null && item['@isHeader']) {
                for (var i = 0; i < item['@children'].length; i += 1) {
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
