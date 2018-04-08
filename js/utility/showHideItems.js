
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

                }
            }
        }

        function showItem(item) {
            if (item['@element'] != null) {
                item['@element'].show();
                if (item['@isHeader']) {

                }
            }
        }
    });
