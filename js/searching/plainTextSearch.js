'use strict';

define(['require', 'jquery', 'data_store/get'], function (require) {
    var $, jquery;
    jquery = $ = require('jquery');
    var get = require('data_store/get');

    var plainTextSearch = function (selectionEl, str, isCaseSensitive) {
        if (typeof isCaseSensitive == 'undefined')
            isCaseSensitive = true;
        if (isCaseSensitive)
            str = str.toLowerCase();

        var $el = $(selectionEl);

        $el.children(".list-group-item");
        $el.val('');
        $el.children(".list-group-item").hide();

        $el.children(".list-group-item").filter(function () {
            var text = $(this).prop("value").text();
            var searchableText = $(this).prop("data-searchable").text();
            if (isCaseSensitive) {
                text = text.toLowerCase();
                searchableText = searchableText.toLowerCase();
            }

            if (text.indexOf(str) > -1 || searchableText.indexOf(str) > -1)
                return true;

            return false;
        }).show();

    };
    $(document).ready(function () {
        var timeout;
        $(".JSM-searchbar").on("keyup", function () {
            var userInput = $(".JSM-searchbar").val();
            window.clearTimeout(timeout);
            timeout = window.setTimeout(function () {
                plainTextSearch($(".JSM-list"), userInput, true);
            }, 500);

        });
    });
});